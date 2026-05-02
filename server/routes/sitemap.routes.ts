/**
 * sitemap.routes.ts
 *
 * Serves:
 *   GET /sitemap.xml       — Clean XML sitemap for search engines
 *   GET /robots.txt        — Crawler rules with explicit disallow list
 *   GET /.well-known/security.txt — Security contact disclosure
 *
 * Registered before any SPA catch-all so these always return correct
 * content types regardless of CDN/proxy rewrites.
 */

import { Router, type Request, type Response } from "express";

const router = Router();

const BASE_URL = "https://nocturnesocial.in";

interface SitemapEntry {
  path: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

const routes: SitemapEntry[] = [
  { path: "/",                    changefreq: "daily",   priority: 1.0 },
  { path: "/diaries",             changefreq: "daily",   priority: 0.9 },
  { path: "/whispers",            changefreq: "daily",   priority: 0.9 },
  { path: "/night-thoughts",      changefreq: "daily",   priority: 0.8 },
  { path: "/mind-maze",           changefreq: "weekly",  priority: 0.8 },
  { path: "/night-circles",       changefreq: "weekly",  priority: 0.8 },
  { path: "/midnight-cafe",       changefreq: "weekly",  priority: 0.8 },
  { path: "/music-mood",          changefreq: "weekly",  priority: 0.8 },
  { path: "/nightly-reflection",  changefreq: "weekly",  priority: 0.8 },
  { path: "/night-conversations", changefreq: "weekly",  priority: 0.8 },
  { path: "/digital-journals",    changefreq: "weekly",  priority: 0.8 },
  { path: "/mindful-spaces",      changefreq: "weekly",  priority: 0.8 },
  { path: "/3am-founder",         changefreq: "weekly",  priority: 0.7 },
  { path: "/starlit-speaker",     changefreq: "weekly",  priority: 0.7 },
  { path: "/moon-messenger",      changefreq: "weekly",  priority: 0.7 },
  { path: "/read-card",           changefreq: "weekly",  priority: 0.7 },
  { path: "/read-alone",          changefreq: "weekly",  priority: 0.7 },
  { path: "/read-tonight",        changefreq: "weekly",  priority: 0.7 },
  { path: "/privacy",             changefreq: "monthly", priority: 0.4 },
  { path: "/help",                changefreq: "monthly", priority: 0.5 },
];

// ── /sitemap.xml ─────────────────────────────────────────────────────────────

function buildSitemapXml(): string {
  const lastmod = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const urlEntries = routes
    .map(
      ({ path, changefreq, priority }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

router.get("/sitemap.xml", (_req: Request, res: Response) => {
  const xml = buildSitemapXml();
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
  res.status(200).send(xml);
});

// ── /robots.txt ───────────────────────────────────────────────────────────────

const ROBOTS_TXT = `User-agent: *
Allow: /

# Public feature pages — allow all crawlers
Allow: /diaries
Allow: /whispers
Allow: /night-thoughts
Allow: /mind-maze
Allow: /night-circles
Allow: /midnight-cafe
Allow: /music-mood
Allow: /nightly-reflection
Allow: /3am-founder
Allow: /starlit-speaker
Allow: /moon-messenger
Allow: /night-conversations
Allow: /digital-journals
Allow: /mindful-spaces
Allow: /read-card
Allow: /read-alone
Allow: /read-tonight
Allow: /privacy
Allow: /help

# Private / user-specific routes — no indexing
Disallow: /settings
Disallow: /profile
Disallow: /notifications
Disallow: /first-night
Disallow: /auth
Disallow: /login

# API routes — never index
Disallow: /api/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

router.get("/robots.txt", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(ROBOTS_TXT);
});

// ── /.well-known/security.txt ─────────────────────────────────────────────────

const SECURITY_TXT = `Contact: mailto:security@nocturnesocial.in
Preferred-Languages: en
Canonical: ${BASE_URL}/.well-known/security.txt
Policy: ${BASE_URL}/privacy
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Acknowledgments: ${BASE_URL}/help
`;

router.get("/.well-known/security.txt", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(SECURITY_TXT);
});

export default router;
