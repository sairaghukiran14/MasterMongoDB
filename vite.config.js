import { defineConfig } from "vite";

// Honor the PORT assigned by the preview harness (falls back to 5173 locally).
export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false
  }
});
