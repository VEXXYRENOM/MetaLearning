import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        // ── Meshy 3D API ──
        "/api/meshy": {
          target: "https://api.meshy.ai",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/meshy/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const key = env.MESHY_API_KEY;
              if (key) proxyReq.setHeader("Authorization", `Bearer ${key}`);
            });
          },
        },

        // ── Pollinations AI Image Generator ──
        "/api/pollinations": {
          target: "https://image.pollinations.ai",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/pollinations/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("referer", "https://image.pollinations.ai");
            });
          },
        },

        // ── Lexica.art AI Image Search ──
        "/api/lexica": {
          target: "https://lexica.art",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/lexica/, ""),
        },
      },
    },
  };
});
