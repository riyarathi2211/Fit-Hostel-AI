// src/components/ProgressChart.jsx
import React from 'react';

const ProgressChart = () => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const heights = ['h-12', 'h-20', 'h-16', 'h-24', 'h-10', 'h-14', 'h-18'];

  return (
    <div className="flex items-end justify-between h-32 w-full px-2">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center group">
          <div className={`${heights[i]} w-3 bg-blue-500/40 group-hover:bg-cyan-400 rounded-t-sm transition-all duration-300`}></div>
          <span className="text-[10px] text-gray-500 mt-2">{day}</span>
        </div>
      ))}
    </div>
  );
};

export default ProgressChart;