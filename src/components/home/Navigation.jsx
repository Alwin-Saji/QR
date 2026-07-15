import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowRight } from 'lucide-react';

export default function Navigation({ user }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`fixed w-full z-50 top-6 md:top-8 left-0 flex justify-center pointer-events-none transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-[150%]'}`}>
      <div className="w-[95%] max-w-5xl bg-theme-4 rounded-[40px] border-2 border-[#0a0a0a]/90 flex flex-col justify-between shadow-[0_20px_50px_rgba(238,223,204,0.15)] pointer-events-auto relative group hover:shadow-[0_20px_60px_rgba(238,223,204,0.25)] transition-all duration-500 overflow-hidden">

        {/* Top Sprocket Holes (Punched Out) */}
        <div className="w-full flex justify-between px-8 pt-1.5 pb-0.5 pointer-events-none relative z-20">
          {[...Array(24)].map((_, i) => (
            <div key={`top-sprocket-${i}`} className="w-2 h-1 bg-[#050505] rounded-[1px] shadow-inner opacity-90 group-hover:bg-black transition-colors duration-500"></div>
          ))}
        </div>

        {/* Content Container (Grid Layout) */}
        <div className="w-full grid grid-cols-3 items-center border-y border-[#0a0a0a]/30 bg-transparent py-1 md:py-1.5 px-6 md:px-10 z-10 relative">

          {/* Subtle Film Grain Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          {/* Left Column: Links & Technical Details */}
          <div className="flex items-center gap-6 relative z-10">
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="group/link relative text-[8px] md:text-[9px] font-sans font-bold tracking-[0.3em] uppercase text-[#0a0a0a]/70 hover:text-[#0a0a0a] transition-colors duration-300 py-1">
                <span className="relative z-10">Features</span>
                <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#0a0a0a] transition-all duration-500 ease-out group-hover/link:w-full"></span>
                <span className="absolute right-0 top-0 w-0 h-[1px] bg-[#0a0a0a] transition-all duration-500 ease-out group-hover/link:w-full"></span>
              </a>
              <a href="#about" className="group/link relative text-[8px] md:text-[9px] font-sans font-bold tracking-[0.3em] uppercase text-[#0a0a0a]/70 hover:text-[#0a0a0a] transition-colors duration-300 py-1">
                <span className="relative z-10">About</span>
                <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#0a0a0a] transition-all duration-500 ease-out group-hover/link:w-full"></span>
                <span className="absolute right-0 top-0 w-0 h-[1px] bg-[#0a0a0a] transition-all duration-500 ease-out group-hover/link:w-full"></span>
              </a>
            </div>
          </div>

          {/* Center Column: Logo */}
          <div className="flex justify-center relative z-10">
            <Link to="/" className="flex items-center gap-2 group/logo">
              <Camera className="w-3.5 h-3.5 text-[#0a0a0a] group-hover/logo:-rotate-12 transition-transform duration-500" />
              <span className="font-heading text-base md:text-3xl tracking-wider text-[#0a0a0a] font-black drop-shadow-sm">Mementos</span>
            </Link>
          </div>

          {/* Right Column: CTA */}
          <div className="flex justify-end items-center gap-6 relative z-10">
            <Link to={user ? "/dashboard" : "/auth"} className="group/btn relative inline-flex items-center justify-center text-[8px] font-bold tracking-[0.3em] uppercase bg-[#0a0a0a] text-theme-4 overflow-hidden rounded-full px-6 py-2 transition-all duration-500 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:scale-105 whitespace-nowrap border border-transparent hover:border-theme-4/30">
              {/* Glare effect on hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1200ms] ease-in-out"></span>
              <span className="relative z-10 flex items-center gap-2">
                {user ? "Dashboard" : "Get Started"}
                {/* Animated Arrow */}
                <ArrowRight className="w-3 h-3 -ml-4 opacity-0 scale-50 group-hover/btn:ml-0 group-hover/btn:opacity-100 group-hover/btn:scale-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
              </span>
            </Link>
          </div>

        </div>

        {/* Bottom Sprocket Holes (Punched Out) */}
        <div className="w-full flex justify-between px-8 pb-1.5 pt-0.5 pointer-events-none relative z-20">
          {[...Array(24)].map((_, i) => (
            <div key={`bot-sprocket-${i}`} className="w-2 h-1 bg-[#050505] rounded-[1px] shadow-inner opacity-90 group-hover:bg-black transition-colors duration-500"></div>
          ))}
        </div>

      </div>
    </nav>
  );
}
