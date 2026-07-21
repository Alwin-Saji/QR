import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, EyeOff, Clock } from 'lucide-react';

const AnimatedLine = () => (
  <svg className="absolute top-0 left-0 w-full h-[1px] overflow-visible" preserveAspectRatio="none">
    <motion.line 
      x1="0" y1="0" x2="100%" y2="0" 
      stroke="rgba(255,255,255,0.15)" strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
    />
  </svg>
);

export default function About() {
  return (
    <section id="about" className="relative bg-[#050505] w-full flex flex-col pt-16 pb-2 md:pb-24">
      <AnimatedLine />
      
      <div className="w-[90vw] md:w-[85vw] max-w-7xl mx-auto pt-20 sm:pt-24 md:pt-40 pb-20 sm:pb-24 md:pb-32 relative z-20 flex flex-col md:flex-row items-start justify-between">
        
        {/* Mobile Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="md:hidden w-full mb-8 sm:mb-12"
        >
          <h2 className="text-[#f5eedc]/80 text-center text-7xl sm:text-6xl font-heading font-black tracking-wide border-b border-theme-4/10 pb-4">
            about
          </h2>
        </motion.div>

        {/* Main Content Paragraph */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 pr-8 md:pr-12 lg:pr-24 w-full"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white leading-[1.6] sm:leading-[1.5] md:leading-[1.4] max-w-5xl tracking-tight">
            Mementos is a real-time, <span className="text-transparent tracking-wide [-webkit-text-stroke:0.5px_#f5eedc]">ephemeral</span> photo-sharing space built for the present. no <span className="text-transparent [-webkit-text-stroke:0.5px_#f5eedc]">algorithms</span>, no permanent feeds, no <span className="text-transparent [-webkit-text-stroke:0.5px_#f5eedc]">vanity metrics</span>. just a pure connection where photos <span className="text-transparent [-webkit-text-stroke:0.5px_#f5eedc]">vanish</span> when the moment ends, leaving only the memory behind.
          </h3>
        </motion.div>

        {/* Vertical Title on Right Edge */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="hidden md:flex flex-col items-center justify-center border-l border-theme-4/10 pl-8 lg:pl-16 h-full min-h-[300px]"
        >
          <div 
            className="text-[#f5eedc]/80 text-6xl md:text-7xl lg:text-[8rem] font-heading font-black tracking-wide whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            about
          </div>
        </motion.div>

      </div>
      
      {/* Massive Ticker Banner */}
      <div className="w-full overflow-hidden whitespace-nowrap flex py-4 sm:py-6 md:py-8 border-y border-[#050505] mt-8 sm:mt-12 mb-0 bg-theme-4 text-[#050505] -rotate-2 scale-105 shadow-2xl relative z-10">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
          className="flex shrink-0 items-center gap-6 sm:gap-8 md:gap-12"
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 sm:gap-8 md:gap-12">
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tighter leading-tight pb-1 sm:pb-2 md:pb-4 pt-1">
                Designed to disappear
              </h2>
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 rounded-full bg-[#050505]" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
