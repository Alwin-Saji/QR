import React from 'react';
import { motion } from 'framer-motion';

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
    <section id="about" className="relative bg-[#050505] w-full flex flex-col pt-16 pb-0 overflow-hidden">
      <AnimatedLine />
      
      <div className="w-[80vw] mx-auto pt-24 md:pt-32 pb-16 flex flex-col justify-center">
        <div className="max-w-2xl">
          <p className="text-theme-4/50 text-xl font-light tracking-wide mb-6 flex items-center gap-4">
            <span className="w-8 h-[1px] bg-theme-4/50 block"></span>
            Core Philosophy
          </p>
          <h3 className="text-2xl md:text-3xl font-light text-white leading-relaxed mb-6">
            We believe technology should be invisible.
          </h3>
          <p className="text-theme-4/60 text-base md:text-lg font-light leading-relaxed">
            Mementos is a real-time, ephemeral photo-sharing space built for the present. No algorithms, no permanent feeds, no vanity metrics. Just a pure, unadulterated connection where photos vanish when the moment ends, leaving only the memory behind.
          </p>
        </div>
      </div>
      
      {/* Massive Ticker Banner */}
      <div className="w-full overflow-hidden whitespace-nowrap flex py-6 md:py-8 border-y border-[#050505] mt-12 mb-0 bg-theme-4 text-[#050505] -rotate-2 scale-105 shadow-2xl relative z-10">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
          className="flex shrink-0 items-center gap-8 md:gap-12"
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 md:gap-12">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tighter">
                Designed to disappear
              </h2>
              <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#050505]" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
