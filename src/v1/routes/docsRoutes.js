import express from "express";
import { buildOpenApiSpec } from "../docs/openapi.js";

const router = express.Router();

router.get("/openapi.json", (_req, res) => {
  res.json(buildOpenApiSpec());
});

router.get("/", (_req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AYOMAMA API Docs</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
        />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: #f8fafc;
          }
          body {
            font-family: Arial, sans-serif;
            color: #0f172a;
          }
          .topbar {
            padding: 24px 24px 8px;
            background: linear-gradient(135deg, #eafffb 0%, #ffe7ef 100%);
            border-bottom: 1px solid #dbe7e3;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px;
            color: #153f3a;
          }
          .subtitle {
            margin: 0;
            color: #4b635f;
            font-size: 15px;
            line-height: 1.6;
          }
          .linkbar {
            margin-top: 14px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          .linkbar a {
            text-decoration: none;
            color: #006d5b;
            font-weight: 600;
            background: #ffffff;
            border: 1px solid #dbe7e3;
            border-radius: 999px;
            padding: 10px 14px;
          }
          #swagger-ui {
            max-width: 1400px;
            margin: 0 auto;
          }
          .swagger-ui .topbar {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: "/api/v1/docs/openapi.json",
              dom_id: "#swagger-ui",
              deepLinking: true,
              persistAuthorization: true,
              docExpansion: "list",
              displayRequestDuration: true,
              defaultModelsExpandDepth: 2,
              defaultModelExpandDepth: 2,
              tryItOutEnabled: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset,
              ],
              layout: "BaseLayout",
            });
          };
        </script>
      </body>
    </html>
  `);
});

export default router;
