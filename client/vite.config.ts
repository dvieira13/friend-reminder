import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env vars based on current mode (development, production, etc.)
  //    modes are development, production, staging. all 3 load .env
  //    to specify certain data for certain modes, use .env.development for ex
  //process.cwd() looks for current working directory. /client/.env in this case
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          // Use VITE_API_URL from .env (fallback to localhost:4)
          target: env.VITE_API_URL || "http://localhost:4004",
          changeOrigin: true,
        },
      },
    },
  };
});
