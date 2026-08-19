// backend/utils/planGenerator.js
import axios from 'axios';

// 🌟 THE UTILITY HELPER: Shuffles datasets safely and slices them perfectly
const getExercisesForDay = (exercisePool, maxLimit = 5) => {
  if (!exercisePool || exercisePool.length === 0) return [];

  // Safe Fisher-Yates shuffle algorithm to prevent unstable array sorting bugs
  const shuffled = [...exercisePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Cap it perfectly at the exact maximum limit requested (5 exercises per day)
  return shuffled.slice(0, maxLimit);
};

export const generatePersonalizedPlan = async (metrics) => {
  const { age, height, weight, gender, target } = metrics;

  const heightInMeters = height / 100;
  const approxBMI = weight / (heightInMeters * heightInMeters);
  const parsedAge = parseInt(age) || 25;

  let totalSets = 3;
  let optimalReps = "10-12";
  let workoutIntensity = "Standard Conditioning Track";
  let coachingDirective = "Maintain controlled eccentric timing and keep strict core stabilization loops active.";

  if (target === "muscle gain") {
    totalSets = approxBMI < 22.5 ? 4 : 3;
    optimalReps = "8-10";
    workoutIntensity = "Hypertrophy Hyper-Target Split";
    coachingDirective = "Prioritize high mechanical muscle load tension. Force a 90-second rest window between sets.";
  } else if (target === "weight loss" || target === "fat loss") {
    totalSets = 3;
    optimalReps = parsedAge < 32 ? "15" : "12-15";
    workoutIntensity = "High-Density Metabolic Shred Loop";
    coachingDirective = "Restrict rest intervals between movements to 45 seconds to increase your caloric expenditure.";
  }

  const strengthMuscles = ['chest', 'back', 'biceps', 'triceps', 'shoulders', 'quadriceps', 'hamstring', 'glutes'];
  
  const shuffledMuscles = [...strengthMuscles];
  for (let i = shuffledMuscles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledMuscles[i], shuffledMuscles[j]] = [shuffledMuscles[j], shuffledMuscles[i]];
  }

  const daysLayoutConfig = [
    { name: "Monday", type: "strength", muscles: [shuffledMuscles[0], shuffledMuscles[1]], title: `${shuffledMuscles[0].toUpperCase()} & ${shuffledMuscles[1].toUpperCase()} Dynamic Split` },
    { name: "Tuesday", type: "strength", muscles: [shuffledMuscles[2], shuffledMuscles[3]], title: `${shuffledMuscles[2].toUpperCase()} & ${shuffledMuscles[3].toUpperCase()} Focus Resistance` },
    { name: "Wednesday", type: "cardio", muscles: [], title: "Aerobic Flushing & Cardiorespiratory Recovery" },
    { name: "Thursday", type: "strength", muscles: [shuffledMuscles[4], shuffledMuscles[5]], title: `Kinetic ${shuffledMuscles[4].toUpperCase()} / ${shuffledMuscles[5].toUpperCase()} Cross-Split` },
    { name: "Friday", type: "strength", muscles: [shuffledMuscles[6], shuffledMuscles[7]], title: `Systemic Blast: ${shuffledMuscles[6].toUpperCase()} & ${shuffledMuscles[7].toUpperCase()} Integration` },
    { name: "Saturday", type: "cardio", muscles: [], title: "Mitochondrial Endurance Maintenance Window" },
    { name: "Sunday", type: "rest", muscles: [], title: "Physiological Resting Matrix & Cellular Adaptation" }
  ];

  let apiDifficulty = 'beginner';
  if (parsedAge >= 18 && parsedAge <= 45 && weight > 64) {
    apiDifficulty = 'intermediate';
  }

  const outputSchedule = [];

  for (const day of daysLayoutConfig) {
    if (day.type === "rest") {
      outputSchedule.push({ day: day.name, focus: day.title, exercises: [] });
      continue;
    }

    let combinedPool = [];

    if (day.type === "strength" && day.muscles.length > 0) {
      for (const muscleGroup of day.muscles) {
        try {
          const apiResponse = await axios.get('https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises', {
            params: {
              difficulty: apiDifficulty,
              type: "strength",
              muscle: muscleGroup,
              limit: 5 // Fetch a healthy selection pool from each muscle category
            },
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com',
              'Content-Type': 'application/json'
            },
            timeout: 4000
          });

          if (apiResponse.data && apiResponse.data.length > 0) {
            combinedPool = [...combinedPool, ...apiResponse.data];
          }
        } catch (err) {
          console.warn(`[Day Engine Warning] RapidAPI pull failed for muscle group: ${muscleGroup}`);
        }
      }
    } else if (day.type === "cardio") {
      try {
        const apiResponse = await axios.get('https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises', {
          params: { difficulty: apiDifficulty, type: "cardio", limit: 5 },
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          timeout: 8000
        });
        if (apiResponse.data && apiResponse.data.length > 0) {
          combinedPool = apiResponse.data;
        }
      } catch (err) {
        console.warn(`[Day Engine Warning] RapidAPI cardio tracking failed.`);
      }
    }

    // Safety Fallback Net: If the API breaks, it builds an explicit 5-exercise list manually
   // Safety Fallback Net: Upgraded with rich, detailed procedural steps
    if (combinedPool.length === 0) {
      const primaryTarget = day.muscles.length > 0 ? day.muscles[0].toUpperCase() : 'BODYWEIGHT';
      const secondaryTarget = day.muscles.length > 1 ? day.muscles[1].toUpperCase() : 'CORE';
      
      combinedPool = [
        { 
          name: `${primaryTarget} Compound Drive`, 
          equipment: "Barbell/Dumbbell", 
          instructions: "Position yourself firmly with your feet planted flat on the floor. Retract your scapula and lower the weight smoothly to the midpoint of your chest. Push upward with control while driving your feet into the ground. Keep your elbows tucked at a 45-degree angle throughout the movement." 
        },
        { 
          name: `${secondaryTarget} Isolation Extension`, 
          equipment: "Cables/Dumbbell", 
          instructions: "Select a manageable weight to maintain strict isolation focus. Squeeze the targeted muscle group firmly at the peak of the contraction phase. Lower the resistance slowly back to the starting position over a full 3-second negative count. Do not use momentum or rock your body." 
        },
        { 
          name: `${primaryTarget} Functional Deficit Set`, 
          equipment: "Bodyweight", 
          instructions: "Assume a solid structural starting posture with your core pulled in tight. Lower your body through a complete deficit range of motion to maximize muscle fiber recruitment. Press back up to the top dynamically. Keep your neck neutral and align your spine perfectly." 
        },
        { 
          name: "Core Dynamic Stabilization Circuit", 
          equipment: "Bodyweight", 
          instructions: "Lie flat on an exercise mat with your lower back pressed firmly into the floor. Brace your abdominal wall as if preparing for impact. Elevate your shoulders slightly while maintaining deep, controlled breathing. Execute matching alternating leg or arm tracks slowly." 
        },
        { 
          name: "Active Recovery Operational Movement", 
          equipment: "Bodyweight", 
          instructions: "Begin moving through a deliberate, unweighted range of motion track. Focus entirely on stretching out tight structural tissue and expanding joint mobility limits. Force blood flow directly into fatigued muscle regions without creating metabolic strain." 
        }
      ];
    }

    // Pass the built collection pool to our shuffler helper and lock it at EXACTLY 5 exercises
    const finalDailySelection = getExercisesForDay(combinedPool, 5);

    outputSchedule.push({
      day: day.name,
      focus: day.title,
      exercises: finalDailySelection.map(ex => {
        
        let parsedProcedures = ["Execute with clean form and controlled acceleration loops."];

        if (ex.instructions) {
          if (Array.isArray(ex.instructions)) {
            parsedProcedures = ex.instructions;
          } else if (typeof ex.instructions === 'string') {
            // 🌟 FIXED TEXT PARSER BOUNDARY: 
            // Splits at periods even if there's no space following it, newlines, or semicolons.
            parsedProcedures = ex.instructions
              .split(/(?:\r?\n|;\s*|\.(?=[A-Z\s]|$))+/)
              .map(step => step.trim())
              // Clean out floating bullet lists or bracket indexes
              .map(step => step.replace(/^\d+[\.\)]\s*/, ''))
              // Strip stray trailing periods left behind from splitting logic
              .map(step => step.replace(/\.$/, '')) 
              .filter(step => step.length > 3); 
          }
        }

        if (parsedProcedures.length === 0) {
          parsedProcedures = ["Perform this selection focusing on a full concentric and eccentric range of motion."];
        }

        return {
          name: ex.name,
          sets: totalSets.toString(),
          reps: day.type === 'cardio' ? (target === 'weight loss' ? "40 Mins" : "25 Mins") : optimalReps,
          equipment: ex.equipment || "Bodyweight",
          procedures: parsedProcedures
        };
      })
    });
  }

  return {
    meta: {
      profileSummary: `${gender.toUpperCase()} | Age: ${age} | Weight: ${weight}kg | Computed BMI: ${approxBMI.toFixed(1)}`,
      assignedGoal: target.toUpperCase(),
      routineStyle: workoutIntensity,
      coachingDirective: coachingDirective
    },
    schedule: outputSchedule
  };
};