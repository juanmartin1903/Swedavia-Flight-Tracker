import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check (FR-04)
  app.get("/api/health", (req, res) => {
    const hasKey = !!process.env.SWEDAVIA_API_KEY;
    res.json({ 
      status: "ok", 
      apiConfigured: hasKey,
      timestamp: new Date().toISOString()
    });
  });

  // Swedavia Proxy (FR-02, FR-03, FR-08)
  app.get("/api/flights/:airport/:type", async (req, res) => {
    const { airport, type } = req.params; // type is 'arrivals' or 'departures'
    const { odata } = req.query; 
    const apiKey = process.env.SWEDAVIA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "SWEDAVIA_API_KEY is not configured in environment variables." });
    }

    try {
      const swedenDate = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
      
      // Prioritize the pattern from the documentation provided by the user
      const patterns = [
        `https://api.swedavia.se/flightinfo/v2/${airport}/${type}/${swedenDate}`,
        `https://api.swedavia.se/flightinfo/v2/flights/${type}/${airport}/${swedenDate}`,
        `https://api.swedavia.se/flightinfo/v2/flights/${airport}/${type}/${swedenDate}`,
        `https://api.swedavia.se/flightinfo/v2/${airport}/${type}`,
        `https://api.swedavia.se/flightinfo/v2/flights/${type}/${airport}`
      ];

      let lastError: any = null;
      console.log(`[Swedavia Proxy] Request: ${airport} ${type} on ${swedenDate}`);

      for (const baseUrl of patterns) {
        const url = odata ? `${baseUrl}?${odata}` : baseUrl;
        console.log(`[Swedavia Proxy] Trying: ${url}`);

        try {
          const response = await fetch(url, {
            headers: {
              "Accept": "application/json",
              "Ocp-Apim-Subscription-Key": apiKey
            },
            signal: AbortSignal.timeout(8000) 
          });

          const status = response.status;
          if (response.ok) {
            const data = await response.json();
            console.log(`[Swedavia Proxy] SUCCESS: ${url}`);
            return res.json(data);
          }

          if (status !== 404 && status !== 401) {
            const errorText = await response.text();
            lastError = { status, errorText, url };
          } else {
            lastError = { status, url };
          }
        } catch (err: any) {
          lastError = { error: err.message, url };
        }
      }

      return res.status(404).json({ 
        error: "Flight resource not found", 
        details: lastError 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === "production";
  console.log(`Starting server in ${isProd ? 'production' : 'development'} mode (NODE_ENV: ${process.env.NODE_ENV})`);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
