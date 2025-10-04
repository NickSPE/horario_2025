import react from "@vitejs/plugin-react-swc";
import { copyFileSync } from "fs";
import path from "path";
import { defineConfig, Plugin } from "vite";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      // Allow serving files from project root, client and shared folders.
      // The repo contains a top-level `index.html` so include the root ("./").
      allow: ["./", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    }
  },
  publicDir: 'public',
  plugins: [react(), expressPlugin(), serviceWorkerPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

function serviceWorkerPlugin(): Plugin {
  return {
    name: "service-worker-plugin",
    apply: "build",
    closeBundle() {
      // Copiar service-worker.js al directorio de build
      try {
        copyFileSync(
          path.resolve(__dirname, "public/service-worker.js"),
          path.resolve(__dirname, "dist/spa/service-worker.js")
        );
        console.log("✓ Service Worker copiado a dist/spa");
      } catch (error) {
        console.error("Error copiando Service Worker:", error);
      }
    },
  };
}
