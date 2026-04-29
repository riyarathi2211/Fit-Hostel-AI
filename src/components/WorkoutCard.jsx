// src/components/WorkoutCard.jsx
import React from 'react';
import { getTodayWorkout } from '../utils/workoutGenerator';
import { Dumbbell, CheckCircle2 } from 'lucide-react';

const WorkoutCard = ({ goal }) => {
  const workout = getTodayWorkout(goal);

  return (
    <div className="bg-[#17223b] p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="text-blue-400" size={24} />
            Today's Mission
          </h3>
          <p className="text-blue-400 text-xs font-semibold uppercase mt-1 tracking-widest">
            Target: {workout.focus}
          </p>
        </div>
        <div className="text-right">
            <span className="text-[10px] text-gray-500 font-mono uppercase">{workout.day}</span>
        </div>
      </div>

      <div className="space-y-3">
        {workout.exercises.map((ex, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-[#0a1627] border border-gray-800 rounded-xl group hover:border-blue-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
              <span className="text-gray-200 text-sm font-medium">{ex}</span>
            </div>
            <CheckCircle2 className="text-gray-700 group-hover:text-blue-500/50 cursor-pointer transition-colors" size={18} />
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-blue-500/20">
        START WORKOUT
      </button>
    </div>
  );
};

export default WorkoutCard;