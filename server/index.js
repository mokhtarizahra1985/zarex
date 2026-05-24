require("dotenv").config();
const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const session = require("express-session");
const routes = require("./routes");
const { ensureAdminCredentials } = require("./auth");
const { ROOT } = require("./store");

const PORT = Number(process.env.PORT) || 3000;
const app = express();

async function bootstrap() {
  await fs.mkdir(path.join(ROOT, "uploads"), { recursive: true });
  await ensureAdminCredentials();

  app.use(express.json({ limit: "2mb" }));
  app.use(
    session({
      name: "sunrad.sid",
      secret: process.env.SESSION_SECRET || "change-me-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
      }
    })
  );

  app.use(routes);
  app.use("/uploads", express.static(path.join(ROOT, "uploads")));
  app.use(express.static(ROOT));

  app.get("/admin", (_req, res) => {
    res.sendFile(path.join(ROOT, "admin", "index.html"));
  });
  app.get("/admin/login", (_req, res) => {
    res.sendFile(path.join(ROOT, "admin", "login.html"));
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  });

  app.listen(PORT, () => {
    console.log(`Sunrad server running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin/login`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
