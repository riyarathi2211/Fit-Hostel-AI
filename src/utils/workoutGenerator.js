// src/utils/workoutGenerator.js

const WORKOUT_PLANS = {
  "muscle-gain": {
    Monday: { focus: "Chest & Triceps", exercises: ["Push-ups: 3xMax", "Dips: 3x12", "Diamond Pushups: 3x10"] },
    Tuesday: { focus: "Back & Biceps", exercises: ["Pull-ups/Rows: 3x8", "Bicep Curls: 3x15", "Supermans: 3x12"] },
    Wednesday: { focus: "Active Recovery", exercises: ["Stretching", "15 min Walk"] },
    Thursday: { focus: "Shoulders & Abs", exercises: ["Pike Pushups: 3x10", "Plank: 3x1 min", "Leg Raises: 3x15"] },
    Friday: { focus: "Leg Day", exercises: ["Squats: 4x20", "Lunges: 3x12", "Calf Raises: 3x20"] },
    Saturday: { focus: "Full Body Blast", exercises: ["Burpees: 3x10", "Mountain Climbers: 3x30 sec"] },
    Sunday: { focus: "Rest Day", exercises: ["Relax & Recover"] }
  },
  "weight-loss": {
    Monday: { focus: "Full Body Cardio", exercises: ["Jumping Jacks: 3x50", "High Knees: 3x30 sec", "Burpees: 3x10"] },
    Tuesday: { focus: "Core & Abs", exercises: ["Crunches: 3x20", "Plank: 3x1 min", "Russian Twists: 3x30"] },
    Wednesday: { focus: "Cardio", exercises: ["30 min Brisk Walk / Jogging"] },
    Thursday: { focus: "Lower Body Burn", exercises: ["Squats: 3x25", "Glute Bridges: 3x15", "Wall Sit: 45 sec"] },
    Friday: { focus: "Upper Body Toning", exercises: ["Push-ups: 3x10", "Incline Pushups (using bed): 3x12"] },
    Saturday: { focus: "HIIT", exercises: ["Sprints: 5 rounds", "Shadow Boxing: 3 mins"] },
    Sunday: { focus: "Rest Day", exercises: ["Light Stretching"] }
  }
};

export const getTodayWorkout = (goal) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  
  const plan = WORKOUT_PLANS[goal] || WORKOUT_PLANS["weight-loss"];
  return {
    day: today,
    ...plan[today]
  };
};