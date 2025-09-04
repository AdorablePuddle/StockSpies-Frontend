import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // Simple dev-only mock endpoint so frontend can POST an image
    // and receive a template response until the backend is ready.
    {
      name: "mock-api",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith("/mock/upload") && req.method === "POST") {
            // We ignore the incoming body; just return a stubbed response.
            const response = {
              stock_percentage: 0.42,
              type: "apple",
              // Optional: include a timestamp to see fresh responses
              ts: new Date().toISOString(),
            };
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(response));
            return;
          }
          next();
        });
      },
    },
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
