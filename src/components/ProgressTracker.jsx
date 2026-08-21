// src/components/ProgressTracker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function ProgressTracker({ userData, refreshKey }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchWeightHistory = useCallback(async () => {
    try {
      // Axios instance automatically attaches JWT token and uses production baseURL
      const response = await API.get('/auth/monthly-weight-history');

      const historyData = response.data?.history || response.data?.monthlyWeightLogs || [];
      setLogs(historyData);
    } catch (err) {
      console.error("Failed to fetch weight logs:", err);
      setError('Unable to retrieve weight progress from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state if userData or refreshKey is provided by parent (Profile.jsx)
  useEffect(() => {
    if (userData?.monthlyWeightLogs) {
      setLogs(userData.monthlyWeightLogs);
      setLoading(false);
    } else {
      fetchWeightHistory();
    }
  }, [userData, refreshKey, fetchWeightHistory]);

  // Listen for global custom events from Profile / Modals
  useEffect(() => {
    const handleSync = () => fetchWeightHistory();

    window.addEventListener('workoutPlanUpdated', handleSync);
    window.addEventListener('profileUpdated', handleSync);

    return () => {
      window.removeEventListener('workoutPlanUpdated', handleSync);
      window.removeEventListener('profileUpdated', handleSync);
    };
  }, [fetchWeightHistory]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    const numericWeight = Number(weight);

    if (!weight || isNaN(numericWeight)) {
      setError('Please enter a valid weight.');
      return;
    }

    if (numericWeight < 0 || numericWeight > 300) {
      setError('Weight must be between 0 kg and 300 kg.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await API.post('/auth/log-monthly-weight', { weight: numericWeight });

      const updatedLogs = response.data?.history || response.data?.monthlyWeightLogs || [];
      setLogs(updatedLogs);
      setWeight('');

      // Broadcast event to trigger automatic updates across other components
      window.dispatchEvent(new Event('workoutPlanUpdated'));
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error("Failed to log weight:", err);
      setError(err.response?.data?.message || 'Failed to submit weight entry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#17223b] border border-gray-800 rounded-2xl p-6 text-center text-xs text-gray-400 font-mono">
        Loading weight history...
      </div>
    );
  }

  return (
    <div className="bg-[#17223b] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Weight Progress & Check-In Logs
        </h3>

        <form onSubmit={handleLogWeight} className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            max="300"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-28 bg-[#0a1627] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/10 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : '+ Log Entry'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
          ⚠ {error}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-10 text-xs text-gray-400 font-mono">
          No check-in entries logged yet. Complete your first daily check-in to track progress!
        </div>
      ) : (
        <div className="space-y-6">
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="monthLabel" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickFormatter={(val, idx) => val || `Log ${idx + 1}`}
                />
                
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']} 
                  stroke="#64748b" 
                  fontSize={10} 
                  unit=" kg"
                />
                
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1627', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ fill: '#0284c7', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800 text-[10px] uppercase tracking-wider">
                  <th className="pb-2 font-bold">Date / Month</th>
                  <th className="pb-2 font-bold">Logged Weight</th>
                  <th className="pb-2 font-bold">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 text-gray-300">
                {logs.slice().reverse().map((log, index, arr) => {
                  const previousEntry = arr[index + 1];
                  const variance = previousEntry 
                    ? (log.weight - previousEntry.weight).toFixed(1) 
                    : 0;

                  return (
                    <tr key={log._id || index} className="hover:bg-[#0a1627]/50 transition-colors">
                      <td className="py-2.5 font-mono text-gray-400">
                        {log.monthLabel || (log.date ? new Date(log.date).toLocaleDateString() : `Entry ${logs.length - index}`)}
                      </td>
                      <td className="py-2.5 font-bold text-cyan-400">{log.weight} kg</td>
                      <td className="py-2.5">
                        {variance > 0 ? (
                          <span className="text-emerald-400 font-bold">+{variance} kg</span>
                        ) : variance < 0 ? (
                          <span className="text-rose-400 font-bold">{variance} kg</span>
                        ) : (
                          <span className="text-gray-500">0.0 kg</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressTracker;