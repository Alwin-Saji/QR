import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Zap, Shield, Users, ArrowRight, Image as ImageIcon, Film, QrCode, X, Play, Pause } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import img1 from '../assets/vector1.png';
import img2 from '../assets/vecotr2.png';
import img3 from '../assets/vector3.jpg';
import img4 from '../assets/vector4.png';

export default function Home() {
  const { user } = useAuth();
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [centeredItemIndex, setCenteredItemIndex] = React.useState(null);
  const marqueeTl = React.useRef(null);

  React.useEffect(() => {
    if (isQRModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isQRModalOpen]);

  const heroRef = React.useRef(null);
  const textContainerRef = React.useRef(null);
  const bgTrackRef = React.useRef(null);
  const placardRef = React.useRef(null);
  const bgTrackWrapperRef = React.useRef(null);
  const placardWrapperRef = React.useRef(null);
  const apertureHoleRef = React.useRef(null);
  const mainContentRef = React.useRef(null);

  React.useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(apertureHoleRef.current, { width: "0vmax", height: "0vmax" });
      gsap.set(mainContentRef.current, { opacity: 1 });

      // 2. Cinematic Iris Opens
      tl.to(apertureHoleRef.current, {
        width: "250vmax",
        height: "250vmax",
        duration: 1.8,
        ease: "power3.inOut",
        delay: 0.2
      })
        // Hide container after animation
        .set(apertureHoleRef.current, { display: 'none' })

        // 3. Normal elements animate in
        .fromTo(textContainerRef.current.children,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: "power3.out" },
          "-=1.2" // Start as the iris is opening
        )
        // 4. Track inner sliding entrance animations (Forward effect)
        .fromTo(bgTrackRef.current,
          { x: "-100%" },
          { x: "-50%", duration: 2.5, ease: "power3.out" },
          "-=1.5"
        )
        .fromTo(placardRef.current,
          { x: "50%" },
          { x: "0%", duration: 2.5, ease: "power3.out" },
          "-=2.5"
        )
        .add(() => {
          // Only start the continuous loop after the entrance completes
          if (marqueeTl.current) {
            marqueeTl.current.play();
          }
        });

      // 5. Infinite looping marquees for tracks (start paused)
      marqueeTl.current = gsap.timeline({ repeat: -1, paused: true });

      if (bgTrackRef.current) {
        // Background track moves left to right (from -50% to 0%)
        marqueeTl.current.fromTo(bgTrackRef.current,
          { x: "-50%" },
          { x: "0%", duration: 25, ease: "none" },
          0
        );
      }

      if (placardRef.current) {
        // Foreground track moves right to left (from 0% to -50%)
        marqueeTl.current.fromTo(placardRef.current,
          { x: "0%" },
          { x: "-50%", duration: 25, ease: "none" },
          0
        );
      }

    }, heroRef);

    return () => ctx.revert();
  }, []);

  React.useEffect(() => {
    // We handle play/pause via the handlePlayPause function now to allow for tweening
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      if (placardRef.current && marqueeTl.current) {
        const images = placardRef.current.querySelectorAll('.fg-item');
        const screenCenter = window.innerWidth / 2;
        let closestImg = null;
        let minDistance = Infinity;
        let closestDx = 0;

        images.forEach(img => {
          const rect = img.getBoundingClientRect();
          const imgCenter = rect.left + rect.width / 2;
          const distance = Math.abs(imgCenter - screenCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestImg = img;
            closestDx = imgCenter - screenCenter;
          }
        });

        if (closestImg) {
          const targetIdx = parseInt(closestImg.getAttribute('data-idx'), 10);
          setCenteredItemIndex(targetIdx);

          const blockWidth = placardRef.current.scrollWidth / 2;
          const pixelsPerSecond = blockWidth / 25;
          const timeOffset = closestDx / pixelsPerSecond;

          let newTime = marqueeTl.current.time() + timeOffset;
          while (newTime < 0) newTime += 25;
          while (newTime >= 25) newTime -= 25;

          marqueeTl.current.pause();
          gsap.to(marqueeTl.current, {
            time: newTime,
            duration: 0.8,
            ease: "power3.out"
          });
        }
      }
    } else {
      setCenteredItemIndex(null);
      marqueeTl.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div ref={heroRef} className="w-full min-h-screen bg-theme-4 text-theme-1 font-sans selection:bg-theme-2/20 overflow-hidden relative">

      {/* Flawless Cinematic Iris Wipe */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          ref={apertureHoleRef}
          className="rounded-full bg-transparent"
          style={{ boxShadow: "0 0 0 150vmax var(--color-theme-1)" }}
        />
      </div>

      {/* Main Page Content (Hidden Initially) */}
      <div ref={mainContentRef} className="opacity-0">

        {/* Soft Light Gradients */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-theme-3/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-theme-2/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        {/* Golden Negative Film Pill Navigation (Centered Logo Redesign) */}
        <nav className="absolute w-full z-50 top-6 md:top-8 left-0 flex justify-center pointer-events-none">
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

        {/* High-End Vintage Minimalist Hero */}
        {/* High-End Vintage Minimalist Hero - Strict Layout */}
        {/* Cinematic Film Strip Hero Layout */}
        <main className="w-full h-[100vh] min-h-[600px] overflow-hidden bg-[#0a0a0a] flex flex-col relative">

          {/* Subtle Grain */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.4] mix-blend-screen z-0">
            <svg width="100%" height="100%">
              <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" /></filter>
              <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] bg-theme-1/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

          {/* OVERLAY SECTION: Typography (Mix Blend Mode) */}
          <div ref={textContainerRef} className="absolute inset-0 flex flex-col justify-center items-center text-center z-30 px-4 pointer-events-none mix-blend-difference text-white">
            <h1 className="mt-8 text-[7rem] md:text-[14rem] lg:text-[22rem] font-heading font-normal leading-[0.6] transition-all duration-700">
              Mementos
            </h1>
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-[10px] md:text-sm font-sans font-light italic max-w-md leading-relaxed tracking-wider">
                "You don't take a photograph, you make it."
              </p>
            </div>

            {/* Left Meta Info (Circular Corner Text via Mix Blend) */}
            <div className="hidden md:block absolute -left-[200px] -bottom-[200px] w-[400px] h-[400px] pointer-events-none opacity-90">
              <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_35s_linear_infinite] overflow-visible">
                {/* Circle path for text (radius = 90, center = 100,100) */}
                <path id="cornerTextPath" d="M 100, 100 m -90, 0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0" fill="none" />
                <text className="text-[17px] font-heading font-normal tracking-[0.1em] fill-current drop-shadow-sm">
                  <textPath href="#cornerTextPath" startOffset="0%">
                    Pure <tspan className="fill-transparent" style={{ stroke: 'currentColor', strokeWidth: '0.5px' }}>Analog</tspan> • Pure <tspan className="fill-transparent" style={{ stroke: 'currentColor', strokeWidth: '0.5px' }}>Analog</tspan> • Pure <tspan className="fill-transparent" style={{ stroke: 'currentColor', strokeWidth: '0.5px' }}>Analog</tspan> • Pure <tspan className="fill-transparent" style={{ stroke: 'currentColor', strokeWidth: '0.5px' }}>Analog</tspan> •
                  </textPath>
                </text>
              </svg>
            </div>
          </div>

          {/* MIDDLE SECTION: Edge-to-Edge Endless Film Reel */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 w-full z-10 flex flex-col pt-16 md:pt-20 justify-center">

            {/* BACKGROUND Track (Reverse / Blurred) */}
            <div ref={bgTrackWrapperRef} className="absolute top-[60%] -translate-y-1/2 w-full z-0 pointer-events-none rotate-[10deg] scale-110">
              <div className="border-y border-theme-4/5 bg-black/20 opacity-70 blur-[3px] py-8 overflow-hidden">
                <div ref={bgTrackRef} className="flex w-max">
                  {/* Block 1 */}
                  <div className="flex items-center gap-4 md:gap-8 pr-4 md:pr-8">
                    {[img1, img2, img3, img1, img3].reverse().map((src, idx) => (
                      <div key={`bg-1-${idx}`} className="h-[25vh] md:h-[30vh] min-h-[180px] aspect-[16/9] bg-[#050505] p-2 flex-shrink-0 relative border border-white/5">
                        <img src={src} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'sepia-0 grayscale-0 contrast-100' : 'sepia-[0.3] grayscale-[0.4] contrast-125'}`} alt={`Bg Film frame ${idx}`} />
                      </div>
                    ))}
                  </div>
                  {/* Block 2 */}
                  <div className="flex items-center gap-4 md:gap-8 pr-4 md:pr-8">
                    {[img1, img2, img3, img1, img3].reverse().map((src, idx) => (
                      <div key={`bg-2-${idx}`} className="h-[25vh] md:h-[30vh] min-h-[180px] aspect-[16/9] bg-[#050505] p-2 flex-shrink-0 relative border border-white/5">
                        <img src={src} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'sepia-0 grayscale-0 contrast-100' : 'sepia-[0.3] grayscale-[0.4] contrast-125'}`} alt={`Bg Film frame ${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FOREGROUND The Reel Track */}
            <div ref={placardWrapperRef} className="relative z-10 w-full -rotate-[5deg]">
              <div className="border-y border-theme-4/10 bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.9)] py-8 overflow-hidden">
                <div ref={placardRef} className="flex w-max">
                  {/* Block 1 */}
                  <div className="flex items-center gap-4 md:gap-8 pr-4 md:pr-8">
                    {[img3, img1, img1, img4, img2].map((src, idx) => (
                      <div key={`fg-1-${idx}`} data-idx={idx % 5} className={`fg-item h-[25vh] md:h-[30vh] min-h-[180px] aspect-[16/9] bg-[#050505] p-2 flex-shrink-0 relative group shadow-2xl border border-white/5 transition-all duration-700 ${isPlaying
                        ? 'scale-[1.05] z-20 opacity-100' // ALL items are the same size (1.05) when playing
                        : ((centeredItemIndex === (idx % 5)) ? 'scale-[1.15] z-20 opacity-100' : 'hover:scale-[1.05] hover:z-20')
                        }`}>
                        <img src={src} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying
                          ? 'grayscale-0 sepia-0 contrast-100'
                          : ((centeredItemIndex === (idx % 5)) ? 'grayscale-0 sepia-0 contrast-100' : 'contrast-110 sepia-[0.2] hover:sepia-0 hover:contrast-100')
                          }`} alt={`Film frame ${idx}`} />
                        <div className="absolute inset-2 border border-theme-4/20 pointer-events-none mix-blend-overlay"></div>
                      </div>
                    ))}
                  </div>
                  {/* Block 2 */}
                  <div className="flex items-center gap-4 md:gap-8 pr-4 md:pr-8">
                    {[img3, img1, img1, img4, img2].map((src, idx) => (
                      <div key={`fg-2-${idx}`} data-idx={idx % 5} className={`fg-item h-[25vh] md:h-[30vh] min-h-[180px] aspect-[16/9] bg-[#050505] p-2 flex-shrink-0 relative group shadow-2xl border border-white/5 transition-all duration-700 ${isPlaying
                        ? 'scale-[1.05] z-20 opacity-100'
                        : ((centeredItemIndex === (idx % 5)) ? 'scale-[1.15] z-20 opacity-100' : 'opacity-60 hover:opacity-100 hover:scale-[1.05] hover:z-20')
                        }`}>
                        <img src={src} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying
                          ? 'grayscale-0 sepia-0 contrast-100'
                          : ((centeredItemIndex === (idx % 5)) ? 'grayscale-0 sepia-0 contrast-100' : 'contrast-110 hover:contrast-100')
                          }`} alt={`Film frame ${idx}`} />
                        <div className="absolute inset-2 border border-theme-4/20 pointer-events-none mix-blend-overlay"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: CTA */}
          <div className="absolute bottom-8 left-8 right-8 h-[60px] flex items-end justify-between z-40 pointer-events-none">

            {/* Center Controls (Absolutely Centered) */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full md:w-auto flex items-center justify-center gap-6 pb-4 md:pb-0 pointer-events-auto z-50">

              {/* Miniature Clapperboard Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="group relative flex flex-col items-center justify-center w-16 h-16 transition-all duration-700 bg-transparent"
              >
                {/* Glowing aura */}
                <div className="absolute inset-0 bg-theme-4/30 blur-[20px] scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-[1.5] transition-all duration-700 pointer-events-none z-0"></div>

                {/* Top Clapper Stick */}
                <div className={`w-[52px] h-[10px] bg-[#050505] border border-theme-4/30 rounded-[2px] mb-[1px] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-left flex overflow-hidden z-20 ${isPlaying ? 'rotate-[-35deg]' : 'rotate-0'}`}>
                  {/* Stripes */}
                  <div className="w-1/4 h-[120%] bg-theme-4/90 -skew-x-[20deg] -translate-x-1"></div>
                  <div className="w-1/4 h-[120%] bg-theme-4/90 -skew-x-[20deg] translate-x-2"></div>
                  <div className="w-1/4 h-[120%] bg-theme-4/90 -skew-x-[20deg] translate-x-5"></div>
                </div>

                {/* Bottom Board */}
                <div className="w-[52px] h-[34px] bg-[#0a0a0a] border border-theme-4/30 rounded-[3px] flex flex-col items-center justify-end pb-1 z-10 shadow-[0_10px_20px_rgba(0,0,0,0.8)] overflow-hidden relative group-hover:border-theme-4/60 transition-colors duration-300">
                  {/* Bottom Stripes (Static part of the hinge) */}
                  <div className="absolute top-0 left-0 right-0 flex w-full h-[8px] bg-[#050505] border-b border-theme-4/20 overflow-hidden">
                    <div className="w-1/4 h-[120%] bg-theme-4/90 -skew-x-[20deg] -translate-x-1"></div>
                    <div className="w-1/4 h-[120%] bg-theme-4/90 -skew-x-[20deg] translate-x-2"></div>
                    <div className="w-1/4 h-[120%] bg-theme-4/90 -skew-x-[20deg] translate-x-5"></div>
                  </div>

                  {/* State Text */}
                  <div className="text-[9px] font-bold text-theme-4 tracking-[0.2em] uppercase transition-colors duration-300 group-hover:text-white">
                    {isPlaying ? 'ROLL' : 'CUT'}
                  </div>
                </div>
              </button>

              {/* Dashboard CTA (Restored with Glow) */}
              <div className="relative group">
                <div className="absolute inset-0 bg-theme-4/30 rounded-full blur-[25px] scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-700 pointer-events-none"></div>
                <Link to="/dashboard" className="relative flex items-center bg-black/60 hover:bg-black/90 text-theme-4 backdrop-blur-md border border-theme-4/30 p-2 rounded-full transition-all duration-500 overflow-hidden shadow-2xl w-[260px] h-14 group-hover:border-theme-4/60">

                  {/* The SOLID expanding fill track */}
                  <div className="absolute left-2 top-2 bottom-2 bg-theme-4 w-10 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-[244px] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] z-0"></div>

                  {/* The rolling film icon */}
                  <div className="w-10 h-10 rounded-full bg-theme-4 group-hover:bg-black text-black group-hover:text-theme-4 flex items-center justify-center transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[204px] group-hover:rotate-[1080deg] z-20 relative border border-black/10">
                    <Film className="w-5 h-5 ml-[1px]" />
                  </div>

                  {/* The text (Before Hover - Dark Background, Theme Text) */}
                  <div className="absolute right-0 top-0 bottom-0 w-full overflow-hidden group-hover:w-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] z-10 pointer-events-none flex justify-end">
                    <div className="w-[260px] h-full flex items-center justify-center text-[11px] font-bold tracking-[0.35em] uppercase text-theme-4/70 shrink-0">
                      Slide To Roll
                    </div>
                  </div>

                  {/* The text (After Hover - Theme Background, Black Text) */}
                  <div className="absolute left-0 top-0 bottom-0 w-0 overflow-hidden group-hover:w-[260px] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] z-10 pointer-events-none flex justify-start">
                    <div className="w-[260px] h-full flex items-center justify-center text-[11px] font-bold tracking-[0.35em] uppercase text-black shrink-0">
                      Start Your Roll
                    </div>
                  </div>

                </Link>
              </div>
            </div>

            {/* Right Interactive Box */}
            <div className="flex items-center gap-3 hidden lg:flex pointer-events-auto ml-auto">

              {/* GitHub Button */}
              <div className="relative group">
                <div className="absolute inset-0 bg-theme-4/30 rounded-2xl blur-[15px] scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-none"></div>
                <a href="https://github.com/Alwin-Saji/QR" target="_blank" rel="noopener noreferrer" className="relative flex items-center justify-center bg-black/40 hover:bg-theme-4 text-theme-4 hover:text-black backdrop-blur-md border border-theme-4/20 hover:border-theme-4 p-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-2xl overflow-hidden w-[58px] hover:w-[130px] h-[60px]">
                  <FaGithub className="w-6 h-6 flex-shrink-0 z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-x-8" />
                  <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-4 whitespace-nowrap text-[9px] font-bold tracking-[0.15em] uppercase z-10">GitHub</span>
                </a>
              </div>

              {/* QR Code Button */}
              <div className="relative group">
                <div className="absolute inset-0 bg-theme-4/30 rounded-2xl blur-[15px] scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-none"></div>
                <button onClick={() => setIsQRModalOpen(true)} className="relative flex items-center justify-center bg-black/40 hover:bg-theme-4 text-theme-4 hover:text-black backdrop-blur-md border border-theme-4/20 hover:border-theme-4 p-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-2xl overflow-hidden w-[58px] hover:w-[130px] h-[60px]">
                  <QrCode className="w-6 h-6 flex-shrink-0 z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-x-8" />
                  <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-4 whitespace-nowrap text-[9px] font-bold tracking-[0.15em] uppercase z-10 text-left leading-tight">Scan To<br />Join</span>
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Features Grid */}
      <section id="features" className="relative bg-theme-2/30 py-32 border-t border-theme-3/10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-theme-4 mb-4">Why use ARC?</h2>
            <p className="text-theme-4/60 text-lg max-w-2xl mx-auto">Everything you need to collect memories from your guests seamlessly.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-theme-1" />}
              title="Real-time Sync"
              desc="Powered by Supabase Realtime. Photos appear instantly on everyone's screen the second they are uploaded."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-theme-1" />}
              title="Zero Friction"
              desc="Guests just point their camera at your QR code. No app downloads, no account creation, no hassle."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-theme-1" />}
              title="Secure & Private"
              desc="Backed by Row Level Security. Only you can manage your events, and photos auto-delete after 24 hours."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-1 py-12 border-t border-theme-3/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Camera className="w-6 h-6 text-theme-3" />
            <span className="font-heading font-bold text-2xl text-theme-4">ARC</span>
          </div>
          <p className="text-theme-4/50 mb-6 font-medium">An open-source real-time photo sharing platform.</p>
          <div className="flex justify-center gap-6">
            <a href="https://github.com/Alwin-Saji/QR" className="text-theme-4/40 hover:text-theme-3 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* QR Modal Overlay */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsQRModalOpen(false)}></div>
          <div className="relative bg-[#0a0a0a] backdrop-blur-md border border-theme-4/20 p-8 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsQRModalOpen(false)} className="absolute top-4 right-4 text-theme-4/50 hover:text-theme-4 transition-colors p-1">
              <X className="w-6 h-6" />
            </button>
            <div className="bg-theme-4 p-4 rounded-2xl shadow-xl mt-4">
              <QRCodeSVG value="https://github.com/Alwin-Saji/QR" size={200} bgColor="transparent" fgColor="#0a0a0a" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-heading font-bold text-theme-4 mb-2 tracking-wide">Scan to Join</h3>
              <p className="text-[10px] font-sans font-bold tracking-[0.2em] text-theme-4/70 uppercase">No Apps Required</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group p-8 bg-theme-2/50 backdrop-blur-sm rounded-3xl border border-theme-3/10 hover:border-theme-3/30 shadow-lg hover:shadow-xl hover:shadow-theme-3/5 transition-all duration-300 hover:-translate-y-2">
      <div className="bg-gradient-to-br from-theme-3 to-theme-4 w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-heading font-bold text-theme-4 mb-3">{title}</h3>
      <p className="text-theme-4/70 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z" />
    </svg>
  );
}
