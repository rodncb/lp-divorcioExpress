import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/rd-station-api": {
        target: "https://api.rd.services",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rd-station-api/, ""),
      },
    },
  },
});
