// src/components/ExerciseSearchEngine.jsx
import React, { useState } from 'react';
import { searchExercisesAdvanced } from '../services/workoutService';

const ExerciseSearchEngine = () => {
  const [nameQuery, setNameQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openCardIndex, setOpenCardIndex] = useState(null);

  const muscles = ["all", "abdominals", "biceps", "calves", "chest", "forearms", "glutes", "hamstrings", "lats", "lower_back", "quadriceps", "traps", "triceps"];
  const types = ["all", "cardio", "olympic_weightlifting", "plyometrics", "powerlifting", "strength", "stretching", "strongman"];
  const difficulties = ["all", "beginner", "intermediate", "expert"];

  const handleSearchExecute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    setOpenCardIndex(null);

    try {
      // 🌟 Send everything formatted in lowercase to play nicely with API Ninjas
      const data = await searchExercisesAdvanced({
        name: nameQuery.trim(),
        muscleGroup: selectedMuscle.toLowerCase(),
        type: selectedType.toLowerCase(),
        difficulty: selectedDifficulty.toLowerCase()
      });
      setResults(data.exercises);
    } catch (err) {
      setError(err.message || "No records found matching those specific filters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111a2e] text-gray-100 p-6 rounded-2xl border border-gray-800 shadow-xl max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide">Advanced Exercise Search Engine</h2>
        <p className="text-xs text-gray-400 mt-1">Query over 3,000 movements dynamically. Filter by text names, mechanics, target muscles, or difficulty tiers simultaneously.</p>
      </div>

      <form onSubmit={handleSearchExecute} className="space-y-4 bg-[#0a1120] p-4 rounded-xl border border-gray-800/80 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Search by Name (e.g. Press, Curl)</label>
            <input 
              type="text" 
              value={nameQuery} 
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="Type keyword..." 
              className="w-full bg-[#17223b] border border-gray-800 text-xs text-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Target Muscle Group</label>
            <select value={selectedMuscle} onChange={(e) => setSelectedMuscle(e.target.value)} className="w-full bg-[#17223b] border border-gray-800 text-xs text-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 capitalize">
              {muscles.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Movement Modality / Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-[#17223b] border border-gray-800 text-xs text-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 capitalize">
              {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Difficulty Experience Tier</label>
            <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="w-full bg-[#17223b] border border-gray-800 text-xs text-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 capitalize">
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all tracking-wide disabled:opacity-40">
          {loading ? "Querying Active Global Servers..." : "Run Active Parameter Filter"}
        </button>
      </form>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">{error}</div>}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-gray-400 pl-1">Found <strong className="text-cyan-400">{results.length}</strong> matching movements:</div>
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {results.map((exercise, idx) => (
              <div key={idx} className="bg-[#0a1120] border border-gray-800/80 rounded-xl overflow-hidden shadow-md">
                <button
                  type="button"
                  onClick={() => setOpenCardIndex(openCardIndex === idx ? null : idx)}
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-[#152035] transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">{exercise.name}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[9px] bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded uppercase">{exercise.muscle.replace('_', ' ')}</span>
                      <span className="text-[9px] bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded capitalize">{exercise.type.replace('_', ' ')}</span>
                      <span className="text-[9px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded">Gear: {exercise.equipment}</span>
                    </div>
                  </div>
                  <span className="text-cyan-400 text-xs font-mono">{openCardIndex === idx ? '▲' : '▼'}</span>
                </button>

                {openCardIndex === idx && (
                  <div className="bg-[#121c33]/40 border-t border-gray-800/60 p-4 space-y-3 animate-fadeIn">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Execution Directives</div>
                    <ol className="space-y-2">
                      {exercise.procedures.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-xs text-gray-300 flex items-start gap-3 leading-relaxed">
                          <span className="bg-[#17223b] text-cyan-400 font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">{stepIdx + 1}</span>
                          <span className="flex-1">{step}.</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseSearchEngine;