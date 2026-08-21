// import dns from 'dns';
// dns.setDefaultResultOrder('ipv4first');
// dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes Imports
import authRoutes from "./routes/auth.js";
import workoutRoutes from "./routes/workout.js";
import dietRoutes from "./routes/diet.js";
import progressRoutes from "./routes/progress.js";

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Allowed explicit domains
const allowedOrigins = [
  "https://fit-hostel-ai.vercel.app",
  "http://localhost:5173"
];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman, mobile apps) or matching Vercel/Local origins
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/user", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/progress", progressRoutes);

// Root Health Check Route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});