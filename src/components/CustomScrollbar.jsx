import React, { useState, useEffect, useRef } from 'react';

export default function CustomScrollbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const trackRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const scrollTop = window.scrollY;
          
          const scrollableHeight = documentHeight - windowHeight;
          const progress = scrollableHeight > 0 ? scrollTop / scrollableHeight : 0;
          setScrollProgress(progress);

          const trackHeight = windowHeight * 0.8;
          const newThumbHeight = Math.max(50, (windowHeight / documentHeight) * trackHeight);
          setThumbHeight(newThumbHeight);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Setup observer for dynamic height changes (like gallery loading more photos)
    const observer = new ResizeObserver(handleScroll);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    const startY = e.clientY;
    const startScrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const scrollableHeight = documentHeight - windowHeight;
    const trackHeight = windowHeight * 0.8;
    const availableTrackHeight = trackHeight - thumbHeight;

    const handlePointerMove = (moveEvent) => {
      moveEvent.preventDefault();
      const deltaY = moveEvent.clientY - startY;
      const scrollPercentage = deltaY / availableTrackHeight;
      const scrollAmount = scrollPercentage * scrollableHeight;
      window.scrollTo(0, startScrollTop + scrollAmount);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleTrackClick = (e) => {
    if (e.target !== trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = window.innerHeight * 0.8;
    const clickPercentage = clickY / trackHeight;
    
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollableHeight = documentHeight - windowHeight;
    
    window.scrollTo({
      top: scrollableHeight * clickPercentage,
      behavior: 'smooth'
    });
  };

  const totalDashes = 35;
  const activeIdx = scrollProgress * (totalDashes - 1);

  return (
    <div 
      ref={trackRef}
      onPointerDown={handleTrackClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDownCapture={handlePointerDown}
      className="fixed top-1/2 -translate-y-1/2 right-4 h-[80vh] w-[20px] hidden md:flex flex-col justify-between items-end z-[100] cursor-pointer group py-2"
      style={{
        opacity: document.documentElement.scrollHeight > window.innerHeight ? 1 : 0,
        pointerEvents: document.documentElement.scrollHeight > window.innerHeight ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}
    >
      {[...Array(totalDashes)].map((_, i) => {
        // Calculate distance from the current scroll position to this dash
        const distance = Math.abs(activeIdx - i);
        // The closer to the active index, the wider and brighter the dash
        const isActive = distance < 1.5;
        const isSemiActive = distance >= 1.5 && distance < 3;
        
        let width = '4px';
        let opacity = 0.3;
        let color = '#f5eedc';
        
        if (isActive) {
          width = '14px';
          opacity = 1;
          color = '#ffffff';
        } else if (isSemiActive) {
          width = '8px';
          opacity = 0.6;
        }
        
        // Add hover effects globally if hovering the track
        if (isHovered || isDragging) {
          opacity = Math.min(1, opacity + 0.3);
        }

        return (
          <div
            key={i}
            className="h-[3px] rounded-full transition-all duration-200 ease-out"
            style={{
              width,
              backgroundColor: color,
              opacity,
              boxShadow: isActive ? '0 0 6px rgba(255,255,255,0.4)' : 'none'
            }}
          />
        );
      })}
    </div>
  );
}
