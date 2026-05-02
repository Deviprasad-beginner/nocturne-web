import { defineConfig } from "vite";
// Forced restart trigger for storage fix
import react from "@vitejs/plugin-react";
import path from "path";
import sitemap from "vite-plugin-sitemap";

// Publicly-accessible routes for sitemap generation
// Keep this in sync with sitemap.routes.ts
// ⚠️  Do NOT include: google verification files, /auth, user-only routes
const publicRoutes = [
  "/",
  "/diaries",
  "/whispers",
  "/mind-maze",
  "/night-circles",
  "/midnight-cafe",
  "/music-mood",
  "/nightly-reflection",
  "/night-conversations",
  "/digital-journals",
  "/mindful-spaces",
  "/3am-founder",
  "/starlit-speaker",
  "/moon-messenger",
  "/night-thoughts",
  "/read-card",
  "/read-alone",
  "/read-tonight",
  "/privacy",
  "/help",
];

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: "https://nocturnesocial.in",
      dynamicRoutes: publicRoutes,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date(),
      outDir: path.resolve(import.meta.dirname, "dist/public"),
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
