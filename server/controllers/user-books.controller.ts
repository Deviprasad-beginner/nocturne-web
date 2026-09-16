/**
 * User Books Controller
 * Handles the Nocturne Gutenberg e-book library:
 *  - Gutendex search (proxied to avoid exposing external deps to client)
 *  - User library (CRUD on user_books table)
 *  - Reading progress (EpubCFI, debounced on client, written here)
 *  - EPUB streaming proxy — streams bytes directly from Gutenberg to the client
 *    WITHOUT loading the file into Node.js memory. Cache-Control ensures the
 *    browser caches the asset for a full year after the first load.
 */

import { Request, Response } from "express";
import { db } from "../db";
import { userBooks } from "@shared/schema";
import { eq, and } from "drizzle-orm";


const GUTENDEX_BASE = "https://gutendex.com/books";

/** Timeout-aware fetch for upstream calls */
async function fetchUpstream(url: string, timeoutMs = 20_000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { "User-Agent": "Nocturne/1.0 nocturne-app" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

// Simple in-memory cache for Gutendex searches (TTL: 24 hours)
// Gutendex results rarely change, and this makes our preset mood chips instant.
const searchCache = new Map<string, { timestamp: number, data: any }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const userBooksController = {

  /**
   * GET /api/v1/user-books/search?query=
   * Proxies to Gutendex and returns books that have an EPUB available.
   * Cached for 24 hours.
   */
  async search(req: Request, res: Response) {
    try {
      const query = ((req.query.query as string) || "").trim();
      if (!query) {
        return res.json({ success: true, data: [], count: 0 });
      }

      // 1. Check cache first
      const cached = searchCache.get(query);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.json(cached.data);
      }

      // 2. Fetch from upstream Gutendex
      const params = new URLSearchParams({ search: query, languages: "en" });
      const upstream = await fetchUpstream(`${GUTENDEX_BASE}?${params}`);
      if (!upstream.ok) {
        return res.status(502).json({ success: false, message: "Gutendex error" });
      }

      const data = await upstream.json() as { results?: any[]; count?: number };
      const results = (data.results ?? [])
        // Only include books that have a downloadable EPUB
        .filter((b: any) => {
          const formats: Record<string, string> = b.formats || {};
          return Object.keys(formats).some(k => k.includes("epub"));
        })
        .map((b: any) => {
          const formats: Record<string, string> = b.formats || {};
          const epubKey = Object.keys(formats).find(k => k.includes("epub"));
          const coverKey = Object.keys(formats).find(k =>
            k.includes("image") || k.includes("jpeg") || k.includes("jpg")
          );
          return {
            gutenbergId: b.id,
            title: b.title,
            author: b.authors?.[0]?.name ?? "Unknown",
            coverUrl: coverKey ? formats[coverKey] : null,
            epubUrl: epubKey ? formats[epubKey] : null,
            downloadCount: b.download_count ?? 0,
          };
        })
        .filter((b: any) => !!b.epubUrl);

      const responseData = { success: true, data: results, count: data.count ?? results.length };
      
      // 3. Save to cache
      searchCache.set(query, { timestamp: Date.now(), data: responseData });
      
      res.json(responseData);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },


  /**
   * GET /api/v1/user-books
   * Returns all books saved by the authenticated user.
   */
  async getLibrary(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const books = await db
        .select()
        .from(userBooks)
        .where(eq(userBooks.userId, userId))
        .orderBy(userBooks.createdAt);

      res.json({ success: true, data: books });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/v1/user-books/:id
   * Returns a single book from the user's library by its DB row id.
   */
  async getBook(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const bookId = parseInt(req.params.id, 10);
      if (isNaN(bookId)) return res.status(400).json({ error: "Invalid book id" });

      const [book] = await db
        .select()
        .from(userBooks)
        .where(and(eq(userBooks.id, bookId), eq(userBooks.userId, userId)));

      if (!book) return res.status(404).json({ error: "Book not found in your library" });

      res.json({ success: true, data: book });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },


  /**
   * POST /api/v1/user-books
   * Saves a Gutendex book to the user's library.
   * Body: { gutenbergId, title, author, coverUrl, epubUrl }
   */
  async addBook(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { gutenbergId, title, author, coverUrl, epubUrl } = req.body;
      if (!gutenbergId || !title || !epubUrl) {
        return res.status(400).json({ error: "gutenbergId, title, and epubUrl are required" });
      }

      // Prevent duplicates
      const [existing] = await db
        .select()
        .from(userBooks)
        .where(and(eq(userBooks.userId, userId), eq(userBooks.gutenbergId, gutenbergId)));

      if (existing) {
        return res.json({ success: true, data: existing, alreadySaved: true });
      }

      const [book] = await db
        .insert(userBooks)
        .values({ userId, gutenbergId, title, author, coverUrl, epubUrl })
        .returning();

      res.status(201).json({ success: true, data: book });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * PATCH /api/v1/user-books/:id/progress
   * Updates the EpubCFI reading position.
   * Body: { epubCfi: string }
   */
  async updateProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const bookId = parseInt(req.params.id, 10);
      const { epubCfi } = req.body;

      if (!epubCfi || typeof epubCfi !== "string") {
        return res.status(400).json({ error: "epubCfi string is required" });
      }

      const [updated] = await db
        .update(userBooks)
        .set({ currentCfi: epubCfi })
        .where(and(eq(userBooks.id, bookId), eq(userBooks.userId, userId)))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Book not found in your library" });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * DELETE /api/v1/user-books/:id
   * Removes a book from the user's library.
   */
  async removeBook(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const bookId = parseInt(req.params.id, 10);

      await db
        .delete(userBooks)
        .where(and(eq(userBooks.id, bookId), eq(userBooks.userId, userId)));

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/v1/user-books/proxy?epubUrl=
   * ─── EPUB Streaming Proxy ─────────────────────────────────────────────────────
   * Project Gutenberg blocks direct browser fetches via CORS.
   * This route fetches the EPUB server-side and streams it to the client.
   *
   * Key behaviors:
   *  - Disables gzip compression (binary EPUBs are already compressed; re-compressing
   *    corrupts them and wastes CPU).
   *  - Sets Cache-Control: public, max-age=31536000 so the browser caches for 1 year.
   *  - Uses a Buffer+write approach for maximum compatibility across Node versions.
   */
  async proxyEpub(req: Request, res: Response) {
    try {
      const epubUrl = req.query.epubUrl as string;
      if (!epubUrl) {
        return res.status(400).json({ error: "epubUrl query param is required" });
      }

      // Security: only allow gutenberg.org URLs
      let parsed: URL;
      try {
        parsed = new URL(epubUrl);
      } catch {
        return res.status(400).json({ error: "Invalid URL" });
      }

      if (!parsed.hostname.endsWith("gutenberg.org") && !parsed.hostname.endsWith("gutenberg.net.au")) {
        return res.status(403).json({ error: "Only Project Gutenberg URLs are allowed" });
      }

      // Tell compression middleware to skip this response (EPUBs are already zipped)
      (res as any).noCompression = true;
      res.setHeader("X-No-Compression", "1");

      const upstream = await fetchUpstream(epubUrl, 30_000);
      if (!upstream.ok) {
        return res.status(502).json({ error: `Upstream returned ${upstream.status}` });
      }

      // Read the full body into a buffer — reliable across all Node.js versions
      const arrayBuffer = await upstream.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Set all headers — must be before write() calls
      res.setHeader("Content-Type", "application/epub+zip");
      // Override any global no-store middleware that might have run
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Length", buffer.byteLength);

      res.status(200).end(buffer);
    } catch (err: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  },
};

