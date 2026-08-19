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

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/user", authRoutes); // Added: Mount auth/user routes under /api/user as well
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