// src/components/WeeklyPlanEngine.jsx
import React, { useState } from 'react';
import API from '../api/axios';

const WeeklyPlanEngine = () => {
  const [planOutput, setPlanOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError('');
    try {
      // API instance handles base URL and Authorization token automatically
      const response = await API.post('/workout/generate-plan');
      setPlanOutput(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error building automated workout blueprint mappings.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111a2e] text-gray-100 p-6 rounded-2xl border border-gray-800 shadow-xl max-w-4xl mx-auto mt-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Dynamic 7-Day Training Blueprint
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Reads your age, weight, and targets instantly from your account profile to map out an optimized microcycle.
          </p>
        </div>
        <button 
          onClick={handleGeneratePlan} 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/10 shrink-0 disabled:opacity-40"
        >
          {loading ? "Querying MongoDB Profiles..." : "Generate My Plan"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
          {error}
        </div>
      )}

      {/* Plan Dashboard Output Grid */}
      {planOutput && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#0a1120] border border-gray-800 p-4 rounded-xl flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="flex gap-2 items-center">
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {planOutput.meta.assignedGoal}
                </span>
                <span className="text-[10px] text-gray-500 font-mono font-bold">
                  {planOutput.meta.profileSummary}
                </span>
              </div>
              <h3 className="text-md font-bold text-white mt-1.5">
                {planOutput.meta.routineStyle}
              </h3>
            </div>
            <p className="text-xs text-gray-300 italic max-w-md md:text-right">
              {planOutput.meta.coachingDirective}
            </p>
          </div>

          {/* Day Selector Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-gray-800/60 pb-2">
            {planOutput.schedule.map((dayItem, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveDayIdx(idx)} 
                className={`text-xs px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeDayIdx === idx 
                    ? 'bg-cyan-500 text-black' 
                    : 'bg-[#0a1120] text-gray-400 hover:bg-[#15223d]'
                }`}
              >
                {dayItem.day}
              </button>
            ))}
          </div>

          {/* Active Target Routine Window */}
          <div className="bg-[#0a1120] p-4 rounded-xl border border-gray-800/60 min-h-[200px]">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-gray-800 pb-2 flex justify-between items-center">
              <span>Day Target Split Focus:</span>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">
                {planOutput.schedule[activeDayIdx].focus}
              </span>
            </h3>

            {planOutput.schedule[activeDayIdx].exercises.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs font-mono">
                Rest Day Protocol active. Allow neuromuscular networks and localized fibers to repair fully.
              </div>
            ) : (
              <div className="space-y-4 mt-3">
                {planOutput.schedule[activeDayIdx].exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="bg-[#121c33]/40 p-4 rounded-xl border border-gray-800/40">
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                      <h4 className="text-xs font-bold text-white tracking-wide">{ex.name}</h4>
                      <div className="text-[10px] space-x-2">
                        <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold">
                          Volumes: {ex.sets} Sets
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                          Reps: {ex.reps}
                        </span>
                      </div>
                    </div>
                    <ol className="text-[11px] text-gray-400 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                      {ex.procedures.map((step, sIdx) => (
                        <li key={sIdx} className="w-full text-left">{step}.</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanEngine;