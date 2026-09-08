// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Wake up cold-started server immediately when the component mounts
  useEffect(() => {
    const pingServer = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        await fetch(`${API_URL}/api/health`, { method: "GET" });
      } catch (err) {
        // Silently catch error if endpoint doesn't exist
      }
    };
    pingServer();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        email,
        password
      });
      console.log("Login Response:", data);

      if (data.token) {
        sessionStorage.setItem("token", data.token);
        const user = data.user || data;
        
        if (user.weight) {
          navigate("/dashboard");
        } else {
          navigate("/user-info");
        }
      } else {
        setError("Token not received from server");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1627] p-4 sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-[#17223b] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight">Welcome back</h2>
        <p className="text-xs sm:text-sm text-gray-400 mb-6">Enter your details to sign in.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-1.5">Email Address</label>
            <input
              type="email"
              disabled={loading}
              className="w-full p-3 sm:p-3.5 rounded-xl bg-[#0a1627] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition disabled:opacity-50"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-1.5">Password</label>
            <input
              type="password"
              disabled={loading}
              className="w-full p-3 sm:p-3.5 rounded-xl bg-[#0a1627] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition disabled:opacity-50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm rounded-xl font-medium">
            ⚠ {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 font-black text-base hover:opacity-90 active:scale-[0.98] transition shadow-lg shadow-cyan-500/10 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
        
        <div className="mt-6 text-center text-xs sm:text-sm text-gray-400">
          Don't have an account?{' '}
          <span className="text-cyan-400 font-bold cursor-pointer hover:underline" onClick={() => navigate('/signup')}>
            Sign up
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;