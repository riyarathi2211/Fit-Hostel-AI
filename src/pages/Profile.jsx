// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProgressTracker from '../components/ProgressTracker.jsx';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Forces child component refetch

  // Local form state mirror matching parameter schema
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    target: 'MAINTENANCE'
  });

  useEffect(() => {
    fetchProfile();
  }, [refreshKey]);

  const getAuthToken = () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  };

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authorization token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data?.user || response.data || {};
      setProfileData(userData);

      setFormData({
        age: userData.age !== undefined ? userData.age : '',
        gender: userData.gender || '',
        weight: userData.weight !== undefined ? userData.weight : '',
        height: userData.height !== undefined ? userData.height : '',
        target: userData.target || userData.goal || 'MAINTENANCE'
      });
      setLoading(false);
    } catch (err) {
      console.error("Error reading profile metrics from database:", err);
      setError('Could not retrieve data parameters from the database.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const token = getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const payload = {
        age: Number(formData.age),
        gender: formData.gender.toLowerCase(),
        weight: Number(formData.weight),
        height: formData.height ? Number(formData.height) : undefined,
        target: formData.target.toLowerCase(),
        regeneratePlan: true
      };

      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        payload,
        { headers }
      );

      const updatedUser = response.data?.user || response.data;

      if (updatedUser) {
        setProfileData(updatedUser);
        // Sync formData explicitly with returned DB values
        setFormData({
          age: updatedUser.age,
          gender: updatedUser.gender,
          weight: updatedUser.weight,
          height: updatedUser.height,
          target: updatedUser.target || 'MAINTENANCE'
        });
      }

      // Notify rest of the app via global window events
      window.dispatchEvent(new Event('workoutPlanUpdated'));
      window.dispatchEvent(new Event('profileUpdated'));

      // Trigger child component (ProgressTracker) to re-render with new DB data
      setRefreshKey(prev => prev + 1);

      setSuccessMessage('Biometric parameters and workout plan updated successfully.');
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile parameters:", err);
      setError(err.response?.data?.message || 'Could not save parameters to database.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-gray-300 text-lg animate-pulse font-mono font-medium">Accessing Core Databases...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">

      {/* PROFILE HEADER PANEL */}
      <div className="bg-[#17223b] border border-gray-800 rounded-3xl p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-2xl shadow-inner">
            {profileData?.name ? profileData.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {profileData?.name || 'Fitness User'}
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Account Status: <span className="text-cyan-400 font-bold uppercase tracking-wider text-xs bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-500/20">Authorized Matrix</span>
            </p>
          </div>
        </div>

        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold rounded-2xl hover:bg-cyan-500/20 transition-all duration-150 shadow-md"
          >
            Change Parameters
          </button>
        )}
      </div>

      {/* FEEDBACK STATUS ALERTS */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl font-semibold">
          ✓ {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl font-semibold">
          ⚠ {error}
        </div>
      )}

      {/* SPECIFICATIONS GRID BOX */}
      <div className="bg-[#17223b] border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider border-b border-gray-800 pb-3">
          {isEditing ? "Modify Fitness Metrics Layout" : "Biometric Target Parameters"}
        </h2>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

              <div className="space-y-2">
                <label className="text-gray-300 font-bold uppercase text-xs tracking-wider">Age Group (Years)</label>
                <input 
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a1627] border border-gray-700 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 font-bold uppercase text-xs tracking-wider">Gender Allocation</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a1627] border border-gray-700 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-cyan-400 transition-colors capitalize"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 font-bold uppercase text-xs tracking-wider">Body Weight (kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a1627] border border-gray-700 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 font-bold uppercase text-xs tracking-wider">Height (cm)</label>
                <input 
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a1627] border border-gray-700 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-300 font-bold uppercase text-xs tracking-wider">Target Track Protocol</label>
                <select 
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a1627] border border-gray-700 rounded-2xl p-4 text-cyan-400 font-black text-base focus:outline-none focus:border-cyan-400 transition-colors uppercase"
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="muscle gain">Muscle Gain</option>
                  <option value="weight loss">Weight Loss</option>
                  <option value="fat loss">Fat Loss</option>
                </select>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 text-sm font-bold">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-transparent text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-cyan-500 text-slate-950 font-extrabold rounded-2xl hover:bg-cyan-400 transition shadow-xl shadow-cyan-500/20"
              >
                Save Parameters
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="bg-[#0a1627] p-5 rounded-2xl border border-gray-800">
              <span className="text-gray-400 block uppercase font-bold text-xs">Age Group</span>
              <span className="text-white text-xl font-bold mt-1 block">
                {profileData?.age !== undefined ? `${profileData.age} years` : 'N/A'}
              </span>
            </div>

            <div className="bg-[#0a1627] p-5 rounded-2xl border border-gray-800">
              <span className="text-gray-400 block uppercase font-bold text-xs">Gender Allocation</span>
              <span className="text-white text-xl font-bold mt-1 block capitalize">
                {profileData?.gender || 'N/A'}
              </span>
            </div>

            <div className="bg-[#0a1627] p-5 rounded-2xl border border-gray-800">
              <span className="text-gray-400 block uppercase font-bold text-xs">Body Weight</span>
              <span className="text-cyan-400 text-xl font-black mt-1 block">
                {profileData?.weight !== undefined ? `${profileData.weight} kg` : 'N/A'}
              </span>
            </div>

            <div className="bg-[#0a1627] p-5 rounded-2xl border border-gray-800">
              <span className="text-gray-400 block uppercase font-bold text-xs">Height</span>
              <span className="text-white text-xl font-bold mt-1 block">
                {profileData?.height !== undefined ? `${profileData.height} cm` : 'N/A'}
              </span>
            </div>

            <div className="bg-[#0a1627] p-5 rounded-2xl border border-gray-800 md:col-span-2">
              <span className="text-gray-400 block uppercase font-bold text-xs">Target Track Protocol</span>
              <span className="text-purple-400 text-xl font-black mt-1 block uppercase">
                {profileData?.target || profileData?.goal || 'MAINTENANCE'}
              </span>
            </div>

          </div>
        )}
      </div>

      {/* PROGRESS CHART COMPONENT - Passes userData and refresh Key */}
      <ProgressTracker userData={profileData} refreshKey={refreshKey} />

    </div>
  );
}

export default Profile;