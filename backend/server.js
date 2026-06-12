const path = require("path"); // new
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

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Configure CORS
const corsOrigin = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: corsOrigin.length === 1 ? corsOrigin[0] : corsOrigin,
    credentials: true,
  })
);

// --- Static Files ---
// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/sprints", sprintRoutes);

// Render Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Frontend Catch-All Route ---
// Handle any React frontend routing requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});
const PORT = process.env.PORT || 5001;

const start = async () => {
    await connectDB();
    await seedAdmin(); // ensure fixed admin exists on every boot
    app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
};

start();