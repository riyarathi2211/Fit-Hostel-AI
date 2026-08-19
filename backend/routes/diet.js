// backend/routes/diet.js
import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { parseMessDietForUser } from '../utils/dietGenerator.js';
const router = express.Router();

const HOSTEL_MESS_DATA = [
  { day: "Monday", Breakfast: "Poha ,Sprouts, Apple,Milk", Lunch: "Kadhi, Rice,Salad,Roti", Dinner: "Chana Dal, Roti,Raita,Rice,Gulab Jamun" },
  { day: "Tuesday", Breakfast: "Sandwich,Milk,Fruit,Sprouts,cournflakes", Lunch: "Dal Makhni, Rice, Raita,Salad,Roti", Dinner: "Safed Chana , Roti,Rice,Curd,IceCream" },
  { day: "Wednesday", Breakfast: "Daliya, Sprouts, Fruit", Lunch: "Rajma Chawal, Curd, Salad,Roti", Dinner: "Paneer ,Chicken, Roti, Rice,Curd" },
  { day: "Thursday", Breakfast: "Bread, Jam,Peanut Butter, Milk, Fruit", Lunch: "Dal, Raita,Rice, Salad , Roti", Dinner: "Aalo Matar / Mushroom Matar, Roti,rice,Raita,custard" },
  { day: "Friday", Breakfast: "Macroni, Sprouts, Fruit, Milk,Boiled Egg,cornflakes", Lunch: "Kaale Chana, Rice, Curd, Salad,Roti", Dinner: "Paneer, Roti,Rice,Curd" },
  { day: "Saturday", Breakfast: "Bread, Peanut butter/Jam, Milk, Fruit,Sprouts", Lunch: "Rajma Chawal, Curd, Salad,Roti", Dinner: "Aalo poori,Khoru,Rice," },
  { day: "Sunday", Breakfast: "Dalia, Sprouts, Fruit", Lunch: "Chole Bhature,Salad", Dinner: "khichdi,Curd, Rasmalai" }
];

// 🌟 NEW ENHANCED ENDPOINT: Returns all 7 days calculated at once
router.get('/my-weekly-diet', protect, async (req, res) => {
  try {
    let targetGoal = "maintenance";
    if (req.user) {
      if (req.user.target) {
        targetGoal = req.user.target;
      } else if (req.user._doc && req.user._doc.target) {
        targetGoal = req.user._doc.target;
      }
    }

    // Map through every single day configuration in your mess menu database
    const fullWeeklyCalculatedDiet = HOSTEL_MESS_DATA.map(dayMenu => {
      return parseMessDietForUser(dayMenu, targetGoal.toLowerCase());
    });

    res.json({
      goal: targetGoal.toUpperCase(),
      weeklyDietPlan: fullWeeklyCalculatedDiet
    });
    
  } catch (err) {
    console.error("WEEKLY DIET ENGINE FAILURE:", err.message);
    res.status(500).json({ error: "Diet calculation macro loop crash: " + err.message });
  }
});

// Keep your old endpoint active here as well so your dashboard card doesn't break
router.get('/my-today-diet', protect, async (req, res) => {
  try {
    let targetGoal = "maintenance";
    if (req.user) {
      if (req.user.target) { targetGoal = req.user.target; }
      else if (req.user._doc && req.user._doc.target) { targetGoal = req.user._doc.target; }
    }
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentSystemDay = daysOfWeek[new Date().getDay()];
    const requestedDay = req.query.day || currentSystemDay;
    let matchingDayMenu = HOSTEL_MESS_DATA.find(m => m.day.toLowerCase() === requestedDay.toLowerCase()) || HOSTEL_MESS_DATA[0];
    const personalizedDiet = parseMessDietForUser(matchingDayMenu, targetGoal.toLowerCase());
    res.json({ goal: targetGoal.toUpperCase(), dietPlan: personalizedDiet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;