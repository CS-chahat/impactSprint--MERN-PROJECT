require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { seedAdmin } = require("./controllers/authController");

// ── Route imports ──
const authRoutes = require("./routes/authRoutes");
const sprintRoutes = require("./routes/sprintRoutes");

const app = express();

// ── Middleware ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const corsOrigin = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: corsOrigin.length === 1 ? corsOrigin[0] : corsOrigin,
    credentials: true,
  })
);

// ── API Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/sprints", sprintRoutes);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 fallback ──
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error("💥", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start ──
const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();
  await seedAdmin(); // ensure fixed admin exists on every boot
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`🚀 Backend running on http://127.0.0.1:${PORT}`);
  });
};

start();
