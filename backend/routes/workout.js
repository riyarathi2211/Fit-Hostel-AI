import express from 'express';
import axios from 'axios';
import protect from '../middleware/authMiddleware.js';
import { generatePersonalizedPlan } from '../utils/planGenerator.js';
import User from '../models/User.js';
import mockExercises from '../data/exerciseMock.js'; // Offline fallback dataset

const router = express.Router();

// =========================================================================
// @route   POST /api/workout/search
// @access  Private
// =========================================================================
router.post('/search', protect, async (req, res) => {
  try {
    const { name, muscleGroup, type, difficulty } = req.body;
    console.log("Incoming Frontend Payload:", req.body);

    const apiParams = {};
    if (name && name.trim() !== "") apiParams.name = name.trim();
    if (muscleGroup && muscleGroup !== "all") apiParams.muscle = muscleGroup.toLowerCase();
    if (type && type !== "all") apiParams.type = type.toLowerCase();
    if (difficulty && difficulty !== "all") apiParams.difficulty = difficulty.toLowerCase();

    if (Object.keys(apiParams).length === 0) {
      apiParams.muscle = "biceps"; 
    }

    console.log("Forwarding parameters to RapidAPI-Ninjas:", apiParams);

    const response = await axios.get('https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises', {
      params: apiParams,
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      timeout: 8000
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ message: "No exercises matched your current filter criteria." });
    }

    const cleanResults = response.data.map(exercise => ({
      name: exercise.name,
      type: exercise.type,
      muscle: exercise.muscle,
      equipment: exercise.equipment || "Bodyweight",
      difficulty: exercise.difficulty,
      procedures: exercise.instructions 
        ? exercise.instructions.split('. ').filter(s => s.trim().length > 0)
        : ["Instructions not specified by database vendor."]
    }));

    res.json({ count: cleanResults.length, exercises: cleanResults });

  } catch (error) {
    console.error("RapidAPI Ninjas Gateway Crash:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Search proxy failed to map parameters through RapidAPI." });
  }
});

// =========================================================================
// @route   GET /api/workout/my-plan
// @access  Private
// @desc    Fetches the user's permanently stored workout routine instantly
// =========================================================================
router.get('/my-plan', protect, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User account profile not found." });
    }

    // Lazy Load Recovery: generate plan dynamically if missing
    if (!user.savedWorkoutPlan || !user.savedWorkoutPlan.schedule || user.savedWorkoutPlan.schedule.length === 0) {
      console.log(`[Lazy Load Recovery] Generating missing plan array for user: ${userId}`);
      const metrics = {
        age: user.age || 24,
        height: user.height || 175,
        weight: user.weight || 70,
        gender: user.gender || 'male',
        target: user.target || 'muscle gain'
      };
      
      user.savedWorkoutPlan = await generatePersonalizedPlan(metrics);
      await user.save();
    }

    res.json(user.savedWorkoutPlan);

  } catch (error) {
    console.error("Fetch Stored Plan Route Crash:", error.message);
    res.status(500).json({ message: "Failed to load saved workout plan matrix assets." });
  }
});

// =========================================================================
// @route   PUT /api/workout/rebuild-plan
// @access  Private
// @desc    Forces a complete recalculation of workout routine splits
// =========================================================================
router.put('/rebuild-plan', protect, async (req, res) => {
  try {
    const userId = req.userId;
    const { age, height, weight, gender, target } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Profile not found." });

    if (age) user.age = parseInt(age);
    if (height) user.height = parseInt(height);
    if (weight) user.weight = parseFloat(weight);
    if (gender) user.gender = gender.toLowerCase().trim();
    if (target) user.target = target.toLowerCase().trim();

    const metrics = {
      age: user.age,
      height: user.height,
      weight: user.weight,
      gender: user.gender,
      target: user.target
    };

    console.log(`[Manual Override Triggered] Re-generating a fresh plan routine asset for: ${userId}`);
    user.savedWorkoutPlan = await generatePersonalizedPlan(metrics);
    
    await user.save();
    res.json({ message: "Workout routine re-compiled successfully.", plan: user.savedWorkoutPlan });

  } catch (error) {
    console.error("Rebuild Plan Route Crash:", error.message);
    res.status(500).json({ message: "Failed to recalculate customized routine splits." });
  }
});

// =========================================================================
// @route   PUT /api/workout/update-profile
// @access  Private
// @desc    Updates user metrics (age, height, weight, gender, target) & conditionally rebuilds workout plan
// =========================================================================
router.put('/update-profile', protect, async (req, res) => {
  try {
    const userId = req.userId;
    const { age, height, weight, gender, target, updateWorkoutPlan } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User account profile not found." });
    }

    // Parse and update all incoming biometric parameters
    if (age !== undefined) user.age = Number(age);
    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);
    if (gender !== undefined) user.gender = gender.toLowerCase().trim();
    if (target !== undefined) user.target = target.toLowerCase().trim();

    let planUpdated = false;

    // Check if dynamic rebuild was triggered from frontend profile update
    if (updateWorkoutPlan === true) {
      console.log(`[Profile Update Trigger] Re-compiling unique workout plan array for user: ${userId}`);
      const metrics = {
        age: user.age || 24,
        height: user.height || 175,
        weight: user.weight || 70,
        gender: user.gender || 'male',
        target: user.target || 'muscle gain'
      };
      
      user.savedWorkoutPlan = await generatePersonalizedPlan(metrics);
      planUpdated = true;
    }

    await user.save();

    res.json({
      message: planUpdated 
        ? "Profile metrics and workout plan successfully refreshed!" 
        : "Profile metrics updated safely. Existing workout plan preserved.",
      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        target: user.target,
        savedWorkoutPlan: user.savedWorkoutPlan
      }
    });

  } catch (error) {
    console.error("Profile Update Endpoint Failure:", error.message);
    res.status(500).json({ message: `Failed to modify user configuration: ${error.message}` });
  }
});

export default router;