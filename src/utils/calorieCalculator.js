// src/utils/calorieCalculator.js

export const calculateDailyTarget = (user) => {
  if (!user || !user.weight || !user.height || !user.age) {
    return { calories: 2000, protein: 150 }; // Default fallbacks
  }

  // 1. Calculate BMR (Mifflin-St Jeor Equation)
  // For Men: 10*weight + 6.25*height - 5*age + 5
  // For Women: 10*weight + 6.25*height - 5*age - 161
  let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
  bmr = user.gender === "female" ? bmr - 161 : bmr + 5;

  // 2. Adjust for Goal (Hostel AI logic)
  let targetCalories = bmr * 1.4; // Assuming moderate hostel activity
  
  if (user.goal === "muscle-gain") targetCalories += 300;
  if (user.goal === "weight-loss") targetCalories -= 500;

  // 3. Protein Calculation (1.8g per kg for gain, 1.2g for others)
  const proteinMultiplier = user.goal === "muscle-gain" ? 1.8 : 1.2;
  const targetProtein = user.weight * proteinMultiplier;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(targetProtein)
  };
};