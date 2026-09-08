import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Dumbbell, User, LogOut } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-400">
            <Dumbbell className="h-6 w-6" />
            <span>FitHostel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
            <Link to="/workouts" className="hover:text-blue-400 transition">Workouts</Link>
            <Link to="/diet" className="hover:text-blue-400 transition">Diet Plan</Link>
            <Link to="/profile" className="flex items-center gap-1 hover:text-blue-400 transition">
              <User className="h-4 w-4" /> Profile
            </Link>
            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition text-sm"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 px-4 pt-2 pb-4 space-y-2 border-t border-slate-700">
          <Link 
            to="/dashboard" 
            onClick={() => setIsOpen(false)} 
            className="block py-2 text-gray-200 hover:text-blue-400"
          >
            Dashboard
          </Link>
          <Link 
            to="/workouts" 
            onClick={() => setIsOpen(false)} 
            className="block py-2 text-gray-200 hover:text-blue-400"
          >
            Workouts
          </Link>
          <Link 
            to="/diet" 
            onClick={() => setIsOpen(false)} 
            className="block py-2 text-gray-200 hover:text-blue-400"
          >
            Diet Plan
          </Link>
          <Link 
            to="/profile" 
            onClick={() => setIsOpen(false)} 
            className="block py-2 text-gray-200 hover:text-blue-400"
          >
            Profile
          </Link>
          <button 
            onClick={() => { setIsOpen(false); handleLogout(); }} 
            className="w-full text-left py-2 text-red-400 hover:text-red-300 font-semibold"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;