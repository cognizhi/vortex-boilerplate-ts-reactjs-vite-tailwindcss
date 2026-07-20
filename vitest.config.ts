import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react-swc";

// Mirrors the subset of vite.config.ts needed to run app code under test:
// the React plugin for JSX, the `@` alias, and AutoImport so files that rely
// on it (e.g. `useState` with no import in src/pages) behave the same as in
// dev/build. Nitro, file-based routing, and asset plugins are intentionally
// left out — unit/integration/UI tests don't need a server or a router.
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: ["react", "react-router"],
      dts: "./auto-imports.d.ts",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    exclude: ["node_modules", "dist", ".output", "e2e"],
  },
});
