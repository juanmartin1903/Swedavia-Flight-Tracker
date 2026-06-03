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
  app.get("/api/flights/:airport", async (req, res) => {
    const { airport } = req.params;
    const { odata } = req.query; // Capture arbitrary OData strings (FR-03)
    const apiKey = process.env.SWEDAVIA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "SWEDAVIA_API_KEY is not configured in environment variables." });
    }

    try {
      // Swedavia FlightInfo API v2 URL pattern
      // Example: https://api.swedavia.se/flightinfo/v2/{airport}/departures
      const baseUrl = `https://api.swedavia.se/flightinfo/v2/${airport}/departures`;
      const url = odata ? `${baseUrl}?${odata}` : baseUrl;

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "Ocp-Apim-Subscription-Key": apiKey
        },
        // FR-07: Network Latency Mitigation (Timeout)
        signal: AbortSignal.timeout(10000) 
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Swedavia API responded with ${response.status}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch flight data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
