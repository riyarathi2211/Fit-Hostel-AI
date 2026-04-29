// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Get the token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Matches the key you used in loginUser
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default protect;