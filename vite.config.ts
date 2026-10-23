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
  "/feed",
  "/whispers",
  "/diaries",
  "/night-thoughts",
  "/sanctuary",
  "/resonance",
  "/explore",
  "/mind-maze",
  "/night-circles",
  "/midnight-cafe",
  "/music-mood",
  "/nightly-reflection",
  "/night-conversations",
  "/digital-journals",
  "/mindful-spaces",
  "/starlit-speaker",
  "/moon-messenger",
  "/library",
  "/read-card",
  "/read-alone",
  "/read-tonight",
  "/nightcap-studio",
  "/about",
  "/guidelines",
  "/help",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/contact",
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
    // Proxy /api to the Express backend so Vite and the backend can run
    // on different ports in development without CORS/ERR_CONNECTION_REFUSED.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
}); 
