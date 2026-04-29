import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


   

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = await loginUser({
      email,
      password
    });
   console.log("Login Response:",data);
    // Save token
  if (data.token) {
      localStorage.setItem("token", data.token); // Matches authService.js
      const user = data.user||data;
      if(user.weight){

      
      navigate("/dashboard");
      }else{
        navigate("/user-info");
      }
    } else {
      setError("Token not received from server");
    }
  } catch (err) {
    setError(err.message);
  }
};
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1627]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0a1627] p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-gray-400 mb-6">Enter your details to sign in.</p>
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
          className="w-full p-3 mb-2 rounded bg-[#17223b] text-white placeholder-gray-400 focus:outline-none"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-end mb-4">
          <button
            type="button"
            className="text-blue-400 text-sm hover:underline"
            onClick={() => alert('Forgot password functionality not implemented')}
          >
            Forgot password?
          </button>
        </div>
        {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg mb-4 hover:opacity-90 transition"
        >
          Sign In
        </button>
        <div className="text-center text-gray-400">
          Don't have an account?{' '}
          <span className="text-white font-semibold cursor-pointer hover:underline" onClick={() => navigate('/signup')}>Sign up</span>
        </div>
      </form>
    </div>
  );
};

export default Login;
