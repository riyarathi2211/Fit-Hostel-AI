import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generatePersonalizedPlan } from "../utils/planGenerator.js";

// Helper: Calculate ideal target weight using Devine Formula based on height (cm) & gender
const calculateIdealWeight = (heightCm, gender) => {
  const heightInches = heightCm / 2.54;
  
  if (heightInches <= 60) {
    return gender === 'female' ? 45.5 : 50;
  }

  const inchesOver5Ft = heightInches - 60;
  let idealKg = gender === 'female' ? 45.5 + (2.3 * inchesOver5Ft) : 50 + (2.3 * inchesOver5Ft);

  return Math.round(idealKg * 10) / 10;
};

// ==========================================
// @route   POST /api/auth/register
// @access  Public
// ==========================================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, height, weight, gender, target } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered with this email account." });
    }

    const userWeight = weight !== undefined && weight !== null && !isNaN(Number(weight))
      ? Number(weight)
      : 0;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const metrics = {
      age: parseInt(age, 10) || 0,
      height: parseInt(height, 10) || 0,
      weight: userWeight,
      gender: gender ? gender.toLowerCase().trim() : 'unspecified',
      target: target ? target.toLowerCase().trim() : 'general fitness'
    };

    let automaticPlan = null;
    if (metrics.weight > 0 && metrics.height > 0) {
      try {
        automaticPlan = await generatePersonalizedPlan(metrics);
      } catch (planError) {
        console.error("Signup Plan Generation Error:", planError.message);
      }
    }

    const now = new Date();
    const todayLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const initialTargetWeight = metrics.height > 0 
      ? calculateIdealWeight(metrics.height, metrics.gender) 
      : userWeight;

    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      ...metrics,
      targetWeight: initialTargetWeight,
      savedWorkoutPlan: automaticPlan,
      lastCheckInDate: now,
      monthlyWeightLogs: userWeight > 0 ? [
        {
          weight: userWeight,
          date: now,
          monthLabel: todayLabel
        }
      ] : []
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        height: newUser.height,
        weight: newUser.weight,
        targetWeight: newUser.targetWeight,
        gender: newUser.gender,
        target: newUser.target,
        savedWorkoutPlan: newUser.savedWorkoutPlan,
        lastCheckInDate: newUser.lastCheckInDate,
        monthlyWeightLogs: newUser.monthlyWeightLogs
      }
    });

  } catch (error) {
    console.error("Registration Exception:", error.message);
    res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// ==========================================
// @route   POST /api/auth/login
// @access  Public
// ==========================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight || (user.height > 0 ? calculateIdealWeight(user.height, user.gender) : user.weight),
        gender: user.gender,
        target: user.target,
        savedWorkoutPlan: user.savedWorkoutPlan,
        lastCheckInDate: user.lastCheckInDate,
        monthlyWeightLogs: user.monthlyWeightLogs
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @route   GET /api/auth/profile
// @access  Private
// ==========================================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObj = user.toObject();
    if (!userObj.targetWeight && userObj.height > 0) {
      userObj.targetWeight = calculateIdealWeight(userObj.height, userObj.gender);
    }

    res.status(200).json({ user: userObj });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// @route   PUT /api/auth/profile
// @access  Private
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { age, height, weight, gender, target, targetWeight, regeneratePlan } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const initialMetrics = {
      weight: user.weight,
      height: user.height,
      age: user.age,
      target: user.target
    };

    if (age !== undefined) user.age = Number(age);
    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);
    if (gender) user.gender = gender.toLowerCase().trim();
    if (target) user.target = target.toLowerCase().trim();

    if (targetWeight !== undefined) {
      user.targetWeight = Number(targetWeight);
    } else if (height !== undefined || gender !== undefined) {
      user.targetWeight = calculateIdealWeight(user.height, user.gender);
    }

    const metricsChanged =
      user.weight !== initialMetrics.weight ||
      user.height !== initialMetrics.height ||
      user.age !== initialMetrics.age ||
      user.target !== initialMetrics.target;

    const now = new Date();

    if (user.weight !== initialMetrics.weight) {
      const todayLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      if (!user.monthlyWeightLogs) {
        user.monthlyWeightLogs = [];
      }

      const existingIdx = user.monthlyWeightLogs.findIndex(log => log.monthLabel === todayLabel);

      if (existingIdx !== -1) {
        user.monthlyWeightLogs[existingIdx].weight = user.weight;
        user.monthlyWeightLogs[existingIdx].date = now;
      } else {
        user.monthlyWeightLogs.push({
          weight: user.weight,
          date: now,
          monthLabel: todayLabel
        });
      }

      user.markModified('monthlyWeightLogs');
    }

    // Check if at least 1 month (30 days) has passed since the last generated plan
    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
    const lastPlanDate = user.lastCheckInDate ? new Date(user.lastCheckInDate).getTime() : 0;
    const isOneMonthPassed = (now.getTime() - lastPlanDate) >= ONE_MONTH_MS;

    // Only recalculate plan if 1 month has passed OR explicitly requested via force flag
    if ((metricsChanged && isOneMonthPassed) || regeneratePlan || !user.savedWorkoutPlan) {
      try {
        const metrics = {
          age: user.age,
          height: user.height,
          weight: user.weight,
          gender: user.gender,
          target: user.target
        };
        user.savedWorkoutPlan = await generatePersonalizedPlan(metrics);
        user.lastCheckInDate = now; // Update timestamp to reset the 1-month countdown
        user.markModified('savedWorkoutPlan');
      } catch (planErr) {
        console.error("Failed to regenerate workout plan:", planErr.message);
      }
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Profile updated and synced successfully",
      user: userResponse
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// ==========================================
// @route   GET /api/auth/monthly-weight-history
// @access  Private
// ==========================================
export const getMonthlyWeightHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const dynamicIdeal = user.targetWeight && user.targetWeight > 0
      ? user.targetWeight
      : (user.height > 0 ? calculateIdealWeight(user.height, user.gender) : user.weight);

    res.status(200).json({
      history: user.monthlyWeightLogs || [],
      monthlyWeightLogs: user.monthlyWeightLogs || [],
      idealTarget: dynamicIdeal
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch weight logs", error: error.message });
  }
};

// ==========================================
// @route   POST /api/auth/log-monthly-weight
// @access  Private
// ==========================================
export const logMonthlyWeight = async (req, res) => {
  try {
    const userId = req.userId;
    const { weight } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const numericWeight = Number(weight);
    user.weight = numericWeight;

    const now = new Date();
    const todayLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (!user.monthlyWeightLogs) user.monthlyWeightLogs = [];

    const existingIdx = user.monthlyWeightLogs.findIndex(log => log.monthLabel === todayLabel);

    if (existingIdx !== -1) {
      user.monthlyWeightLogs[existingIdx].weight = numericWeight;
      user.monthlyWeightLogs[existingIdx].date = now;
    } else {
      user.monthlyWeightLogs.push({
        weight: numericWeight,
        date: now,
        monthLabel: todayLabel
      });
    }

    user.markModified('monthlyWeightLogs');
    await user.save();

    return res.status(200).json({ history: user.monthlyWeightLogs });
  } catch (error) {
    console.error("Log weight error:", error);
    return res.status(500).json({ message: 'Failed to log weight entry' });
  }
};