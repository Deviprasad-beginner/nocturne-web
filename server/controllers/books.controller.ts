import { Request, Response } from "express";

const GUTENDEX_BASE = "https://gutendex.com/books";

/** Helper: fetch with a manual timeout (compatible with all Node.js versions) */
async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<globalThis.Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Nocturne/1.0 (contact@example.com)" },
            signal: controller.signal,
        });
        return res;
    } finally {
        clearTimeout(timer);
    }
}

/** Simple in-memory cache for API responses */
const apiCache = new Map<string, { data: any, expiresAt: number }>();

async function fetchWithCache(url: string, ttlMs = 1000 * 60 * 60 * 12) { // 12 hour cache by default
    const now = Date.now();
    const cached = apiCache.get(url);
    if (cached && cached.expiresAt > now) {
        return cached.data;
    }

    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    
    apiCache.set(url, { data, expiresAt: now + ttlMs });
    return data;
}

export const booksController = {
    /** GET /api/v1/books/search?query=&page=&topic= */
    async search(req: Request, res: Response) {
        try {
            const { query = "", page = "1", topic = "" } = req.query as Record<string, string>;
            const params = new URLSearchParams({ languages: "en", page });
            if (query.trim()) params.set("search", query.trim());
            if (topic.trim()) params.set("topic", topic.trim());

            const url = `${GUTENDEX_BASE}?${params}`;
            const data = await fetchWithCache(url, 1000 * 60 * 15); // 15 mins for search
            res.json({ success: true, data: data.results ?? [], count: data.count, next: data.next });
        } catch (err: any) {
            res.status(502).json({ success: false, message: err.message });
        }
    },

    /** GET /api/v1/books/featured — curated nightly reading list */
    async featured(req: Request, res: Response) {
        try {
            // Use `search` param (verified working) instead of `topic` which only works
            // for exact Gutenberg bookshelf names. Pick nightly term by day of year.
            const queries = ["philosophy", "meditation", "poetry", "stoic", "wisdom"];
            const dayOfYear = Math.floor(
                (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
            );
            const query = queries[dayOfYear % queries.length];

            const url = `${GUTENDEX_BASE}?search=${encodeURIComponent(query)}&languages=en&page=1`;
            const data = await fetchWithCache(url); // 12 hours
            res.json({ success: true, data: (data.results ?? []).slice(0, 12), topic: query });
        } catch (err: any) {
            res.status(502).json({ success: false, message: err.message });
        }
    },

    /** GET /api/v1/books/:id — single book metadata */
    async getBook(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = await fetchWithCache(`${GUTENDEX_BASE}/${id}`);
            res.json({ success: true, data });
        } catch (err: any) {
            res.status(502).json({ success: false, message: err.message });
        }
    },

    /** GET /api/v1/books/openlibrary/search?query= */
    async openLibrarySearch(req: Request, res: Response) {
        try {
            const query = (req.query.query as string) || "";
            if (!query.trim()) {
                res.json({ success: true, data: [] });
                return;
            }

            // Fetch from Open Library API
            const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=12&fields=key,title,author_name,cover_i,first_publish_year,availability`;
            const data = await fetchWithCache(url, 1000 * 60 * 60); // 1 hour for OpenLibrary search

            res.json({ success: true, data: data.docs ?? [] });
        } catch (err: any) {
            res.status(502).json({ success: false, message: err.message });
        }
    }
};

