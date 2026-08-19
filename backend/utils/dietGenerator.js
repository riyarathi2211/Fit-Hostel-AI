// backend/utils/dietGenerator.js

// 🌟 Comprehensive nutritional database mapped to your specific NIT Hamirpur mess items (Per 100g or standard base unit)
const NUTRITION_DATABASE = {
  // Breakfast items
  "poha": { protein: 2.5, carbs: 25.0, fats: 2.5, unit: "plate", baseWeight: 150 },
  "sprouts": { protein: 7.0, carbs: 15.0, fats: 0.5, unit: "bowl", baseWeight: 80 },
  "apple": { protein: 0.3, carbs: 14.0, fats: 0.2, unit: "fruit", baseWeight: 100 },
  "fruit": { protein: 0.5, carbs: 12.0, fats: 0.2, unit: "fruit", baseWeight: 100 },
  "milk": { protein: 3.3, carbs: 4.8, fats: 3.5, unit: "glass", baseWeight: 200 },
  "sandwich": { protein: 6.0, carbs: 28.0, fats: 4.5, unit: "pieces", baseWeight: 120 },
  "cournflakes": { protein: 2.0, carbs: 26.0, fats: 0.1, unit: "bowl", baseWeight: 50 },
  "cornflakes": { protein: 2.0, carbs: 26.0, fats: 0.1, unit: "bowl", baseWeight: 50 },
  "daliya": { protein: 3.5, carbs: 22.0, fats: 1.0, unit: "bowl", baseWeight: 150 },
  "dalia": { protein: 3.5, carbs: 22.0, fats: 1.0, unit: "bowl", baseWeight: 150 },
  "bread": { protein: 4.0, carbs: 24.0, fats: 1.0, unit: "slices", baseWeight: 50 },
  "jam": { protein: 0.1, carbs: 13.0, fats: 0.0, unit: "tbsp", baseWeight: 15 },
  "peanut butter": { protein: 4.0, carbs: 3.0, fats: 8.0, unit: "tbsp", baseWeight: 16 },
  "macroni": { protein: 4.5, carbs: 32.0, fats: 3.0, unit: "plate", baseWeight: 150 },
  "boiled egg": { protein: 6.3, carbs: 0.6, fats: 5.0, unit: "egg", baseWeight: 50 },

  // Lunch & Dinner Staples
  "roti": { protein: 3.5, carbs: 18.0, fats: 0.5, unit: "piece", baseWeight: 40 },
  "rice": { protein: 2.7, carbs: 28.0, fats: 0.3, unit: "grams", baseWeight: 1 },
  "salad": { protein: 0.5, carbs: 3.0, fats: 0.1, unit: "plate", baseWeight: 100 },
  "curd": { protein: 3.5, carbs: 4.5, fats: 3.0, unit: "cup", baseWeight: 100 },
  "raita": { protein: 2.5, carbs: 4.0, fats: 2.0, unit: "cup", baseWeight: 120 },

  // Main Dishes & Curries (Standardized bowl = 150g cooked)
  "kadhi": { protein: 3.5, carbs: 11.0, fats: 4.0, unit: "bowl", baseWeight: 150 },
  "chana dal": { protein: 7.0, carbs: 16.0, fats: 2.5, unit: "bowl", baseWeight: 150 },
  "dal makhni": { protein: 5.5, carbs: 14.0, fats: 6.0, unit: "bowl", baseWeight: 150 },
  "dal": { protein: 5.0, carbs: 15.0, fats: 2.0, unit: "bowl", baseWeight: 150 },
  "safed chana": { protein: 7.5, carbs: 21.0, fats: 3.5, unit: "bowl", baseWeight: 150 },
  "rajma chawal": { protein: 4.5, carbs: 24.0, fats: 2.0, unit: "plate", baseWeight: 250 }, // Combined plate baseline
  "paneer": { protein: 11.0, carbs: 5.0, fats: 13.0, unit: "bowl", baseWeight: 150 },
  "chicken": { protein: 19.0, carbs: 4.0, fats: 9.0, unit: "bowl", baseWeight: 150 },
  "aalo matar / mushroom matar": { protein: 3.0, carbs: 14.0, fats: 4.5, unit: "bowl", baseWeight: 150 },
  "kaale chana": { protein: 8.0, carbs: 22.0, fats: 3.5, unit: "bowl", baseWeight: 150 },
  "aalo poori": { protein: 4.0, carbs: 38.0, fats: 14.0, unit: "plate", baseWeight: 200 },
  "khoru": { protein: 3.0, carbs: 5.0, fats: 6.0, unit: "bowl", baseWeight: 150 }, // Traditional buttermilk prep
  "chole bhature": { protein: 9.0, carbs: 55.0, fats: 18.0, unit: "plate", baseWeight: 250 },
  "khichdi": { protein: 4.0, carbs: 23.0, fats: 3.5, unit: "bowl", baseWeight: 200 },

  // Snacks & Extras
  "tea": { protein: 1.0, carbs: 6.0, fats: 1.5, unit: "cup", baseWeight: 150 },
  "coffee": { protein: 1.0, carbs: 7.0, fats: 1.5, unit: "cup", baseWeight: 150 },

  // Desserts
  "gulab jamun": { protein: 2.5, carbs: 42.0, fats: 10.0, unit: "piece", baseWeight: 50 },
  "icecream": { protein: 3.5, carbs: 24.0, fats: 11.0, unit: "cup", baseWeight: 100 },
  "custard": { protein: 3.0, carbs: 20.0, fats: 4.0, unit: "bowl", baseWeight: 120 },
  "rasmalai": { protein: 5.0, carbs: 30.0, fats: 8.0, unit: "piece", baseWeight: 75 }
};

