// src/pages/MessMenu.jsx
import React, { useState, useEffect } from 'react';
import API from '../api/axios';

function MessMenu() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Track which day cards are expanded (allows multiple open, or close all)
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    const fetchFullWeekDiet = async () => {
      try {
        // API instance handles base URL and Authorization headers automatically
        const response = await API.get('/diet/my-weekly-diet');
        setWeeklyData(response.data);
        
        // Default behavior: Automatically expand today's card on initial load
        const daysLookup = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDayName = daysLookup[new Date().getDay()];
        setExpandedDays({ [currentDayName]: true });
        
        setLoading(false);
      } catch (err) {
        console.error("Weekly diet page fetch error:", err);
        setError('Unable to fetch your full weekly mess nutrition configuration details.');
        setLoading(false);
      }
    };

    fetchFullWeekDiet();
  }, []);

  const toggleDayAccordion = (dayName) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayName]: !prev[dayName]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Generating Full Weekly Nutrition Matrices...</p>
      </div>
    );
  }

  if (error || !weeklyData) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4">
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{error}</p>
      </div>
    );
  }

  const targetGoal = weeklyData.goal;
  const weeklyPlans = weeklyData.weeklyDietPlan;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER AREA */}
        <div className="bg-[#17223b] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                NIT Hamirpur Hostels
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mt-3">
                Full Weekly Hostel Mess Menu Blueprint
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Click any day to expand its specific meal portions and structural macro targets.
              </p>
            </div>
            <div className="bg-[#0a1627] border border-gray-800 px-5 py-3 rounded-2xl w-max">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Profile Target</div>
              <div className="text-lg font-black text-cyan-400 tracking-wide mt-0.5">{targetGoal}</div>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE ACCORDION LIST */}
        <div className="space-y-3">
          {weeklyPlans.map((dayPlan) => {
            const meals = dayPlan.meals;
            const isExpanded = !!expandedDays[dayPlan.day];
            
            // Calculate total nutrients consumed across this entire specific day
            const dayTotalCalories = Object.values(meals).reduce((acc, m) => acc + m.totals.calories, 0);
            const dayTotalProtein = Object.values(meals).reduce((acc, m) => acc + m.totals.protein, 0);
            const dayTotalCarbs = Object.values(meals).reduce((acc, m) => acc + m.totals.carbs, 0);

            // Match day against user system date clock for a subtle highlight line edge
            const daysLookup = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const isToday = daysLookup[new Date().getDay()].toLowerCase() === dayPlan.day.toLowerCase();

            return (
              <div 
                key={dayPlan.day} 
                className={`bg-[#17223b] rounded-2xl overflow-hidden shadow-xl border transition-all duration-200
                  ${isToday ? 'border-cyan-500/40' : 'border-gray-800'}`}
              >
                
                {/* CLICKABLE ROW ACCORDION TRIGGER */}
                <div 
                  onClick={() => toggleDayAccordion(dayPlan.day)}
                  className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 cursor-pointer hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">{dayPlan.day}</h2>
                    {isToday && (
                      <span className="text-[9px] uppercase tracking-wider font-black bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded-md">
                        Today
                      </span>
                    )}
                  </div>

                  {/* MINI SUMMARY ON CONTAINER ROW (STAYS VISIBLE ALWAYS) */}
                  <div className="flex flex-wrap gap-4 items-center text-xs font-mono">
                    <div className="flex items-center gap-3 text-gray-400">
                      <span>P: <strong className="text-cyan-400 font-medium">{dayTotalProtein.toFixed(1)}g</strong></span>
                      <span>C: <strong className="text-purple-400 font-medium">{dayTotalCarbs.toFixed(1)}g</strong></span>
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md text-[11px] font-bold">
                        {dayTotalCalories} kcal
                      </span>
                    </div>
                    {/* Visual toggle chevron tracker matching dashboard design exactly */}
                    <span className={`text-xs text-gray-500 transition-transform duration-200 ml-2 ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* EXPANDABLE WRAPPER DRAWER PANEL */}
                {isExpanded && (
                  <div className="p-6 bg-[#0f172a]/50 border-t border-gray-800/60 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {Object.keys(meals).map((mealName) => {
                      const currentMeal = meals[mealName];

                      return (
                        <div key={mealName} className="bg-[#0a1627] border border-gray-800/60 rounded-xl p-4 space-y-3">
                          
                          {/* TIME BLOCK SUB-ROW TITLE HEADER */}
                          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <h3 className="capitalize font-black text-white text-xs tracking-wider">{mealName}</h3>
                            <span className="text-[10px] text-cyan-400 font-bold font-mono bg-cyan-500/5 border border-cyan-500/10 px-1.5 py-0.5 rounded">
                              {currentMeal.totals.calories} cal
                            </span>
                          </div>

                          {/* FOOD SPLIT METRIC TARGET ROWS */}
                          <div className="space-y-2">
                            {currentMeal.items.map((item, idx) => (
                              <div key={idx} className="bg-[#111d33]/50 p-2.5 rounded-lg border border-gray-800/40 space-y-1.5">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-xs font-bold text-gray-300 leading-tight">{item.name}</span>
                                  <span className="text-[10px] text-right font-mono text-cyan-400 font-bold whitespace-nowrap">
                                    P: {item.macros.protein}g
                                  </span>
                                </div>
                                
                                <div className="flex justify-between items-center text-[10px] border-t border-gray-800/30 pt-1 mt-0.5">
                                  <span className="text-gray-400">
                                    Take: <strong className="text-cyan-400 font-medium">{item.recommendedQuantity}</strong>
                                  </span>
                                  <span className="text-purple-400 font-mono">C: {item.macros.carbs}g</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* MEAL LEVEL SUMMARY BASE FOOT NOTES */}
                          <div className="pt-1.5 flex justify-between text-[9px] font-mono text-gray-500 border-t border-gray-800/30">
                            <span>Protein: {currentMeal.totals.protein}g</span>
                            <span>Carbs: {currentMeal.totals.carbs}g</span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* BOTTOM ADVISORY NOTE TILES BOX */}
        <div className="bg-[#17223b] border border-gray-800 rounded-3xl p-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-2 border-b border-gray-800">
            Macro Survival Strategies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400 leading-relaxed">
            <p className="bg-[#0a1627] p-4 rounded-xl border border-gray-800/60">
              On Wednesdays and Fridays, prioritize your target protein allocations completely during dinner (Paneer/Chicken).
            </p>
            <p className="bg-[#0a1627] p-4 rounded-xl border border-gray-800/60">
              On heavy carbohydrate lunch items like Rajma Chawal or Chole Bhature, carefully control your portion spreads if you are on a caloric deficit track.
            </p>
            <p className="bg-[#0a1627] p-4 rounded-xl border border-gray-800/60">
              Keep a backup bag of extra eggs, sprouts, or alternative whey protein inside your hostel room for low-protein menu windows (like Saturday dinner).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MessMenu;