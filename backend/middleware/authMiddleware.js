// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract and trim token string safely
      token = req.headers.authorization.split(' ')[1]?.trim();

      if (!token) {
        return res.status(401).json({ message: "Not authorized, token missing after Bearer scheme" });
      }

      // Verify token with secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Support common JWT payload key naming conventions (id, _id, or userId)
      req.userId = decoded.userId || decoded.id || decoded._id;

      if (!req.userId) {
        console.error("Token decoded successfully, but no user identifier (id/_id/userId) was found in payload:", decoded);
        return res.status(401).json({ message: "Not authorized, invalid token payload" });
      }

      return next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed or expired" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no Bearer token provided" });
};

export default protect;