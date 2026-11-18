import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset paths relative so the build works from a GitHub Pages
// sub-path (https://user.github.io/repo-name/) instead of giving a blank page.
export default defineConfig({
  plugins: [react()],
  base: "./",
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    env: { VITE_OPENWEATHER_API_KEY: "test-key" },
  },
});
