import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../services/authService";
import StatCard from "../components/StatCard";
import ProgressChart from "../components/ProgressChart"; 
import WorkoutCard from "../components/WorkoutCard";
import DietCard from "../components/DietCard";
import { calculateDailyTarget } from "../utils/calorieCalculator";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [targets, setTargets] = useState({ calories: 0, protein: 0 });
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
        const calculated = calculateDailyTarget(data);
        const carbTarget = Math.round((calculated.calories*0.5) / 4); // Rough carb calculation
        setTargets({
          ...calculated,
          carbs: carbTarget
        });
        setLoading(false);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1627] flex items-center justify-center text-white font-bold">
        Analyzing Fitness Data...
      </div>
    );
  }

  return (
    /* MAIN CONTAINER: Matches your login page theme */
    <div className="min-h-screen bg-[#0a1627] text-white flex flex-col md:flex-row">
      
      {/* SIDEBAR AREA (Optional but recommended for pro look) */}
      <aside className="w-full md:w-64 bg-[#0a1627] border-r border-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-10">
            FIT HOSTEL AI
          </h2>
          <nav className="space-y-4">
            <div className="text-blue-400 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 cursor-pointer">Dashboard</div>
            <div className="text-gray-400 hover:text-white p-3 cursor-pointer transition">Workout Plan</div>
            <div className="text-gray-400 hover:text-white p-3 cursor-pointer transition">Mess Menu</div>
          </nav>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition mt-10"
        >
          Logout
        </button>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* 1. Welcome Header */}
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-blue-400">{user?.name}!</span>
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Status: <span className="text-cyan-400 font-medium">{user?.bmi} BMI</span> • {user?.goal?.replace('-', ' ')}
            </p>
          </div>
          <div className="hidden md:block w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-lg">
             {user?.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* 2. STAT CARDS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Calories" value={0} goal={targets.calories} unit="kcal" color="text-orange-400" />
          <StatCard title="Protein" value={0} goal={targets.protein} unit="g" color="text-blue-400" />
          <StatCard title="Carbs" value={0} goal={targets.carbs} unit="g" color="text-green-400" />
          <StatCard title="Water" value={2.5} goal={4.0} unit="L" color="text-cyan-400" />
        </div>

        {/* 3. Main Content (Workout & Diet) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Today's Tasks */}
          <div className="lg:col-span-2 space-y-8">
             <WorkoutCard goal={user?.goal}/>
             <DietCard goal={user?.goal}/>
          </div>

          {/* Right Side: Visual Progress */}
          <div className="bg-[#17223b] p-8 rounded-2xl border border-gray-800 shadow-2xl h-fit">
            <h3 className="text-xl font-semibold mb-6 text-white border-b border-gray-800 pb-4">Weekly Intensity</h3>
            <ProgressChart />
            <div className="mt-8 p-4 bg-[#0a1627] rounded-xl border border-gray-800">
               <p className="text-xs text-gray-400 uppercase">AI Suggestion</p>
               <p className="text-sm text-blue-300 mt-2 italic font-medium leading-relaxed">
                   "Based on your {user?.goal} goal, aim for {targets.protein}g of protein. If the mess serves dal today, double your portion!"
                 </p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default Dashboard;