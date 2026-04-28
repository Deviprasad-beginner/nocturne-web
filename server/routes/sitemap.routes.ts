/**
 * sitemap.routes.ts
 *
 * Dynamically generates a valid XML sitemap served at GET /sitemap.xml.
 * Registering this on the Express server means it wins over any SPA
 * catch-all rewrite on Firebase, Render, or Vercel — Google will always
 * receive real XML, never the React app's index.html.
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
  { path: "/auth",                changefreq: "monthly", priority: 0.5 },
  { path: "/diaries",             changefreq: "daily",   priority: 0.9 },
  { path: "/whispers",            changefreq: "daily",   priority: 0.9 },
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
  { path: "/night-thoughts",      changefreq: "daily",   priority: 0.8 },
  { path: "/read-card",           changefreq: "weekly",  priority: 0.7 },
  { path: "/read-alone",          changefreq: "weekly",  priority: 0.7 },
  { path: "/read-tonight",        changefreq: "weekly",  priority: 0.7 },
  { path: "/privacy",             changefreq: "monthly", priority: 0.4 },
  { path: "/help",                changefreq: "monthly", priority: 0.5 },
];

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
  // Cache for 24 h at the CDN level, revalidate in background
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
  res.status(200).send(xml);
});

export default router;
