import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/authService.js"; // You'll implement this API call next

const UserInfo = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    goal: "maintenance", // options: weight-loss, muscle-gain, maintenance
    activityLevel: "moderate",
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 // src/pages/UserInfo.jsx

// ... inside the component
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1. Calculate BMI for the AI
    const heightInMeters = formData.height / 100;
    const bmiValue = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);

    // 2. Prepare the data package
    const profileData = {
      ...formData,
      bmi: parseFloat(bmiValue),
    };

    // 3. Call the Backend!
    const updatedUser = await updateProfile(profileData);
    
    console.log("Success! Profile updated:", updatedUser);
    alert(`BMI: ${bmiValue}. Your AI plan is ready!`);

    // 4. Go to Dashboard
    navigate("/dashboard");

  } catch (err) {
    alert("Error saving profile: " + err.message);
  }
};

  return (
    <div className="min-h-screen bg-[#0a1627] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-2xl bg-[#17223b] rounded-2xl shadow-2xl border border-gray-800 p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Set Up Your AI Profile
          </h1>
          <p className="text-gray-400 mt-2 text-sm">We need these details to personalize your workout and mess diet.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Age */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">Age</label>
            <input 
              type="number" name="age" value={formData.age} onChange={handleChange}
              className="bg-[#0a1627] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition text-white"
              placeholder="e.g. 21" required 
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}
              className="bg-[#0a1627] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition text-white">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Weight (kg) */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">Weight (kg)</label>
            <input 
              type="number" name="weight" value={formData.weight} onChange={handleChange}
              className="bg-[#0a1627] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500 text-white"
              placeholder="70" required 
            />
          </div>

          {/* Height (cm) */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">Height (cm)</label>
            <input 
              type="number" name="height" value={formData.height} onChange={handleChange}
              className="bg-[#0a1627] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500 text-white"
              placeholder="175" required 
            />
          </div>

          {/* Goal */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-gray-300 mb-2 text-sm">Your Primary Goal</label>
            <div className="grid grid-cols-3 gap-3">
              {['weight-loss', 'maintenance', 'muscle-gain'].map((goal) => (
                <button
                  key={goal} type="button"
                  onClick={() => setFormData({ ...formData, goal })}
                  className={`p-3 rounded-lg border text-xs font-bold uppercase transition ${
                    formData.goal === goal 
                    ? 'bg-blue-500 border-blue-400 text-white' 
                    : 'bg-[#0a1627] border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {goal.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="md:col-span-2 mt-4 bg-gradient-to-r from-blue-500 to-cyan-400 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
          >
            Generate My Fitness Plan →
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInfo;