import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, Menu, X, Grip, Aperture } from 'lucide-react';

export default function Navigation({ user }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileVisible, setIsMobileVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = React.useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY < 50) {
            setIsVisible(true);
            setIsMobileVisible(false);
          } else if (currentScrollY > lastScrollY.current) {
            setIsVisible(false);
            setIsMobileVisible(false);
          } else {
            setIsVisible(true);
            setIsMobileVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 top-6 md:top-8 left-0 flex justify-center pointer-events-none transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-[150%]'}`}>

      {/* --- DESKTOP NAVIGATION (Film Strip) --- */}
      <div className="hidden md:flex w-[95%] max-w-5xl bg-theme-4 rounded-[40px] border-2 border-[#0a0a0a]/90 flex-col justify-between shadow-[0_20px_50px_rgba(238,223,204,0.15)] pointer-events-auto relative group hover:shadow-[0_20px_60px_rgba(238,223,204,0.25)] transition-all duration-500 overflow-hidden">
        {/* Top Sprocket Holes (Punched Out) */}
        <div className="w-full flex justify-between px-8 pt-1.5 pb-0.5 pointer-events-none relative z-20">
          {[...Array(24)].map((_, i) => (
            <div key={`top-sprocket-${i}`} className="w-2 h-1 bg-[#050505] rounded-[1px] shadow-inner opacity-90 group-hover:bg-black transition-colors duration-500"></div>
          ))}
        </div>

        {/* Content Container (Grid Layout) */}
        <div className="w-full grid grid-cols-3 items-center border-y border-[#0a0a0a]/30 bg-transparent py-1 md:py-1.5 px-6 md:px-10 z-10 relative">
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
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1200ms] ease-in-out"></span>
              <span className="relative z-10 flex items-center gap-2">
                {user ? "Dashboard" : "Get Started"}
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

      {/* --- MOBILE NAVIGATION (Top Right Draggable Radial Dial) --- */}
      {/* --- MOBILE NAVIGATION (Bottom-Centered Radial Dial) --- */}
      <MobileRadialDial user={user} isMobileVisible={isMobileVisible} />

    </nav>
  );
}

import { createPortal } from 'react-dom';
import { motion, useMotionValue, animate } from 'framer-motion';

