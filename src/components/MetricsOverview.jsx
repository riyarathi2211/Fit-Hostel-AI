// src/components/MetricsOverview.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const MetricsOverview = ({ userMetrics }) => {
  // Fallback defaults matching your state
  const metrics = userMetrics || {
    weight: 70,
    calories: 2750,
    protein: 154,
    targetCalories: 2750,
    targetProtein: 154
  };

  const chartData = [
    {
      name: "Calories (kcal)",
      current: metrics.currentCalories || 1571,
      target: metrics.calories || 2750,
      unit: "kcal",
      color: "#38bdf8"
    },
    {
      name: "Protein (g)",
      current: metrics.currentProtein || 53.5,
      target: metrics.protein || 154,
      unit: "g",
      color: "#c084fc"
    }
  ];

  return (
    <div className="bg-[#17223b] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Daily Target vs Actual</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time tracking of calculated body metrics
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Current Weight</span>
          <p className="text-lg font-black text-cyan-400">{metrics.weight} kg</p>
        </div>
      </div>

      {/* RECHARTS COMPARISON BAR CHART */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a1627",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#fff"
              }}
              formatter={(value, name) => [`${value}`, name === "current" ? "Logged" : "Target"]}
            />
            <Bar dataKey="current" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Logged" />
            <Bar dataKey="target" fill="#334155" radius={[6, 6, 0, 0]} name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PROGRESS BREAKDOWN BARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {chartData.map((item, idx) => {
          const percent = Math.min(Math.round((item.current / item.target) * 100), 100);

          return (
            <div key={idx} className="bg-[#0a1627] p-4 rounded-xl border border-gray-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-300">{item.name}</span>
                <span style={{ color: item.color }}>
                  {item.current} / {item.target} {item.unit} ({percent}%)
                </span>
              </div>
              <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsOverview;