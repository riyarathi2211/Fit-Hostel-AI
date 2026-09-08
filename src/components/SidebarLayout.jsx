import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function SidebarLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar automatically on route navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Workout Plan", path: "/workout", icon: "🏋️" },
    { name: "Mess Menu", path: "/diet", icon: "🍲" },
    { name: "Profile", path: "/profile", icon: "👤" }
  ];

  return (
    <div className="min-h-screen bg-[#0a1627] text-white flex flex-col md:flex-row">
      
      {/* MOBILE TOP NAVBAR (Visible on screen sizes < md) */}
      <header className="md:hidden flex items-center justify-between bg-[#0a1120] border-b border-gray-800 p-4 sticky top-0 z-40">
        <div className="text-xs font-black text-white tracking-widest flex items-center gap-2 uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
          HOSTEL AI
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-white rounded-lg bg-[#17223b] border border-gray-800 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* BACKDROP OVERLAY FOR MOBILE */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* RESPONSIVE SIDEBAR PANEL */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0a1120] border-r border-gray-800 flex flex-col justify-between flex-shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* TOP SECTION: BRAND & NAV */}
        <div className="space-y-6">
          {/* HEADER BRAND LOGO (Desktop only) */}
          <div className="p-6 border-b border-gray-800/80 hidden md:block">
            <div className="text-sm font-black text-white tracking-widest flex items-center gap-2.5 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              HOSTEL AI
            </div>
          </div>

          {/* BOXED NAVIGATION CARDS */}
          <nav className="px-4 space-y-3 pt-6 md:pt-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#17223b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-[#0a1627]/80 border-gray-800/70 text-gray-400 hover:bg-[#17223b]/60 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-base group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold tracking-wide">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SECTION: LOGOUT & FOOTER */}
        <div className="p-4 border-t border-gray-800/80 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT AREA */}
      <main className="flex-1 min-w-0 bg-[#0a1627] overflow-x-hidden p-4 sm:p-6 md:p-8">
        {children}
      </main>

    </div>
  );
}

export default SidebarLayout;