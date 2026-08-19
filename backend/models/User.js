// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Permanent User Biometrics (DEFAULTS REMOVED TO PREVENT OVERWRITING WITH 70/72)
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  targetWeight: { type: Number }, // Dynamic; updated when user changes target or profile
  gender: { type: String, required: true },
  target: { type: String, required: true },

  // 1-Day Check-in & Progress Adaptation History
  lastCheckInDate: { type: Date, default: Date.now },
  checkInHistory: [
    {
      date: { type: Date, default: Date.now },
      weight: Number,
      height: Number,
      feedback: String, // e.g., "Too Easy", "Optimal", "Too Heavy"
      caloricTarget: Number,
      proteinTarget: Number,
      carbsTarget: Number
    }
  ],

  // 📈 Monthly Weight Progress History
  monthlyWeightLogs: [
    {
      weight: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      monthLabel: { type: String }
    }
  ],

  // 🌟 The Permanent Saved Workout Plan Asset
  savedWorkoutPlan: {
    meta: {
      profileSummary: String,
      assignedGoal: String,
      routineStyle: String,
      coachingDirective: String
    },
    schedule: [
      {
        day: String,
        focus: String,
        isRestDay: { type: Boolean, default: false },
        exercises: [
          {
            name: String,
            sets: String,
            reps: String,
            equipment: String,
            procedures: [String]
          }
        ]
      }
    ]
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);