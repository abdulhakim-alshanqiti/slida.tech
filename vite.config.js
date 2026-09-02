import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

export default defineConfig({
  base: "./",
  publicDir: "public",
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    sourcemap: false,
  },
  plugins: [
    VitePWA({
      // Installable but explicitly NOT offline-capable / no caching
      registerType: "autoUpdate",
      injectRegister: "auto",
      // Disable PWA assets generation (we provide our own icons)
      pwaAssets: { disabled: true },
      // Don't auto-add manifest icons to the precache - we want 0 precached assets
      includeManifestIcons: false,
      // No precaching, no runtime caching, no offline fallback
      workbox: {
        globPatterns: [],
        navigateFallback: null,
        navigateFallbackAllowlist: [],
        cleanupOutdatedCaches: false,
        runtimeCaching: [],
        // extra safety: never cache due to size limit 0
        maximumFileSizeToCacheInBytes: 0,
      },
      includeAssets: [],
      manifest: {
        name: "slida.tech - Markdown Slide Maker",
        short_name: "Slida",
        description: "Markdown -> interactive Reveal.js presentations",
        theme_color: "#040810",
        background_color: "#040810",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        orientation: "any",
        scope: "./",
        start_url: "./",
        categories: ["productivity", "education"],
        lang: "en",
        dir: "auto",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [],
        shortcuts: [],
      },
      devOptions: {
        enabled: false,
        suppressWarnings: true,
      },
    }),
    // Enforce "no cache / no offline" - strip any precache entries the PWA plugin may inject
    // (e.g. manifest.webmanifest). The SW will still register for installability but will
    // not cache anything and will always go to network.
    {
      name: "pwa-no-cache-cleanup",
      apply: "build",
      enforce: "post",
      closeBundle: {
        sequential: true,
        handler() {
          const swPath = "dist/sw.js";
          if (!existsSync(swPath)) return;
          let content = readFileSync(swPath, "utf-8");
          const original = content;
          content = content.replace(/precacheAndRoute\(\s*\[[\s\S]*?\]\s*,\s*\{\}\)/, "precacheAndRoute([], {})");
          if (content === original) {
            content = content.replace(/precacheAndRoute\(\s*\[[\s\S]*?\]\s*\)/, "precacheAndRoute([])");
          }
          if (content !== original) {
            writeFileSync(swPath, content, "utf-8");
            console.log("[pwa-no-cache-cleanup] stripped precache entries from sw.js for no-cache / no-offline mode");
          }
        },
      },
      writeBundle: {
        sequential: true,
        handler() {
          const swPath = "dist/sw.js";
          if (!existsSync(swPath)) return;
          let content = readFileSync(swPath, "utf-8");
          const original = content;
          content = content.replace(/precacheAndRoute\(\s*\[[\s\S]*?\]\s*,\s*\{\}\)/, "precacheAndRoute([], {})");
          if (content === original) {
            content = content.replace(/precacheAndRoute\(\s*\[[\s\S]*?\]\s*\)/, "precacheAndRoute([])");
          }
          if (content !== original) {
            writeFileSync(swPath, content, "utf-8");
            console.log("[pwa-no-cache-cleanup:writeBundle] stripped precache");
          }
        },
      },
      generateBundle(_, bundle) {
        const sw = bundle["sw.js"];
        if (sw) {
          let content = sw.type === "asset" ? sw.source.toString() : sw.code || "";
          const original = content;
          content = content.replace(/precacheAndRoute\(\s*\[[\s\S]*?\]\s*,\s*\{\}\)/, "precacheAndRoute([], {})");
          if (content === original) content = content.replace(/precacheAndRoute\(\s*\[[\s\S]*?\]\s*\)/, "precacheAndRoute([])");
          if (content !== original) {
            if (sw.type === "asset") sw.source = content;
            else sw.code = content;
            console.log("[pwa-no-cache-cleanup:generateBundle] stripped precache");
          }
        }
      },
    },
  ],
});
