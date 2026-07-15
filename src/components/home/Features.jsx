import React from 'react';
import { motion } from 'framer-motion';

const SpinningStar = () => (
  <motion.svg 
    animate={{ rotate: 360 }}
    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    width="160" height="160" viewBox="0 0 160 160" 
    className="absolute -top-10 right-0 opacity-20 text-theme-4 pointer-events-none hidden md:block"
  >
    <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M80,0 L80,160 M0,80 L160,80 M23.4,23.4 L136.6,136.6 M23.4,136.6 L136.6,23.4 M40,10 L120,150 M120,10 L40,150 M10,40 L150,120 M10,120 L150,40" />
    <circle cx="80" cy="80" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="80" cy="80" r="75" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="4 4" />
  </motion.svg>
);

const FeatureBadge = ({ text, id, position = "right" }) => {
  const alignClass = position === "right"
    ? "-top-24 -right-24 md:-top-30 md:-right-60"
    : "-top-24 -left-24 md:-top-30 md:-left-60";

  return (
    <div className={`absolute ${alignClass} w-48 h-48 md:w-80 md:h-80 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10`}>
      <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible">
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="25s" repeatCount="indefinite" />
          <path id={id} d="M 80, 80 m -60, 0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0" fill="none" />
          <text fontSize="12" fill="currentColor" className="font-mono uppercase tracking-[0.2em] text-theme-4">
            <textPath href={`#${id}`} startOffset="0%">
              {text}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
};

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

const InstantIcon = () => (
  <svg viewBox="0 0 24 24" className="w-16 h-16 mb-8 text-theme-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
    <motion.path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      variants={{
        visible: { pathLength: 1, fill: "rgba(255,255,255,0)", scale: 1 },
        hover: { 
          pathLength: [1, 0, 1], 
          fill: ["rgba(255,255,255,0)", "rgba(255,255,255,0.2)", "rgba(255,255,255,0)"], 
          scale: 1.15, 
          transition: { duration: 1.2, ease: "easeInOut" } 
        }
      }}
    />
  </svg>
);

const FrictionIcon = () => (
  <svg viewBox="0 0 24 24" className="w-16 h-16 mb-8 text-theme-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-visible">
    <motion.path
      d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4-2.4 7.6-2.4-7.6-7.6-2.4 7.6-2.4z"
      fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      variants={{
        visible: { rotate: 0, scale: 1 },
        hover: { rotate: 180, scale: 1.2, fill: "rgba(255,255,255,0.1)", transition: { duration: 1, ease: "backOut" } }
      }}
      style={{ originX: "12px", originY: "12px" }}
    />
    <motion.path
      d="M5 5l1.2 3.8 3.8 1.2-3.8 1.2-1.2 3.8-1.2-3.8-3.8-1.2 3.8-1.2z"
      fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      variants={{
        visible: { rotate: 0, scale: 0, opacity: 0 },
        hover: { rotate: -180, scale: 1, opacity: 1, transition: { duration: 1, delay: 0.2, ease: "backOut" } }
      }}
      style={{ originX: "5px", originY: "5px" }}
    />
  </svg>
);

const SecureIcon = () => (
  <svg viewBox="0 0 24 24" className="w-16 h-16 mb-8 text-theme-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-visible">
    <motion.path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      variants={{
        visible: { pathLength: 1, scale: 1 },
        hover: { pathLength: [1, 0, 1], scale: 1.1, fill: "rgba(255,255,255,0.05)", transition: { duration: 1.5, ease: "easeInOut" } }
      }}
      style={{ originX: "12px", originY: "12px" }}
    />
    <motion.path
      d="M9 12l2 2 4-4"
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      variants={{
        visible: { pathLength: 1, opacity: 1 },
        hover: { pathLength: [1, 0, 1], opacity: [1, 0, 1], transition: { duration: 1, delay: 0.2, ease: "easeInOut" } }
      }}
    />
  </svg>
);

export default function Features() {
  const lineVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <section id="features" className="relative bg-[#050505] pt-32 md:pt-48 pb-0 overflow-hidden w-full">
      <div className="w-full">

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-32 md:mb-48 relative w-[80vw] mx-auto"
        >
          <SpinningStar />
          <p className="text-theme-4/50 text-xl font-light tracking-wide uppercase mb-6 flex items-center gap-4">
            <span className="w-8 h-[1px] bg-theme-4/50 block"></span>
            The details
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-light text-white leading-[1.2] max-w-4xl">
            Designed to disappear.
            <br />
            So the memories can take over.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-16 md:gap-32">

          {/* Feature 1 */}
          <motion.div
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover="hover"
            className="group relative cursor-default overflow-hidden"
          >
            <AnimatedLine />
            <div className="w-[80vw] mx-auto relative pt-12 md:pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-16">
              <FeatureBadge id="badge-instant" text="REALTIME • INSTANT • REALTIME • INSTANT • " position="right" />
              <div className="order-2 md:order-1 max-w-md">
                <InstantIcon />
                <p className="text-theme-4/40 text-lg md:text-2xl font-light leading-relaxed group-hover:text-theme-4/90 transition-colors duration-500">
                  Powered by Supabase Realtime. Photos hit the screen the exact second they are snapped. No waiting, no refreshing. A live, shared experience.
                </p>
              </div>
              <h3 className="order-1 md:order-2 mt-8 md:mt-12 relative inline-block w-fit text-[clamp(4rem,10vw,12rem)] leading-[0.9] font-heading font-normal text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.2)] md:[-webkit-text-stroke:2px_rgba(255,255,255,0.2)] group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.8)] md:group-hover:[-webkit-text-stroke:2px_rgba(255,255,255,0.8)] group-hover:text-white transition-all duration-700">
                Instant.
              </h3>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover="hover"
            className="group relative cursor-default overflow-hidden"
          >
            <AnimatedLine />
            <div className="w-[80vw] mx-auto relative pt-12 md:pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-16">
              <FeatureBadge id="badge-friction" text="NO APP • ZERO FRICTION • NO APP • ZERO FRICTION • " position="left" />
              <h3 className="order-1 mt-8 md:mt-12 relative inline-block w-fit text-[clamp(4rem,10vw,12rem)] leading-[0.9] font-heading font-normal text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.2)] md:[-webkit-text-stroke:2px_rgba(255,255,255,0.2)] group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.8)] md:group-hover:[-webkit-text-stroke:2px_rgba(255,255,255,0.8)] group-hover:text-white transition-all duration-700">
                Frictionless.
              </h3>
              <div className="order-2 max-w-md md:text-right flex flex-col md:items-end z-10 relative">
                <FrictionIcon />
                <p className="text-theme-4/40 text-lg md:text-2xl font-light leading-relaxed group-hover:text-theme-4/90 transition-colors duration-500">
                  Point, shoot, done. Guests don't need to download an app or create an account. They just scan the QR code and they're instantly part of it.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover="hover"
            className="group relative cursor-default overflow-hidden"
          >
            <AnimatedLine />
            <div className="w-[80vw] mx-auto relative pt-12 md:pt-16 pb-12 md:pb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-16">
              <FeatureBadge id="badge-secure" text="PRIVATE • SECURE • PRIVATE • SECURE • " position="right" />
              <div className="order-2 md:order-1 max-w-md z-10 relative">
                <SecureIcon />
                <p className="text-theme-4/40 text-lg md:text-2xl font-light leading-relaxed group-hover:text-theme-4/90 transition-colors duration-500">
                  Backed by strict Row Level Security. You own your event, and every memory automatically vanishes after 24 hours. Total privacy.
                </p>
              </div>
              <h3 className="order-1 md:order-2 mt-8 md:mt-12 relative inline-block w-fit text-[clamp(4rem,10vw,12rem)] leading-[0.9] font-heading font-normal text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.2)] md:[-webkit-text-stroke:2px_rgba(255,255,255,0.2)] group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.8)] md:group-hover:[-webkit-text-stroke:2px_rgba(255,255,255,0.8)] group-hover:text-white transition-all duration-700">
                Secure.
              </h3>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
