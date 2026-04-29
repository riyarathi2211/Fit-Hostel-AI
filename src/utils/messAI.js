// src/utils/messAI.js
import { WEEKLY_MENU } from "../data/messMenu";

export const getAIdietAdvice = (goal) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  const menu = WEEKLY_MENU[today];

  const isLoss = goal === "weight-loss";

  return {
    day: today,
    breakfast: isLoss ? `Eat half portion of- ${menu.Breakfast}. Skip sugar/butter.` : `Enjoy - ${menu.Breakfast}. Add a glass of milk.`,
    lunch: isLoss ? `1 Roti, more Dal, skip the Rice from - ${menu.Lunch}.` : `Full portion of - ${menu.Lunch}. Add extra Rice for calories.`,
    dinner: isLoss ? `Focus on the Sabzi/Dal. Limit to 1 Roti.` : `Eat 3-4 Rotis with - ${menu.Dinner}.`
  };
};