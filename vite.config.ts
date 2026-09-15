/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
  build: { target: "esnext" },
  server: {
    proxy: {
      // Proxied as-is (no rewrite): the backend also serves the API under
      // /v1 in production (Apache proxies it there), so the frontend always
      // calls /v1/... directly, in dev and prod alike.
      "/v1": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
