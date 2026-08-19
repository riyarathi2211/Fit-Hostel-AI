// backend/routes/progressRoutes.js
import express from 'express';
import User from '../models/User.js';
import protect from '../middleware/authMiddleware.js'; // Adjust path if needed

const router = express.Router();

// @route   POST /api/progress/daily-checkin
// @access  Private
router.post('/daily-checkin', protect, async (req, res) => {
  try {
    const { weight, height, feedback } = req.body;
    
    // Uses req.userId attached by your protect middleware
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();

    // 1. Update User Current Stats
    if (weight) user.weight = Number(weight);
    if (height) user.height = Number(height);
    user.lastCheckInDate = now;

    // 2. Calculate 1-Day Targets (Mifflin-St Jeor Equation)
    const genderOffset = user.gender?.toLowerCase() === 'female' ? -161 : 5;
    let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * (user.age || 24)) + genderOffset;
    let targetCalories = Math.round(bmr * 1.4);
    let proteinRatio = 1.8;

    // Aligned to 'user.target' from your User schema
    const goal = user.target?.toLowerCase() || '';
    if (goal.includes('gain') || goal.includes('bulk')) {
      targetCalories += 400;
      proteinRatio = 2.2;
    } else if (goal.includes('loss') || goal.includes('cut')) {
      targetCalories -= 400;
      proteinRatio = 2.0;
    }

    // Adapt intensity based on feedback
    let exerciseVolumeAdjustment = 0;
    if (feedback === 'Too Easy') exerciseVolumeAdjustment = 10;
    if (feedback === 'Too Heavy') exerciseVolumeAdjustment = -10;

    const targetProtein = Math.round(user.weight * proteinRatio);
    const targetCarbs = Math.round((targetCalories * 0.45) / 4);

    // 3. Save to checkInHistory
    const newEntry = {
      date: now,
      weight: user.weight,
      height: user.height,
      feedback,
      caloricTarget: targetCalories,
      proteinTarget: targetProtein,
      carbsTarget: targetCarbs
    };
    user.checkInHistory.push(newEntry);

    // 4. Synchronize with monthlyWeightLogs (For Dynamic Line Chart Rendering)
    const monthLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    user.monthlyWeightLogs.push({
      weight: user.weight,
      date: now,
      monthLabel
    });

    await user.save();

    res.status(200).json({
      message: "1-Day Check-in Complete!",
      summary: newEntry,
      adjustedPlan: {
        targetCalories,
        targetProtein,
        targetCarbs,
        exerciseVolumeAdjustment
      }
    });
  } catch (err) {
    console.error("Error in daily check-in processing:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;