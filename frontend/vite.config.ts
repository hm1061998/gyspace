import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "/",
    build: {
      outDir: "dist",
    },
    server: {
      port: 5173,
      host: "0.0.0.0",
      strictPort: true,
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      __APP_VERSION__: JSON.stringify(
        `${process.env.npm_package_version || "1.0"}.${new Date()
          .toISOString()
          .slice(2, 10)
          .replace(
            /-/g,
            ""
          )}.${new Date().getHours()}${new Date().getMinutes()}`
      ),
      __BUILD_DATE__: JSON.stringify(new Date().toLocaleString("vi-VN")),
      __APP_NAME__: JSON.stringify("GYSpace"),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
