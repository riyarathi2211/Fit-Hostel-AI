// src/components/MonthlyWeightChart.jsx (Testing Mode)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function MonthlyWeightChart() {
  const [logs, setLogs] = useState([]);
  const [idealTarget, setIdealTarget] = useState(72);
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeightHistory();

    // ⏱️ TESTING MODE: Trigger the alert/modal exactly 1 minute (60,000 ms) after loading
    const testTimer = setTimeout(() => {
      setShowModal(true);
    }, 60000); // 1 minute delay

    return () => clearTimeout(testTimer);
  }, []);

  const fetchWeightHistory = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/user/monthly-weight-history", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const historyData = res.data?.history || [];
      const userTarget = res.data?.idealTarget || 72;
      setLogs(historyData);
      setIdealTarget(userTarget);
    } catch (err) {
      console.error("Error fetching weight logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight)) return;

    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/user/log-monthly-weight",
        { weight: parseFloat(newWeight) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add newly submitted weight entry to local state and update chart instantly
      const updatedHistory = res.data?.history || [
        ...logs,
        {
          weight: parseFloat(newWeight),
          date: new Date(),
          monthLabel: `Entry ${logs.length + 1}`
        }
      ];

      setLogs(updatedHistory);
      setShowModal(false);
      setNewWeight("");
    } catch (err) {
      console.error("Failed to submit monthly weight:", err);
    }
  };

  // Format array for Recharts dynamically based on actual entries
  const chartData = logs.map((item, idx) => ({
    monthLabel: item.monthLabel || `Entry ${idx + 1}`,
    actual: item.weight,
    ideal: idealTarget
  }));

  if (loading) return <div className="p-6 text-gray-400 text-xs animate-pulse">Loading Chart...</div>;

  return (
    <div className="bg-[#17223b] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4 relative">
      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Monthly Weight Progress
          </h2>
          <p className="text-xs text-cyan-400 mt-0.5">
            [TEST MODE] Modal will auto-pop 1 minute after login
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg font-bold hover:bg-cyan-500/20 transition"
        >
          + Manual Test Entry
        </button>
      </div>

      {/* RECHARTS DYNAMIC PLOT */}
      <div className="h-64 w-full pt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            No entries recorded yet. Wait 1 minute for test alert or click "+ Manual Test Entry".
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0a1627", borderColor: "#1e293b", borderRadius: "12px" }}
              />
              <ReferenceLine y={idealTarget} label="TARGET" stroke="#a855f7" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={3} dot={{ r: 5, fill: "#22d3ee" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 1-MINUTE TEST INPUT POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#17223b] border border-cyan-500/50 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
              ⏱️ 1-Minute Check-In Prompt
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Please enter your updated body weight (kg) to plot your new monthly progress point.
            </p>
            <form onSubmit={handleWeightSubmit} className="space-y-4">
              <input
                type="number"
                step="0.1"
                placeholder="Enter current weight (e.g. 79.5)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full bg-[#0a1627] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 transition"
                >
                  Save & Update Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyWeightChart;