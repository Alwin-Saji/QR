import React from 'react';
import { Link } from 'react-router-dom';
import { Film, QrCode } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import gsap from 'gsap';

import img1 from '../../assets/vector1.png';
import img2 from '../../assets/vecotr2.png';
import img3 from '../../assets/vector3.jpg';
import img4 from '../../assets/vector4.png';
import Navigation from './Navigation';

export default function Hero({ user, setIsQRModalOpen }) {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [centeredItemIndex, setCenteredItemIndex] = React.useState(null);

  const marqueeTl = React.useRef(null);
  const heroRef = React.useRef(null);
  const textContainerRef = React.useRef(null);
  const bgTrackRef = React.useRef(null);
  const placardRef = React.useRef(null);
  const apertureHoleRef = React.useRef(null);
  const apertureOutlineRef = React.useRef(null);
  const irisContainerRef = React.useRef(null);
  const mainContentRef = React.useRef(null);

  React.useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set([apertureHoleRef.current, apertureOutlineRef.current], { scale: 0, rotation: -45, transformOrigin: "center center" });
      gsap.set(mainContentRef.current, { opacity: 1 });

      // 2. Cinematic Iris Opens
      tl.to([apertureHoleRef.current, apertureOutlineRef.current], {
        scale: 250, // Massive enough to clear the screen
        rotation: 90, // Rotating camera aperture feel
        duration: 1.8,
        ease: "power3.inOut",
        delay: 0.2
      })
        // Hide entire container after animation so it doesn't block the screen
        .set(irisContainerRef.current, { display: 'none' })

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
    <div ref={heroRef} className="w-full h-full relative">
      {/* Flawless Cinematic Iris Wipe (Precise Octagonal Aperture) */}
      <svg ref={irisContainerRef} className="fixed inset-0 z-[100] pointer-events-none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <mask id="iris-mask">
            <rect width="100%" height="100%" fill="white" />
            <svg x="50%" y="50%" overflow="visible">
              <polygon 
                ref={apertureHoleRef}
                points="0,-10 7.07,-7.07 10,0 7.07,7.07 0,10 -7.07,7.07 -10,0 -7.07,-7.07" 
                fill="black" 
                style={{ transform: "scale(0)", transformOrigin: "center center" }}
              />
            </svg>
          </mask>
        </defs>
        
        {/* The solid cream overlay */}
        <rect width="100%" height="100%" fill="var(--theme-color-4)" mask="url(#iris-mask)" />
        
        {/* The Black Stroke Outline that frames the hole */}
        <svg x="50%" y="50%" overflow="visible">
          <polygon 
            ref={apertureOutlineRef}
            points="0,-10 7.07,-7.07 10,0 7.07,7.07 0,10 -7.07,7.07 -10,0 -7.07,-7.07" 
            fill="none"
            stroke="#050505"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            style={{ transform: "scale(0)", transformOrigin: "center center" }}
          />
        </svg>
      </svg>

      {/* Main Page Content (Hidden Initially) */}
      <div ref={mainContentRef} className="opacity-0">

        <Navigation user={user} />

        <main className="w-full h-[100vh] min-h-[600px] overflow-hidden bg-[#0a0a0a] flex flex-col relative">

          {/* Subtle Grain */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.4] mix-blend-screen z-0 transform-gpu will-change-transform">
            <svg width="100%" height="100%">
              <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" /></filter>
              <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] bg-theme-1/20 blur-[120px] rounded-full pointer-events-none z-0 transform-gpu will-change-transform"></div>

          {/* OVERLAY SECTION: Typography (Mix Blend Mode) */}
          <div ref={textContainerRef} className="absolute inset-0 flex flex-col justify-center items-center text-center z-30 px-4 pointer-events-none mix-blend-difference text-white">
            <h1 className="mt-8 text-[7rem] md:text-[14rem] lg:text-[22rem] font-heading font-normal leading-[0.6] transition-all duration-700">
              Mementos
            </h1>
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-[10px] md:text-lg font-sans font-light italic max-w-md leading-relaxed tracking-wider">
                " You don't take a <span className='font-heading text-3xl'>photograph</span>, you make it. "
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
            <div className="absolute top-[60%] -translate-y-1/2 w-full z-0 pointer-events-none rotate-[10deg] scale-110 transform-gpu">
              <div className="border-y border-theme-4/5 bg-black/20 opacity-70 blur-[3px] py-8 overflow-hidden transform-gpu">
                <div ref={bgTrackRef} className="flex w-max will-change-transform transform-gpu">
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
            <div className="relative z-10 w-full -rotate-[5deg] transform-gpu">
              <div className="border-y border-theme-4/10 bg-black/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] py-8 overflow-hidden transform-gpu">
                <div ref={placardRef} className="flex w-max will-change-transform transform-gpu">
                  {/* Block 1 */}
                  <div className="flex items-center gap-4 md:gap-8 pr-4 md:pr-8">
                    {[img3, img1, img1, img4, img2].map((src, idx) => (
                      <div key={`fg-1-${idx}`} data-idx={idx % 5} className={`fg-item isolate h-[25vh] md:h-[30vh] min-h-[180px] aspect-[16/9] bg-[#050505] p-2 flex-shrink-0 relative group shadow-2xl border border-white/5 transition-all duration-700 ${isPlaying
                        ? 'scale-[1.05] z-20 opacity-100'
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
                      <div key={`fg-2-${idx}`} data-idx={idx % 5} className={`fg-item isolate h-[25vh] md:h-[30vh] min-h-[180px] aspect-[16/9] bg-[#050505] p-2 flex-shrink-0 relative group shadow-2xl border border-white/5 transition-all duration-700 ${isPlaying
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
                    <div className="w-[260px] h-full flex items-center justify-center pl-2 text-[11px] font-bold tracking-[0.35em] uppercase text-theme-4/70 shrink-0">
                      Make Your Roll
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
    </div>
  );
}
