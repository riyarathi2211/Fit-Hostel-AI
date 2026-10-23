// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import Button from "../components/Button";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSuccess("");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        name,
        email,
        password
      });

      if (data.token) {
        // Use sessionStorage instead of localStorage for tab isolation
        sessionStorage.setItem("token", data.token);
      }

      setError("");
      setSuccess(data.message || "Account created successfully!");

      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/user-info");
      }, 1000);

    } catch (err) {
      setError(err.message);
      setSuccess("");
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
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight">Create Account</h2>
        <p className="text-xs sm:text-sm text-gray-400 mb-6">Sign up to get started.</p>
        
        <div className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-1.5">Full Name</label>
            <input
              type="text"
              className="w-full p-3 sm:p-3.5 rounded-xl bg-[#0a1627] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-1.5">Email Address</label>
            <input
              type="email"
              className="w-full p-3 sm:p-3.5 rounded-xl bg-[#0a1627] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
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
              className="w-full p-3 sm:p-3.5 rounded-xl bg-[#0a1627] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-1.5">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 sm:p-3.5 rounded-xl bg-[#0a1627] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm rounded-xl font-medium">
            ⚠ {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm rounded-xl font-medium">
            ✓ {success}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 font-black text-base hover:opacity-90 active:scale-[0.98] transition shadow-lg shadow-cyan-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>

        <div className="mt-6 text-center text-xs sm:text-sm text-gray-400">
          Already have an account?{' '}
          <span 
            className="text-cyan-400 font-bold cursor-pointer hover:underline" 
            onClick={() => navigate('/')}
          >
            Sign in
          </span>
        </div>
      </form>
    </div>
  );
};

export default Signup;