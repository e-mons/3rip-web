"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { ChevronRight, ArrowRight, Star, ShieldCheck, MapPin } from "lucide-react";
import Image from "next/image";

const slides = [
  {
    id: 1,
    videoUrl: "/videos/v1.mp4",
    tagline: "The Ultimate Mobility Ecosystem",
    headline: "Your Premium",
    headlineSpan: "On-Demand Journey",
    description: "Ride in luxury, send parcels securely, and move freight instantly. Experience uncompromised reliability designed around your lifestyle.",
    ctaPrimary: "Book a Ride",
    ctaSecondary: "Download App",
    floatingElement: (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, duration: 0.8, type: "spring", bounce: 0.4 }}
        className="hidden lg:flex absolute top-[25%] right-[8%] xl:right-[15%] bg-white/10 backdrop-blur-2xl border border-white/20 p-5 rounded-[2rem] shadow-2xl items-center gap-5 z-30"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-[#00928f] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,157,0.4)]">
          <ShieldCheck size={28} className="text-[#050505]" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-white font-black tracking-wide text-sm mb-0.5">Premium Black</div>
          <div className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            Arriving in 2 mins
          </div>
        </div>
      </motion.div>
    )
  },
  {
    id: 2,
    videoUrl: "/videos/v2.mp4",
    tagline: "Empower Your Hustle",
    headline: "Drive With",
    headlineSpan: "Professionalism & Trust",
    description: "Join our elite network of drivers. Enjoy flexible earnings, premium clientele, and complete support on every journey.",
    ctaPrimary: "Start Driving",
    ctaSecondary: "Learn More",
    floatingElement: (
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.9, rotate: 2 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, duration: 0.8, type: "spring", bounce: 0.4 }}
        className="hidden lg:flex absolute top-[35%] right-[10%] xl:right-[18%] bg-white/10 backdrop-blur-2xl border border-white/20 p-5 rounded-[2rem] shadow-2xl items-center gap-6 z-30"
      >
        <div className="flex -space-x-4 shadow-lg rounded-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-12 h-12 rounded-full border-[3px] border-[#111] overflow-hidden bg-gray-200 relative">
              <Image src="/about_user.png" alt="User" fill sizes="48px" className="object-cover" />
            </div>
          ))}
        </div>
        <div>
          <div className="flex gap-1 text-[var(--color-primary)] mb-1.5">
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
          </div>
          <div className="text-white text-sm font-black tracking-wide">5.0 Elite Rating</div>
        </div>
      </motion.div>
    )
  }
];

// Split text animation variants
const textVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  })
};

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // Increased to 8s to let animations breathe
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-[#050505] mb-20 md:mb-32">
      
      {/* Background Videos (Static in DOM to prevent black screen) */}
      {slides.map((s, index) => (
        <div
          key={s.videoUrl}
          className="absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out"
          style={{ 
            opacity: currentSlide === index ? 1 : 0, 
            zIndex: 0,
            pointerEvents: "none"
          }}
        >
          <video
            ref={(el) => {
              if (el) {
                el.defaultMuted = true;
                el.muted = true;
                el.play().catch((e) => console.log("Autoplay prevented:", e));
              }
            }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
          >
            <source src={s.videoUrl} type="video/mp4" />
          </video>
        </div>
      ))}

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >

          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30 z-10" />

          {/* Content Container */}
          <div className="relative z-20 h-full w-full max-w-[1440px] mx-auto px-6 lg:px-16 flex flex-col justify-start pt-32 md:pt-48 pb-20">

            {/* Optional Floating Element specific to slide */}
            {slide.floatingElement}

            <div className="max-w-3xl relative z-40">
              <motion.div
                custom={1}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-12 h-[3px] bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)] rounded-full" />
                <span className="font-bold text-white text-sm md:text-base tracking-[0.2em] uppercase opacity-90">
                  {slide.tagline}
                </span>
              </motion.div>

              <div className="mb-6">
                <motion.div custom={2} variants={textVariants} initial="hidden" animate="visible" className="overflow-hidden">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.2] tracking-tight">
                    {slide.headline}
                  </h1>
                </motion.div>
                <motion.div custom={3} variants={textVariants} initial="hidden" animate="visible" className="overflow-hidden pb-2">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.2] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[#00D1CC] to-white">
                    {slide.headlineSpan}
                  </h1>
                </motion.div>
              </div>

              <motion.p
                custom={4}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-base md:text-lg lg:text-xl text-gray-300 font-medium leading-relaxed mb-10 max-w-2xl"
              >
                {slide.description}
              </motion.p>

              <motion.div
                custom={5}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row items-center gap-6"
              >
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-5 bg-[var(--color-primary)] text-[#050505] font-black text-sm md:text-base uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:shadow-[0_0_40px_rgba(0,255,157,0.6)] hover:scale-105 hover:bg-[#00D1CC] transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  {slide.ctaPrimary}
                  <div className="w-8 h-8 rounded-full bg-[#050505]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={18} strokeWidth={3} className="text-[#050505]" />
                  </div>
                </Link>

                <Link
                  href="#ride"
                  className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-lg text-white font-bold text-sm md:text-base uppercase tracking-widest rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center"
                >
                  {slide.ctaSecondary}
                </Link>
              </motion.div>

              {/* Trust indicators under CTA */}
              <motion.div
                custom={6}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="mt-10 flex items-center gap-4 opacity-80"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] overflow-hidden relative">
                      <Image src="/about_user.png" alt="User" fill sizes="32px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold text-gray-400">
                  Join <span className="text-white">5M+</span> Active Users Worldwide
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slider Progress Indicators */}
      <div className="absolute bottom-12 left-6 lg:left-16 z-40 flex items-center gap-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="group relative h-2 rounded-full overflow-hidden transition-all duration-500 cursor-pointer"
            style={{ width: currentSlide === index ? '64px' : '24px', backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            {currentSlide === index && (
              <motion.div
                layoutId="activeSlideIndicator"
                className="absolute inset-0 bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 8, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-12 right-6 lg:right-16 z-40 hidden md:flex flex-col items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] rotate-90 mb-8">Discover</span>
        <div className="w-px h-20 bg-gradient-to-b from-[var(--color-primary)] to-transparent relative">
          <motion.div
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
          />
        </div>
      </div>
    </section>
  );
}
