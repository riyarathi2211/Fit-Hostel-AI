import React from 'react';
import { getAIdietAdvice } from '../utils/messAI';

const DietCard = ({ goal }) => {
  const advice = getAIdietAdvice(goal);

  const meals = [
    { name: "Breakfast", info: advice.breakfast, icon: "🌅" },
    { name: "Lunch", info: advice.lunch, icon: "☀️" },
    { name: "Dinner", info: advice.dinner, icon: "🌙" }
  ];

  return (
    <div className="bg-[#17223b] p-6 rounded-2xl border border-gray-800 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Today's Mess Strategy <span className="text-blue-400 text-sm ml-2">({advice.day})</span>
        </h3>
        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-[10px] text-blue-400 font-bold uppercase">
          AI Optimized
        </div>
      </div>

      <div className="space-y-4">
        {meals.map((meal, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#0a1627] border border-gray-800 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <span>{meal.icon}</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{meal.name}</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">
              {meal.info}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
        <p className="text-xs text-yellow-500/80 italic font-medium">
          ⚠️ Hostel Hack: If the mess oil is too much, soak your Parathas with a napkin before eating!
        </p>
      </div>
    </div>
  );
};

export default DietCard;