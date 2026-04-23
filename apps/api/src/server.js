const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { getDb, closeDb } = require("./db");

const PORT = process.env.PORT || 4000;

function createApp() {
  const app = express();
  app.use(cors({ origin: true, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", routes);
  app.get("/", (req, res) => {
    res.json({ name: "SYNTRA Pro API", version: "2.0.0", company: "Triune Dynamic Limited", endpoints: { health: "GET /api/health", register: "POST /api/auth/register", login: "POST /api/auth/login", me: "GET /api/auth/me", saveLogs: "POST /api/logs", getLogs: "GET /api/logs", getLogByDate: "GET /api/logs/:date", deleteLog: "DELETE /api/logs/:date", insights: "GET /api/insights" } });
  });
  return app;
}

if (require.main === module) {
  const app = createApp();
  getDb();
  const server = app.listen(PORT, "0.0.0.0", () => { console.log(`SYNTRA Pro API running on http://0.0.0.0:${PORT}`); });
  process.on("SIGINT", () => { closeDb(); server.close(); process.exit(0); });
  process.on("SIGTERM", () => { closeDb(); server.close(); process.exit(0); });
}

module.exports = { createApp };
