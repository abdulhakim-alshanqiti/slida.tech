import { defineConfig } from "vite";

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
});
