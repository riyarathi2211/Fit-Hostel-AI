import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  getMonthlyWeightHistory,
  logMonthlyWeight
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Match both route paths
router.put('/profile', protect, updateProfile);
router.put('/update-profile', protect, updateProfile); 

router.get('/monthly-weight-history', protect, getMonthlyWeightHistory);
router.post('/log-monthly-weight', protect, logMonthlyWeight);

export default router;