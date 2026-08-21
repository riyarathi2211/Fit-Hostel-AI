// src/components/DailyCheckInModal.jsx
import React, { useState, useEffect } from 'react';
import API from '../api/axios';

function DailyCheckInModal({ onUpdateComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feedback, setFeedback] = useState('Optimal');
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    checkEligibility();

    // Poll eligibility every 60 seconds to check 1-day completion
    const interval = setInterval(() => {
      checkEligibility();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const checkEligibility = async () => {
    try {
      // API instance automatically handles authorization token
      const res = await API.get('/auth/profile');

      const userData = res.data?.user || res.data || {};
      const lastCheckIn = new Date(userData.lastCheckInDate || 0);
      const now = new Date();

      // Calculate time difference in hours (24 hours = 1 day)
      const hoursDiff = (now - lastCheckIn) / (1000 * 60 * 60);

      if (hoursDiff >= 24 || !userData.lastCheckInDate) {
        setWeight(userData.weight || '');
        setHeight(userData.height || '');
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Error checking daily check-in eligibility:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/progress/daily-checkin', { weight, height, feedback });

      setSummaryData(res.data);
      window.dispatchEvent(new Event('workoutPlanUpdated'));
    } catch (err) {
      console.error('Check-in submission failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#17223b] border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        
        {!summaryData ? (
          <>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded border border-cyan-500/20 uppercase">
                1-Day Evaluation Alert
              </span>
              <h2 className="text-xl font-extrabold text-white mt-2">Daily Progress Check-In</h2>
              <p className="text-xs text-gray-400 mt-1">
                It's been 1 day! Update your metrics so we can adapt today's diet and workout plan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-[#0a1627] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-[#0a1627] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Yesterday's Routine Intensity</label>
                <select
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-[#0a1627] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Too Easy">Too Easy (Increase Intensity)</option>
                  <option value="Optimal">Optimal (Keep Current Volume)</option>
                  <option value="Too Heavy">Too Heavy (Reduce Intensity)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                Recalculate 1-Day Plan
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-white">1-Day Adaptation Summary</h2>
              <p className="text-xs text-emerald-400 mt-0.5">✓ Diet and exercise targets recalculated successfully!</p>
            </div>

            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#0a1627] text-gray-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Metric</th>
                    <th className="p-3">Updated Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="p-3 text-gray-400">Weight / Height</td>
                    <td className="p-3 font-bold text-white">{summaryData.summary?.weight} kg / {summaryData.summary?.height} cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-400">Intensity Feedback</td>
                    <td className="p-3 font-bold text-cyan-400">{summaryData.summary?.feedback}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-400">New Daily Calories</td>
                    <td className="p-3 font-bold text-white">{summaryData.adjustedPlan?.targetCalories} kcal</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-400">New Daily Protein</td>
                    <td className="p-3 font-bold text-purple-400">{summaryData.adjustedPlan?.targetProtein} g</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onUpdateComplete) onUpdateComplete();
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default DailyCheckInModal;