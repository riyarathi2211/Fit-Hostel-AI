import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { getUserProfile } from '../controllers/authController.js';  
import protect from '../middleware/authMiddleware.js';
import { updateProfile } from '../controllers/authController.js'; // Import the new controller function
const router = express.Router();
router.get('/profile', protect, getUserProfile);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update-profile', protect, updateProfile);
export default router;