const MobileRadialDial = ({ user, isMobileVisible }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Scroll lock the body when the menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const touchStartAngle = React.useRef(0);
  const currentRotation = React.useRef(0);
  const isDragging = React.useRef(false);

  const items = [
    { label: 'HOME', to: '/' },
    { label: 'ABOUT', href: '#about' },
    { label: 'FEATURES', href: '#features' },
    { label: user ? 'DASHBOARD' : 'START', to: user ? '/dashboard' : '/auth' }
  ];

  // Increased to 45 for even wider, more comfortable gaps
  const anglePerItem = 45;
  const indicatorAngle = 270;

  const rotation = useMotionValue(0);

  const radius = 180;
  const textRadius = 140;

  const width = 390;
  const height = 210;

  const cx = width / 2;
  const cy = height + 30;

  // Generate more ticks to cover the wider spread (45 degrees per item)
  // Let's cover from 90 to 540 to ensure plenty of padding ticks on both sides
  const ticks = [];
  for (let a = 90; a <= 540; a += 5) {
    const diff = a - indicatorAngle;
    const isMajor = diff % anglePerItem === 0;
    const itemIdx = isMajor ? diff / anglePerItem : -1;
    ticks.push({
      angle: a,
      isMajor,
      itemIdx,
      item: itemIdx >= 0 && itemIdx < items.length ? items[itemIdx] : null
    });
  }

  const handleTouchStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    touchStartX.current = clientX;
    touchStartY.current = clientY;
    currentRotation.current = rotation.get();
    isDragging.current = false;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current && e.type.includes('mouse')) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 5) {
      isDragging.current = true;

      const centerX = window.innerWidth / 2;
      const isLeft = touchStartX.current < centerX;

      // Stable linear projection: 
      // Swiping right (deltaX > 0) spins clockwise (+)
      // Swiping up (deltaY < 0) on the left spins clockwise (+), on the right spins counter-clockwise (-)
      const effectiveSwipe = (deltaX * 0.5) + (isLeft ? -deltaY * 0.5 : deltaY * 0.5);

      rotation.set(currentRotation.current + effectiveSwipe);
    }
  };

  const handleTouchEnd = (e) => {
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : (e.clientX || touchStartX.current);
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : (e.clientY || touchStartY.current);
    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Reset for next swipe
    touchStartX.current = 0;
    touchStartY.current = 0;

    // If they barely moved, it's a tap
    if (distance < 5 && e.type.includes('up')) {
      // It was a tap! 
      if (e.target.closest('button')) {
        return; // Let the button handle its own click
      }

      // Otherwise, it was a tap on the empty background, so close the menu
      setIsOpen(false);
      return;
    }

    let targetRot = rotation.get();
    const minRot = - (items.length - 1) * anglePerItem;
    if (targetRot < minRot) targetRot = minRot;
    if (targetRot > 0) targetRot = 0;

    const snappedRot = Math.round(targetRot / anglePerItem) * anglePerItem;

    // Use a much softer spring so it glides smoothly into the snapped position
    animate(rotation, snappedRot, {
      type: 'spring',
      stiffness: 120,
      damping: 20,
      mass: 1
    });
  };

  const handleItemClick = (idx, item) => {
    const targetRot = -idx * anglePerItem;
    animate(rotation, targetRot, {
      type: 'spring',
      stiffness: 120,
      damping: 20
    });

    // Wait for the spring animation to finish before closing and navigating
    setTimeout(() => {
      setIsOpen(false);

      // Programmatic navigation
      if (item.to) {
        navigate(item.to);
      } else if (item.href) {
        const el = document.querySelector(item.href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = item.href;
        }
      }
    }, 400);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`md:hidden fixed inset-0 z-[9999] touch-none ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >

      {/* FAB Toggle (Bottom Center) */}
      {/* Changed to fixed so it perfectly tracks the visual viewport during scroll without lag */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ease-in-out ${isMobileVisible || isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 bg-[#0a0a0a]/70 backdrop-blur-xl text-theme-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-white/20 flex items-center justify-center transition-all duration-500 hover:bg-[#0a0a0a]/90 hover:scale-105 active:scale-95 group overflow-hidden"
        >
          {/* Subtle glowing ring on hover */}
          <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-white/10 transition-colors duration-500"></div>

          {/* Closed State (Aperture Icon - Matches Camera/Radial Theme) */}
          <Aperture
            strokeWidth={2}
            className={`absolute w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
          />

          {/* Open State (X Icon) */}
          <X
            strokeWidth={2}
            className={`absolute w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
          />
        </button>
      </div>

      {/* The Bottom-Centered Radial Dial Area */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500 origin-bottom ${isOpen ? 'opacity-100 pointer-events-none scale-100 translate-y-0' : 'opacity-0 pointer-events-none scale-50 translate-y-20'}`}
        style={{ width: width, height: height }}
      >

        {/* Solid/Frosted Dial Background (No backdrop-blur to prevent mobile Safari transition glitches) */}
        <div
          className="absolute rounded-full bg-[#0a0a0a]/95 border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{
            left: `${cx - 195}px`,
            top: `${cy - 195}px`,
            width: '390px',
            height: '390px'
          }}
        />

        {/* The rotating wheel (Visual Only) */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            rotate: rotation,
            transformOrigin: `${cx}px ${cy}px`
          }}
        >
          {ticks.map((tick, i) => {
            const item = tick.itemIdx >= 0 && tick.itemIdx < items.length ? items[tick.itemIdx] : null;

            return (
              <React.Fragment key={i}>
                {/* Tick mark */}
                <div
                  className="absolute bg-[#e5e5ea] rounded-full pointer-events-none origin-center"
                  style={{
                    left: `${cx}px`,
                    top: `${cy}px`,
                    width: tick.isMajor ? '16px' : '8px',
                    height: '2px',
                    // translate(-50%, -50%) centers it. rotate(angle) points it. translateX(radius) moves it out.
                    transform: `translate(-50%, -50%) rotate(${tick.angle}deg) translateX(${radius}px)`,
                    opacity: tick.isMajor ? 0.9 : 0.4
                  }}
                />

                {/* Invisible Click Target for Label */}
                {item && (
                  <div
                    className="absolute flex items-center justify-center origin-center z-20"
                    style={{
                      left: `${cx}px`,
                      top: `${cy}px`,
                      // Position the center of the clickable box exactly where the word center is
                      transform: `translate(-50%, -50%) rotate(${tick.angle}deg) translateX(${textRadius}px) rotate(90deg)`
                    }}
                  >
                    {item.to ? (
                      <button
                        onClick={(e) => { e.preventDefault(); handleItemClick(tick.itemIdx, item); }}
                        className="w-[80px] h-[40px] cursor-pointer pointer-events-auto touch-none select-none"
                        style={{ WebkitUserDrag: 'none' }}
                      />
                    ) : (
                      <button
                        onClick={(e) => { e.preventDefault(); handleItemClick(tick.itemIdx, item); }}
                        className="w-[80px] h-[40px] cursor-pointer pointer-events-auto touch-none select-none"
                        style={{ WebkitUserDrag: 'none' }}
                      />
                    )}
                  </div>
                )}

                {/* Curved Text Characters */}
                {item && item.label.split('').map((char, j) => {
                  const charAngle = 3.5; // Decreased from 4.9 for tighter letter spacing
                  const startOffset = -((item.label.length - 1) * charAngle) / 2;
                  const absoluteAngle = tick.angle + startOffset + (j * charAngle);

                  // Highlight the CTA button (Dashboard / Start)
                  const isCTA = tick.itemIdx === items.length - 1;

                  return (
                    <div
                      key={`char-${i}-${j}`}
                      className="absolute flex items-center justify-center origin-center pointer-events-none"
                      style={{
                        left: `${cx}px`,
                        top: `${cy}px`,
                        transform: `translate(-50%, -50%) rotate(${absoluteAngle}deg) translateX(${textRadius}px) rotate(90deg)`
                      }}
                    >
                      <span
                        className={`text-[12px] ${isCTA ? 'font-bold text-[#ffd60a] drop-shadow-[0_0_8px_rgba(255,214,10,0.8)]' : 'font-bold text-[#f2f2f7] drop-shadow-md'}`}
                      >
                        {char}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </motion.div>

        {/* Center Indicator (Fixed yellow line) */}
        {(() => {
          const rad = indicatorAngle * (Math.PI / 180);
          const x = cx + (radius - 16) * Math.cos(rad);
          const y = cy + (radius - 16) * Math.sin(rad);

          return (
            <div
              className="absolute w-[3px] h-[32px] bg-[#ffd60a] rounded-full origin-center shadow-[0_0_12px_rgba(255,214,10,0.8)] pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}px`,
                top: `${y}px`,
              }}
            />
          );
        })()}

      </div>


    </div>,
    document.body
  );
};
