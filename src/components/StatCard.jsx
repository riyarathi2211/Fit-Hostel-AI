
import React from 'react';  

const StatCard = ({ title, value, goal, unit, color }) => {
  const percentage = (value / goal) * 100;

  return (
    <div className="bg-[#17223b] p-5 rounded-xl border border-gray-800 shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${color}`}>{value} <span className="text-sm font-normal text-gray-500">{unit}</span></h3>
        </div>
        <div className="text-xs text-gray-500 font-mono">Goal: {goal}</div>
      </div>
      
      {/* Mini Progress Bar */}
      <div className="w-full bg-gray-900 h-1.5 mt-4 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color.replace('text', 'bg')}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatCard;