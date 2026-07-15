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

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] overflow-hidden w-full">
      <AnimatedLine />
      
      <div className="w-[80vw] mx-auto pt-24 pb-12 flex flex-col justify-between min-h-[50vh]">
        
        {/* Top Section: Editorial Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-white/10 pb-12">
          
          <div className="max-w-sm">
            <p className="text-theme-4/60 font-light text-xl md:text-2xl leading-relaxed mb-8">
              An open-source real-time photo sharing platform built for the moment.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-theme-4/40 font-mono text-xs uppercase tracking-widest">Created by</p>
              <a href="https://github.com/Alwin-Saji" target="_blank" rel="noreferrer" className="flex items-center gap-2 group">
                <img src="https://github.com/Alwin-Saji.png" alt="Alwin Saji" className="w-6 h-6 rounded-full border border-white/10 group-hover:border-white/50 transition-colors duration-500" />
                <span className="text-white group-hover:text-theme-4 transition-colors duration-500 font-light text-sm">Alwin Saji</span>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-6 text-theme-4/40 font-mono text-sm uppercase tracking-widest">
            <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
            <a href="https://github.com/Alwin-Saji/QR" className="hover:text-white transition-colors duration-300 flex items-center gap-2">
              Source Code
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <span className="text-theme-4/20 mt-4 md:mt-0">© {new Date().getFullYear()}</span>
          </div>
          
        </div>

        {/* Bottom Section: Massive Left-Aligned Brand */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full mt-22"
        >
          <h2 className="text-[clamp(4rem,20vw,30rem)] leading-[0.75] font-heading font-normal text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.2)] md:[-webkit-text-stroke:2px_rgba(255,255,255,0.2)] hover:text-white transition-all duration-700 cursor-default -ml-1 md:-ml-3 tracking-wider">
            Mementos.
          </h2>
        </motion.div>
        
      </div>
    </footer>
  );
}
