// src/pages/UserInfo.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/authService.js";
import Button from "../components/Button";

const UserInfo = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    goal: "maintenance", // options: weight-loss, muscle-gain, maintenance
    activityLevel: "moderate",
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // 1. Calculate BMI for the AI
      const heightInMeters = formData.height / 100;
      const bmiValue = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);

      // 2. Prepare the data package
      const profileData = {
        ...formData,
        bmi: parseFloat(bmiValue),
      };

      // 3. Call the Backend
      const updatedUser = await updateProfile(profileData);
      
      console.log("Success! Profile updated:", updatedUser);
      alert(`BMI: ${bmiValue}. Your AI plan is ready!`);

      // 4. Go to Dashboard
      navigate("/dashboard");

    } catch (err) {
      alert("Error saving profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1627] flex items-center justify-center p-4 sm:p-6 md:p-8 text-white font-sans">
      <div className="w-full max-w-2xl bg-[#17223b] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-800 p-5 sm:p-8">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent tracking-tight">
            Set Up Your AI Profile
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
            We need these details to personalize your workout and mess diet.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Age */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1.5 text-xs sm:text-sm font-semibold">Age</label>
            <input 
              type="number" name="age" value={formData.age} onChange={handleChange}
              className="bg-[#0a1627] border border-gray-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 transition text-white placeholder-gray-500"
              placeholder="e.g. 21" required 
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1.5 text-xs sm:text-sm font-semibold">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}
              className="bg-[#0a1627] border border-gray-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 transition text-white">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Weight (kg) */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1.5 text-xs sm:text-sm font-semibold">Weight (kg)</label>
            <input 
              type="number" name="weight" value={formData.weight} onChange={handleChange}
              className="bg-[#0a1627] border border-gray-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 transition text-white placeholder-gray-500"
              placeholder="70" required 
            />
          </div>

          {/* Height (cm) */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1.5 text-xs sm:text-sm font-semibold">Height (cm)</label>
            <input 
              type="number" name="height" value={formData.height} onChange={handleChange}
              className="bg-[#0a1627] border border-gray-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 transition text-white placeholder-gray-500"
              placeholder="175" required 
            />
          </div>

          {/* Goal */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-gray-300 mb-1.5 text-xs sm:text-sm font-semibold">Your Primary Goal</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {['weight-loss', 'maintenance', 'muscle-gain'].map((goal) => (
                <button
                  key={goal} type="button"
                  onClick={() => setFormData({ ...formData, goal })}
                  className={`p-3 rounded-xl border text-xs font-bold uppercase transition active:scale-[0.98] ${
                    formData.goal === goal 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 border-transparent text-slate-950 font-black shadow-md' 
                    : 'bg-[#0a1627] border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {goal.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit" 
            loading={loading}
            className="md:col-span-2 mt-2 sm:mt-4 bg-gradient-to-r from-blue-500 to-cyan-400 py-3.5 sm:py-4 rounded-xl font-black text-slate-950 text-base sm:text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/10"
          >
            {loading ? "Generating Your Fitness Plan..." : "Generate My Fitness Plan →"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserInfo;