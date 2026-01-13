import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: mode === "production" ? "/gyspace/" : "/",
    build: {
      outDir: "dist",
    },
    server: {
      port: 5173,
      host: "0.0.0.0",
      strictPort: true,
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      __APP_VERSION__: JSON.stringify(
        (() => {
          const now = new Date();
          // Always use UTC+7 for versioning
          const gmt7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
          const iso = gmt7.toISOString();
          const datePart = iso.slice(2, 10).replace(/-/g, "");
          const timePart = iso.slice(11, 16).replace(/:/g, "");
          return `${
            process.env.npm_package_version || "1.0"
          }.${datePart}.${timePart}`;
        })()
      ),
      __BUILD_DATE__: JSON.stringify(
        new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      ),
      __APP_NAME__: JSON.stringify("GYSpace"),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
