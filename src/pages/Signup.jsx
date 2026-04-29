import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const Signup = () => {
  const [name,setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSuccess("");
      return;
    }
    // Simulate user registration (replace with your own logic)
     try {
    const data = await registerUser({
      name,
      email,
      password
    });

    setError("");
    setSuccess(data.message);

    setEmail("");
    setPassword("");
    setConfirmPassword("");

    // Redirect to login after signup
    setTimeout(() => {
      navigate("/");
    }, 1500);

  } catch (err) {
    setError(err.message);
    setSuccess("");
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1627]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0a1627] p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-gray-400 mb-6">Sign up to get started.</p>
        <label className="block text-gray-300 mb-1">Full Name</label>
        <input
          type="text"
          className="w-full p-3 mb-4 rounded bg-[#17223b] text-white placeholder-gray-400 focus:outline-none"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />  

        <label className="block text-gray-300 mb-1">Email Address</label>
        <input
          type="email"
          className="w-full p-3 mb-4 rounded bg-[#17223b] text-white placeholder-gray-400 focus:outline-none"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="block text-gray-300 mb-1">Password</label>
        <input
          type="password"
          className="w-full p-3 mb-4 rounded bg-[#17223b] text-white placeholder-gray-400 focus:outline-none"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="block text-gray-300 mb-1">Confirm Password</label>
        <input
          type="password"
          className="w-full p-3 mb-2 rounded bg-[#17223b] text-white placeholder-gray-400 focus:outline-none"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-400 mb-2 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg mb-4 hover:opacity-90 transition"
        >
          Sign Up
        </button>
        <div className="text-center text-gray-400">
          Already have an account?{' '}
          <span className="text-white font-semibold cursor-pointer hover:underline" onClick={() => navigate('/')}>Sign in</span>
        </div>
      </form>
    </div>
  );
};

export default Signup;
