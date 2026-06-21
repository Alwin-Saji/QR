import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, Home, Calendar, Menu, X, Info, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state
  const [isHovered, setIsHovered] = useState(false); // Desktop hover state
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <Calendar className="w-5 h-5" /> },
  ];

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-theme-3 text-theme-1 rounded-md shadow-md hover:bg-theme-4 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Desktop Placeholder to keep content pushed over by w-20 */}
      <div className="hidden md:block w-20 flex-shrink-0 transition-all duration-300" />

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-theme-2 border-r border-theme-3/20 flex flex-col z-40 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} 
          ${isHovered ? 'md:w-64 shadow-2xl' : 'md:w-20'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Section */}
        <div className={`border-b border-theme-3/20 flex items-center h-20 transition-all duration-300 ${isHovered || isOpen ? 'px-6' : 'px-0 justify-center'}`}>
          <Camera className="w-8 h-8 text-theme-3 flex-shrink-0" />
          <span className={`font-heading font-bold text-4xl text-theme-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered || isOpen ? 'ml-3 opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
            ARC
          </span>
        </div>
        
        {/* Navigation Links */}
        <nav className="p-4 flex-1 space-y-2 overflow-x-hidden overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center rounded-lg font-bold transition-all duration-300 ${
                  isHovered || isOpen ? 'px-4 py-3' : 'justify-center p-3 w-12 mx-auto'
                } ${
                  isActive 
                    ? 'bg-theme-3/20 text-theme-3' 
                    : 'text-theme-4/80 hover:bg-theme-1/50 hover:text-theme-4'
                }`
              }
              title={(!isHovered && !isOpen) ? item.name : ""}
            >
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                {item.icon}
              </div>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered || isOpen ? 'ml-3 opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-theme-3/20 flex flex-col gap-2">
          <button 
            onClick={handleAuthAction}
            className={`flex items-center rounded-lg font-bold transition-all duration-300 ${
              isHovered || isOpen ? 'px-4 py-3' : 'justify-center p-3 w-12 mx-auto'
            } ${user ? 'text-red-400 hover:bg-red-400/10' : 'text-theme-3 hover:bg-theme-3/10'}`}
            title={(!isHovered && !isOpen) ? (user ? "Sign Out" : "Sign In") : ""}
          >
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
              {user ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered || isOpen ? 'ml-3 opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
              {user ? "Sign Out" : "Sign In"}
            </span>
          </button>

          <a 
            href="https://github.com/Alwin-Saji/QR" 
            target="_blank" 
            rel="noreferrer" 
            className={`flex items-center rounded-lg font-bold text-theme-4/80 hover:bg-theme-1/50 hover:text-theme-4 transition-all duration-300 ${
              isHovered || isOpen ? 'px-4 py-3' : 'justify-center p-3 w-12 mx-auto'
            }`}
            title={(!isHovered && !isOpen) ? "About ARC" : ""}
          >
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered || isOpen ? 'ml-3 opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
              About ARC
            </span>
          </a>
        </div>
      </aside>
    </>
  );
}
