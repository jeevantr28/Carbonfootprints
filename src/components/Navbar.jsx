import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Leaf, Orbit, LogOut } from 'lucide-react';
import clsx from 'clsx';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Log Activity', path: '/log' },
    { name: 'History', path: '/history' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel !rounded-none !border-t-0 !border-x-0 !border-b-[#00FFB2]/20 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10">
          <Orbit className="absolute text-[#00FFB2] w-full h-full animate-[spin_10s_linear_infinite]" />
          <Leaf className="text-white w-5 h-5 z-10" />
        </div>
        <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00FFB2] text-glow-mint">
          ECHO<span className="font-light">BASE</span>
        </span>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  'text-sm uppercase tracking-widest font-mono transition-all duration-300 relative py-1',
                  isActive ? 'text-[#00FFB2] text-glow-mint' : 'text-gray-400 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00FFB2] shadow-[0_0_8px_#00FFB2]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-[#FF4C6A] transition-colors ml-4"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Abort</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
