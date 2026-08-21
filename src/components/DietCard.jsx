// src/components/DietCard.jsx
import React, { useState, useEffect } from 'react';
import API from '../api/axios';

function DietCard() {
  const [dietData, setDietData] = useState(null);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayDiet = async () => {
      try {
        // Interceptor handles base URL and Authorization headers
        const response = await API.get('/diet/my-today-diet');
        setDietData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error drawing standalone dashboard diet token map:", err);
        setLoading(false);
      }
    };

    fetchTodayDiet();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#17223b] p-6 rounded-2xl border border-gray-800 h-[300px] flex items-center justify-center">
        <p className="text-gray-500 text-xs animate-pulse">Syncing Today's Mess Target Targets...</p>
      </div>
    );
  }

  if (!dietData || !dietData.dietPlan) {
    return (
      <div className="bg-[#17223b] p-6 rounded-2xl border border-gray-800 h-[300px] flex items-center justify-center">
        <p className="text-red-400 text-xs">Failed to gather active daily menu metrics loops.</p>
      </div>
    );
  }

  const meals = dietData.dietPlan.meals;

  return (
    <div className="bg-[#17223b] p-6 rounded-2xl border border-gray-800 shadow-xl">
      <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Today's Mess Diet Advisor</h3>
          <p className="text-xs text-cyan-400 font-medium uppercase mt-1">Profile Target: {dietData.goal}</p>
        </div>
        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/20">
          Portion Controlled
        </span>
      </div>

      <div className="space-y-3">
        {Object.keys(meals).map((mealName) => {
          const isExpanded = expandedMeal === mealName;
          const mealDetails = meals[mealName];

          return (
            <div key={mealName} className="bg-[#0a1627] border border-gray-800 rounded-xl overflow-hidden">
              <div 
                onClick={() => setExpandedMeal(isExpanded ? null : mealName)}
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition"
              >
                <div className="capitalize font-bold text-white text-sm flex items-center gap-2">
                  {mealName}
                  <span className="text-[11px] text-gray-500 font-normal">({mealDetails.totals.calories} kcal)</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-[11px] font-mono text-gray-400 space-x-2">
                    <span className="text-cyan-400 font-bold">P: {mealDetails.totals.protein}g</span>
                    <span className="text-purple-400 font-bold">C: {mealDetails.totals.carbs}g</span>
                  </div>
                  {/* 🌟 Arrow element follows uniform cyan theme constraints */}
                  <span className={`text-xs text-gray-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-[#111d33] border-t border-gray-800/60 space-y-3">
                  {mealDetails.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#0a1627]/50 p-2.5 rounded-lg border border-gray-800/40">
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Target Serving: <span className="text-cyan-400 font-medium">{item.recommendedQuantity}</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-mono space-y-0.5">
                        <div className="text-cyan-400 font-bold">Protein: {item.macros.protein}g</div>
                        <div className="text-purple-400">Carbs: {item.macros.carbs}g</div>
                        <div className="text-gray-500">Fats: {item.macros.fats}g</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DietCard;