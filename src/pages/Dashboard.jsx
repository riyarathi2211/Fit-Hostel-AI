// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import DailyCheckInModal from '../components/DailyCheckInModal';

function Dashboard() {
  const [todayRoutine, setTodayRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic state initialized with 0 to prevent fallback to 80 kg
  const [metrics, setMetrics] = useState({
    calories: 2750,
    protein: 154,
    carbs: 300,
    waterTarget: 14,
    currentCalories: 1571,
    currentProtein: 53.5,
    currentCarbs: 269.6,
    currentWater: 10,
    currentWeight: 58,
    targetWeight: 72,
    heightCm: 175,
    goal: 'WEIGHT-LOSS'
  });

  const [weightHistory, setWeightHistory] = useState([]);

  useEffect(() => {
    fetchUserData();
    const handleUpdate = () => fetchUserData();
    window.addEventListener('workoutPlanUpdated', handleUpdate);
    return () => window.removeEventListener('workoutPlanUpdated', handleUpdate);
  }, []);

  const fetchUserData = async () => {
    try {
      // API instance handles base URL and Authorization headers automatically
      const response = await API.get('/auth/profile');

      const user = response.data?.user || response.data || {};
      const schedule = user.savedWorkoutPlan?.schedule || [];
      const idealWeight = user.targetWeight || 72;

      // Extract array from either monthly weight history or check-ins
      const logsArray = user.monthlyWeightLogs || user.checkInHistory || user.weightLogs || [];
      
      // Determine most recent logged weight or fallback to profile weight
      const latestLoggedWeight = logsArray.length > 0 
        ? logsArray[logsArray.length - 1].weight 
        : (user.weight || user.currentWeight || 58);

      setMetrics((prev) => ({
        ...prev,
        calories: user.targetCalories || user.calories || prev.calories,
        protein: user.targetProtein || user.protein || prev.protein,
        currentWeight: Number(latestLoggedWeight),
        targetWeight: Number(idealWeight),
        goal: user.target || user.goal || prev.goal,
        currentCalories: user.currentCalories ?? prev.currentCalories,
        currentProtein: user.currentProtein ?? prev.currentProtein
      }));

      // Map weight logs dynamically
      let historyLogs = [];
      if (logsArray.length > 0) {
        historyLogs = logsArray.map((item, idx) => ({
          period: item.monthLabel || (item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Log ${idx + 1}`),
          Weight: Number(item.weight),
          Ideal: Number(idealWeight)
        }));
      } else {
        historyLogs = [
          { period: 'Initial', Weight: Number(latestLoggedWeight), Ideal: Number(idealWeight) }
        ];
      }

      setWeightHistory(historyLogs);

      // Daily Workout Split Match
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDayName = daysOfWeek[new Date().getDay()];

      const matchedDay = schedule.find(s => 
        s.day && String(s.day).toLowerCase().includes(currentDayName.toLowerCase())
      ) || schedule[0] || null;

      setTodayRoutine(matchedDay);
    } catch (err) {
      console.error("Failed to load user profile and workout data:", err);
    } font-mono finally {
      setLoading(false);
    }
  };

  const calPercent = Math.min(Math.round((metrics.currentCalories / metrics.calories) * 100), 100);
  const proteinPercent = Math.min(Math.round((metrics.currentProtein / metrics.protein) * 100), 100);
  const carbPercent = Math.min(Math.round((metrics.currentCarbs / metrics.carbs) * 100), 100);
  const waterPercent = Math.min(Math.round((metrics.currentWater / metrics.waterTarget) * 100), 100);

  // Weight Difference
  const rawDiff = metrics.currentWeight - metrics.targetWeight;
  const weightDiff = Math.abs(rawDiff).toFixed(1);

  return (
    <div className="p-6 md:p-8 space-y-8 text-white bg-[#0a1424] min-h-screen">
      
      <DailyCheckInModal onUpdateComplete={fetchUserData} />

      {/* MACRO METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#131f37] border border-cyan-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">CALORIES</span>
            <span className="text-xs font-black text-[#0a1424] bg-cyan-400 px-2.5 py-1 rounded-md shadow">
              Target: {metrics.calories}
            </span>
          </div>
          <p className="text-3xl font-black mt-3 text-white">
            {metrics.currentCalories} <span className="text-sm font-semibold text-gray-400">kcal</span>
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-cyan-400 h-full transition-all duration-500 rounded-full" style={{ width: `${calPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-[#131f37] border border-purple-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">PROTEIN</span>
            <span className="text-xs font-black text-white bg-purple-600 px-2.5 py-1 rounded-md shadow">
              Target: {metrics.protein}g
            </span>
          </div>
          <p className="text-3xl font-black mt-3 text-white">
            {metrics.currentProtein} <span className="text-sm font-semibold text-gray-400">g</span>
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-purple-500 h-full transition-all duration-500 rounded-full" style={{ width: `${proteinPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-[#131f37] border border-pink-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">CARBS</span>
            <span className="text-xs font-black text-white bg-pink-600 px-2.5 py-1 rounded-md shadow">
              Target: {metrics.carbs}g
            </span>
          </div>
          <p className="text-3xl font-black mt-3 text-white">
            {metrics.currentCarbs} <span className="text-sm font-semibold text-gray-400">g</span>
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-pink-500 h-full transition-all duration-500 rounded-full" style={{ width: `${carbPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-[#131f37] border border-blue-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">WATER TARGET</span>
            <span className="text-xs font-black text-[#0a1424] bg-blue-400 px-2.5 py-1 rounded-md shadow">
              Target: {metrics.waterTarget}
            </span>
          </div>
          <p className="text-3xl font-black mt-3 text-white">
            {metrics.currentWater} <span className="text-sm font-semibold text-gray-400">Glasses</span>
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-400 h-full transition-all duration-500 rounded-full" style={{ width: `${waterPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* WEIGHT PROGRESS CHART */}
      <div className="bg-[#131f37] border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Physical Improvement & Weight Progress</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Tracking physical transformation toward your ideal weight target
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-black bg-slate-800 text-gray-300 px-3 py-1.5 rounded-xl border border-slate-700">
              Current: <strong className="text-white font-black">{metrics.currentWeight} kg</strong>
            </span>
            <span className="text-xs font-black bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-500/40">
              Ideal Target: <strong className="text-cyan-400 font-black">{metrics.targetWeight} kg</strong>
            </span>
            <span className="text-xs font-black bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-xl border border-purple-500/40">
              {rawDiff > 0 ? `${weightDiff} kg to lose` : `${weightDiff} kg gained`}
            </span>
          </div>
        </div>
        
        <div className="h-80 w-full bg-[#0a1424]/60 rounded-xl p-4 border border-slate-800/80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightHistory} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="period" 
                stroke="#94a3b8" 
                fontSize={13} 
                fontWeight="bold"
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
              />
              
              {/* Dynamic 0 - 100 Axis Range */}
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                domain={[0, 100]}
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
                unit=" kg"
              />
              
              <Tooltip
                cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "10px",
                  color: "#fff"
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '15px' }} iconType="circle" />
              
              <ReferenceLine 
                y={metrics.targetWeight} 
                stroke="#22d3ee" 
                strokeDasharray="5 5" 
                label={{ value: 'IDEAL TARGET', fill: '#22d3ee', fontSize: 10, fontWeight: 'bold', position: 'insideTopRight' }} 
              />
              
              <Line 
                name="Actual Weight (kg)" 
                type="monotone" 
                dataKey="Weight" 
                stroke="#38bdf8" 
                strokeWidth={3}
                dot={{ fill: '#38bdf8', r: 6 }}
                activeDot={{ r: 8, fill: '#67e8f9' }}
              />
              <Line 
                name="Ideal Goal (kg)" 
                type="monotone" 
                dataKey="Ideal" 
                stroke="#a855f7" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* WORKOUT & MESS DIET PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#131f37] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-black text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30 uppercase tracking-widest">
                {todayRoutine?.day || 'TODAY'}
              </span>
              <h2 className="text-xl font-black text-white mt-2 uppercase tracking-wide">
                {todayRoutine?.focus ? `${todayRoutine.focus} SPLIT` : 'WORKOUT SPLIT'}
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-300 bg-[#0a1424] px-3.5 py-1.5 rounded-xl border border-slate-800">
              {todayRoutine?.exercises?.length || 0} Exercises
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400 animate-pulse font-mono">
              Loading workout routines...
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {todayRoutine?.exercises?.map((exercise, idx) => (
                <div key={idx} className="bg-[#0a1424] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
                  <div>
                    <h3 className="text-sm font-bold text-white">{exercise.name || 'Exercise'}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Target: <span className="text-cyan-400 font-semibold">{exercise.equipment || 'General'}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-[#131f37] text-gray-300 px-3 py-1 rounded-lg border border-slate-800">{exercise.sets || '3'} Sets</span>
                    <span className="text-xs font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg border border-cyan-500/30">{exercise.reps || '12-15'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#131f37] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Today's Mess Diet Advisor</h2>
            <p className="text-xs font-bold text-cyan-400 mt-1 uppercase tracking-wider">
              PROFILE TARGET: {metrics.goal}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0a1424] border border-slate-800 rounded-xl p-4 flex justify-between items-center shadow-md">
              <h4 className="text-sm font-bold text-white">Breakfast <span className="text-xs text-gray-400 font-normal ml-1">(460 Kcal)</span></h4>
              <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">P: 16.3g</span>
            </div>
            <div className="bg-[#0a1424] border border-slate-800 rounded-xl p-4 flex justify-between items-center shadow-md">
              <h4 className="text-sm font-bold text-white">Lunch <span className="text-xs text-gray-400 font-normal ml-1">(454 Kcal)</span></h4>
              <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">P: 14.1g</span>
            </div>
            <div className="bg-[#0a1424] border border-slate-800 rounded-xl p-4 flex justify-between items-center shadow-md">
              <h4 className="text-sm font-bold text-white">Dinner <span className="text-xs text-gray-400 font-normal ml-1">(657 Kcal)</span></h4>
              <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">P: 23.1g</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;