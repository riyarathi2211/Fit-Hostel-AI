// src/components/WorkoutCard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WorkoutCard() {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const todayName = daysOfWeek[todayIndex];

  useEffect(() => {
    fetchTodayWorkout();

    const handlePlanUpdate = () => fetchTodayWorkout();
    window.addEventListener('workoutPlanUpdated', handlePlanUpdate);

    return () => window.removeEventListener('workoutPlanUpdated', handlePlanUpdate);
  }, []);

  const fetchTodayWorkout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/workout/my-plan', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWorkoutPlan(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load today's workout split:", err);
      setError('Could not retrieve stored workout plan matrix.');
      setLoading(false);
    }
  };

  // Strictly select today's schedule entry from backend plan
  const todaySchedule = workoutPlan?.schedule?.find(
    (item) => item.day?.toLowerCase() === todayName.toLowerCase()
  ) || workoutPlan?.schedule?.[todayIndex];

  // Rest day validation (Sunday or backend rest flag)
  const isRestDay = todayName === 'Sunday' || 
                    todaySchedule?.isRestDay || 
                    todaySchedule?.focus?.toLowerCase().includes('rest');

  if (loading) {
    return (
      <div className="bg-[#17223b] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center justify-center min-h-[300px]">
        <p className="text-cyan-400 font-mono text-xs animate-pulse">Loading Today's Split...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#17223b] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
      <div>
        {/* CARD HEADER */}
        <div className="flex justify-between items-start border-b border-gray-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {todayName} Protocol
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              {isRestDay ? "Active Recovery Day" : todaySchedule?.focus || "Today's Exercise Split"}
            </h2>
          </div>

          <span className="text-[11px] font-mono text-gray-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-gray-800">
            {isRestDay ? "Rest" : `${todaySchedule?.exercises?.length || 0} Exercises`}
          </span>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            ⚠ {error}
          </div>
        )}

        {/* TODAY'S CONTENT DISPLAY */}
        <div className="mt-4">
          {isRestDay ? (
            <div className="bg-[#0a1627]/60 border border-cyan-500/20 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto text-cyan-400 text-xl">
                💤
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sunday Rest Protocol</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  No heavy lifting scheduled today. Focus on muscle hydration, mobility work, and proper nutrition.
                </p>
              </div>
              <span className="inline-block text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                System Recovery Active
              </span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {todaySchedule?.exercises?.map((exercise, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#0a1627] border border-gray-800/80 hover:border-gray-700 p-3.5 rounded-xl transition-all flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-white">{exercise.name}</h4>
                    <p className="text-[10px] text-gray-400">
                      Target: <span className="text-cyan-400 font-medium capitalize">{exercise.targetMuscle || exercise.muscle || "General"}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 text-[11px] font-mono">
                    <span className="bg-slate-900 border border-gray-800 text-gray-300 px-2 py-1 rounded">
                      {exercise.sets || 3} sets
                    </span>
                    <span className="bg-slate-900 border border-gray-800 text-cyan-400 px-2 py-1 rounded">
                      {exercise.reps || '10-12'} reps
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-gray-800/60 flex justify-between items-center text-[10px] text-gray-500">
        <span>Target Goal: <strong className="text-gray-400 uppercase">{workoutPlan?.targetGoal || "Maintenance"}</strong></span>
        <span>Auto-synced with MongoDB</span>
      </div>
    </div>
  );
}

export default WorkoutCard;