export const parseMessDietForUser = (messMenuDay, target) => {
  if (!messMenuDay) return null;

  // Portion adjusting configurations aligned to target goals
  let multipliers = { proteinScale: 1.0, carbScale: 1.0, genericScale: 1.0 };
  
  if (target === "muscle gain") {
    multipliers = { proteinScale: 1.4, carbScale: 1.2, genericScale: 1.2 };
  } else if (target === "weight loss" || target === "fat loss") {
    multipliers = { proteinScale: 1.2, carbScale: 0.5, genericScale: 0.75 };
  }

  // Adjusted mappings to match your exact front-end key letters casing
  const targetSections = ["Breakfast", "Lunch", "Dinner"];
  const recommendation = { day: messMenuDay.day, meals: {} };

  targetSections.forEach(sectionKey => {
    const mealTypeLower = sectionKey.toLowerCase();
    recommendation.meals[mealTypeLower] = { items: [], totals: { protein: 0, carbs: 0, fats: 0, calories: 0 } };

    const rawStringData = messMenuDay[sectionKey] || "";
    
    // Parse the messy strings into isolated, trimmed strings
    const discoveredItems = rawStringData
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    discoveredItems.forEach(foodName => {
      const lowerName = foodName.toLowerCase();
      
      let baseNutrient = NUTRITION_DATABASE[lowerName];
      if (!baseNutrient) {
        // Safe fallback values for complex string edge-cases (e.g., compound slashes)
        baseNutrient = { protein: 3.0, carbs: 15.0, fats: 3.0, unit: "serving", baseWeight: 100 };
      }

      // 🌟 CALCULATING SERVING VOLUMES BASED ON USER'S TARGET GOAL
      let calculatedQuantity = 1;
      
      if (baseNutrient.unit === "grams") {
        // Handle bulk rice tracking thresholds smoothly
        calculatedQuantity = target === "muscle gain" ? 250 : target === "weight loss" ? 100 : 150;
      } else if (lowerName === "roti") {
        calculatedQuantity = target === "muscle gain" ? 4 : target === "weight loss" ? 2 : 3;
      } else if (baseNutrient.unit === "piece" || baseNutrient.unit === "slices" || baseNutrient.unit === "egg") {
        calculatedQuantity = target === "muscle gain" ? 2 : 1;
      } else {
        // Bowl and plate measurements scaled by standard layout multipliers
        calculatedQuantity = parseFloat((1 * multipliers.genericScale).toFixed(1));
      }

      // Convert quantities back to structural gram metrics
      const totalWeightGrams = baseNutrient.unit === "grams" 
        ? calculatedQuantity 
        : calculatedQuantity * baseNutrient.baseWeight;

      // Extract nutritional results
      const p = parseFloat(((baseNutrient.protein / 100) * totalWeightGrams).toFixed(1));
      const c = parseFloat(((baseNutrient.carbs / 100) * totalWeightGrams).toFixed(1));
      const f = parseFloat(((baseNutrient.fats / 100) * totalWeightGrams).toFixed(1));
      const cals = Math.round(p * 4 + c * 4 + f * 9);

      recommendation.meals[mealTypeLower].items.push({
        name: foodName,
        recommendedQuantity: `${calculatedQuantity} ${baseNutrient.unit}`,
        macros: { protein: p, carbs: c, fats: f, calories: cals }
      });

      // Aggregate totals
      recommendation.meals[mealTypeLower].totals.protein += p;
      recommendation.meals[mealTypeLower].totals.carbs += c;
      recommendation.meals[mealTypeLower].totals.fats += f;
      recommendation.meals[mealTypeLower].totals.calories += cals;
    });

    // Fix floating precision artifacts
    recommendation.meals[mealTypeLower].totals.protein = parseFloat(recommendation.meals[mealTypeLower].totals.protein.toFixed(1));
    recommendation.meals[mealTypeLower].totals.carbs = parseFloat(recommendation.meals[mealTypeLower].totals.carbs.toFixed(1));
    recommendation.meals[mealTypeLower].totals.fats = parseFloat(recommendation.meals[mealTypeLower].totals.fats.toFixed(1));
  });

  return recommendation;
};