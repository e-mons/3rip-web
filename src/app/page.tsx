"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowDown, Shield, Zap, DollarSign, MapPin,
  Smartphone, Star, CheckCircle2, QrCode, Play,
  Navigation, Car, Package, CreditCard, ChevronRight, ChevronLeft,
  TrendingUp, Calendar, Users, User, Sparkles, CheckSquare, Phone, Check,
  Send, Globe, Mail
} from "lucide-react";
import HeroSlider from "../components/HeroSlider";

export default function LandingPage() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { staggerChildren: 0.15 }
  };

  return (
    <main className="relative min-h-screen bg-white text-[#4B4B4B] selection:bg-[var(--color-primary)]/30 selection:text-[var(--color-primary)] font-sans">

      {/* 1. Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-18 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 transition-all">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="3rip Logo" width={44} height={44} priority className="rounded-xl shadow-md shadow-[var(--color-primary)]/10" />
          <span className="text-3xl font-black tracking-tighter text-[#4B4B4B]">
            <span className="text-[var(--color-primary)]">3</span>rip
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-gray-500">
          <Link href="/ride" className="hover:text-[var(--color-primary)] transition-colors">Ride</Link>
          <Link href="/drive" className="hover:text-[var(--color-primary)] transition-colors">Drive</Link>
          <Link href="/business" className="hover:text-[var(--color-primary)] transition-colors">Business</Link>
          <Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">About Us</Link>
          <Link href="/blog" className="hover:text-[var(--color-primary)] transition-colors">Blog</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden sm:block text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors">
            Log In
          </Link>
          <Link href="/login" className="px-8 py-3.5 bg-[var(--color-primary)] hover:bg-[#00D1CC] text-white font-black text-sm rounded-full transition-all shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 hover:-translate-y-0.5">
            Book Now
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <HeroSlider />

      {/* 3. App Download & Stats Section */}
      <section id="ride" className="bg-[#212121] text-white py-24 px-6 lg:px-12 relative z-20 mx-6 lg:mx-12 rounded-[3rem] shadow-2xl overflow-hidden -mt-12 border border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-20">

          {/* Left Content: Headline & Stats */}
          <div className="flex-1">
            <motion.div {...fadeUp}>
              <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
                Download <span className="text-[var(--color-primary)]">Mobility Booking</span> <br />
                Application Now
              </h2>
              <p className="text-gray-400 font-medium mb-12 max-w-lg leading-relaxed">
                Experience the future of on-demand transportation. Our app provides seamless booking, real-time tracking, and secure payments at your fingertips.
              </p>

              <div className="flex flex-wrap gap-12 lg:gap-16">
                <div className="relative">
                  <div className="text-3xl lg:text-4xl font-black mb-2">5 Million+</div>
                  <div className="text-sm text-gray-500 font-bold">Worldwide Active Users</div>
                  <div className="absolute top-1/2 -right-6 lg:-right-8 -translate-y-1/2 w-px h-10 bg-gray-700" />
                </div>
                <div className="relative">
                  <div className="text-3xl lg:text-4xl font-black mb-2">200+</div>
                  <div className="text-sm text-gray-500 font-bold">Countries</div>
                  <div className="absolute top-1/2 -right-6 lg:-right-8 -translate-y-1/2 w-px h-10 bg-gray-700 hidden sm:block" />
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-black mb-2">8000+</div>
                  <div className="text-sm text-gray-500 font-bold">Active Drivers</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content: Download Cards */}
          <div className="flex flex-col sm:flex-row gap-8">
            {/* iOS Card */}
            <motion.div {...fadeUp} className="bg-[#2C2C2C] p-8 rounded-[2rem] w-full sm:w-64 relative overflow-hidden shadow-2xl border border-white/5">
              <div className="relative z-10">
                <h4 className="text-2xl font-black mb-1">For iOS</h4>
                <p className="text-gray-500 text-sm font-bold mb-6">iOS 15.6+</p>

                <div className="flex flex-col gap-4 mb-10">
                  <Link href="/login" className="flex items-center gap-4 bg-gradient-to-r from-[var(--color-primary)] to-[#00D1CC] px-6 py-4 rounded-2xl hover:scale-[1.02] transition-all group shadow-2xl shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 text-[#050505]">
                    <div className="w-11 h-11 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <Smartphone size={26} className="text-[#050505]" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] text-[#050505]/70 font-black uppercase tracking-widest mb-1">Download on the</span>
                      <span className="text-xl text-[#050505] font-black">App Store</span>
                    </div>
                  </Link>
                </div>

                <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center shadow-inner">
                  <QrCode size={64} className="text-[#212121]" />
                </div>
              </div>

              {/* Corner Icon Cutout Effect */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#212121] rounded-full flex items-center justify-center opacity-80">
                <div className="relative w-12 h-12">
                  <Image src="/logo.png" alt="Apple" fill sizes="48px" className="object-contain grayscale brightness-200" />
                </div>
              </div>
            </motion.div>

            {/* Android Card */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-[#2C2C2C] p-8 rounded-[2rem] w-full sm:w-64 relative overflow-hidden shadow-2xl border border-white/5">
              <div className="relative z-10">
                <h4 className="text-2xl font-black mb-1">For Android</h4>
                <p className="text-gray-500 text-sm font-bold mb-6">Android 8.0+</p>

                <div className="flex flex-col gap-4 mb-10">
                  <Link href="/login" className="flex items-center gap-4 bg-gradient-to-r from-[var(--color-primary)] to-[#00D1CC] px-6 py-4 rounded-2xl hover:scale-[1.02] transition-all group shadow-2xl shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 text-[#050505]">
                    <div className="w-11 h-11 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <Play size={24} fill="#050505" className="text-[#050505]" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] text-[#050505]/70 font-black uppercase tracking-widest mb-1">Get it on</span>
                      <span className="text-xl text-[#050505] font-black">Google Play</span>
                    </div>
                  </Link>
                </div>

                <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center shadow-inner">
                  <QrCode size={64} className="text-[#212121]" />
                </div>
              </div>

              {/* Corner Icon Cutout Effect */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#212121] rounded-full flex items-center justify-center opacity-80">
                <div className="relative w-12 h-12">
                  <Image src="/logo.png" alt="Android" fill sizes="48px" className="object-contain grayscale brightness-200" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Benefits Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-white text-center">
        <div className="max-w-7xl mx-auto">
          {/* Header matching reference image exactly */}
          <motion.div {...fadeUp} className="mb-20 flex flex-col items-center">
            <div className="flex items-center gap-2 text-[#4B4B4B] font-bold text-sm uppercase tracking-widest mb-3">
              <div className="w-6 h-[3px] bg-[var(--color-primary)] rounded-full" />
              Benefits of App
            </div>
            <div className="relative inline-block">
              {/* Decorative sparkle lines on the left */}
              <div className="absolute -left-12 top-0 text-[var(--color-primary)] opacity-60">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M10 20 L2 20 M14 10 L8 4 M14 30 L8 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-[#4B4B4B]">
                Benefits of <span className="text-[var(--color-primary)]">3rip Booking App</span>
              </h2>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {[
              { icon: Car, title: "Ride Booking", desc: "Get comfortable rides in minutes. From budget to luxury, we've got you covered." },
              { icon: Package, title: "Parcel Sending", desc: "Send packages across the city instantly with our secure door-to-door delivery." },
              { icon: TrendingUp, title: "Freight Moving", desc: "Professional logistics and freight services for all your heavy moving needs." },
              { icon: Calendar, title: "Car Rentals", desc: "Rent a vehicle for hours or days with zero hassle, right through the app." },
            ].map((benefit, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col items-center group">
                {/* Circular Icon with Soft Glow */}
                <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white mb-8 shadow-[0_10px_30px_-5px_rgba(0,169,164,0.4)] group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-[#4B4B4B] mb-3">{benefit.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed max-w-[240px]">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. About Section */}
      <section id="about" className="relative py-24 lg:py-32 px-6 lg:px-12 bg-[#E0E0E0] overflow-hidden">
        {/* Subtle grid background matching Hero */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Decorative subtle strokes matching Hero (mirrored slightly for variety) */}
        <div className="absolute top-10 left-[5%] z-0 opacity-40 text-[var(--color-primary)] hidden lg:block -rotate-12">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M120 10 Q 150 40 120 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M140 30 Q 160 50 140 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M150 90 Q 170 110 150 130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">

          {/* Left Column: Creative Image Layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-full max-w-[500px] mx-auto lg:mx-0 aspect-square"
          >
            {/* Main Background Circle - Image is perfectly fitted inside with overflow-hidden */}
            <div className="relative w-full h-full bg-[var(--color-primary)] rounded-full overflow-hidden shadow-2xl">
              <Image
                src="/about_user.png"
                alt="About 3rip"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                priority
                unoptimized
                className="object-cover object-center"
              />
            </div>

            {/* Floating Icons perfectly orbiting the circular boundary */}
            <div className="absolute top-[15%] right-[15%] translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-[var(--color-primary)] z-20 hover:scale-110 transition-transform">
              <MapPin size={28} fill="currentColor" />
            </div>
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-[var(--color-primary)] z-20 hover:scale-110 transition-transform">
              <Users size={28} fill="currentColor" />
            </div>
            <div className="absolute bottom-[15%] right-[15%] translate-x-1/2 translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-[var(--color-primary)] z-20 hover:scale-110 transition-transform">
              <Phone size={28} fill="currentColor" />
            </div>
          </motion.div>

          {/* Right Column: Content */}
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-2 text-[#4B4B4B] font-bold text-sm uppercase tracking-widest mb-4">
              <div className="w-6 h-[3px] bg-[var(--color-primary)] rounded-full" />
              About Us
            </div>

            <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight text-[#4B4B4B]">
              About <span className="text-[var(--color-primary)]">Our All-in-One</span> <br />
              3rip App
            </h2>

            <div className="space-y-6 mb-12">
              {[
                "The ultimate ecosystem for rides, parcels, and logistics.",
                "Verified professional partners ensures your safety 24/7.",
                "Seamless real-time tracking for every service we provide.",
                "Transparent, upfront pricing with multiple payment options."
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[var(--color-primary)]/20">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </div>
                  <p className="text-gray-500 font-bold leading-tight">{text}</p>
                </div>
              ))}
            </div>

            <Link href="#ride" className="px-10 py-4 bg-[var(--color-primary)] text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-[#00D1CC] transition-all shadow-xl shadow-[var(--color-primary)]/30 hover:scale-105 active:scale-95 inline-block text-center">
              Download App Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 6. App Demo / Screens Preview */}
      <section className="py-32 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto text-center mb-16 px-6">
          <div className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2"><span className="w-8 h-px bg-[var(--color-primary)] inline-block align-middle mr-2" />Sneak Peek</div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-[#4B4B4B]">View Our <span className="text-[var(--color-primary)]">App Demo</span></h2>
        </div>

        <div className="relative w-full h-[650px] flex justify-center items-center overflow-hidden">
          {/* Fade gradients for edges */}
          <div className="absolute top-0 left-0 w-[15%] h-full bg-gradient-to-r from-white to-transparent z-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[15%] h-full bg-gradient-to-l from-white to-transparent z-30 pointer-events-none" />

          <div className="flex justify-center items-center relative w-full min-w-[1200px]">

            {/* Screen -2 (Far Left) */}
            <motion.div initial={{ opacity: 0, x: 200 }} whileInView={{ opacity: 0.3, x: 0 }} viewport={{ once: true }}
              className="absolute -translate-x-[500px] w-[260px] h-[550px] rounded-[3rem] border-[6px] border-gray-100 overflow-hidden shadow-2xl z-0 filter blur-[2px]"
            >
              <Image src="/hero_mockup.png" alt="Screen" fill sizes="260px" unoptimized className="object-cover" />
            </motion.div>

            {/* Screen -1 (Left) */}
            <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 0.6, x: 0 }} viewport={{ once: true }}
              className="absolute -translate-x-[250px] w-[280px] h-[580px] rounded-[3rem] border-[8px] border-gray-200 overflow-hidden shadow-2xl z-10"
            >
              <Image src="/hero_mockup.png" alt="Screen" fill sizes="280px" unoptimized className="object-cover" />
            </motion.div>

            {/* Center Screen (Focus) */}
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
              className="relative z-20 w-[320px] h-[640px] rounded-[3rem] border-[10px] border-white overflow-hidden shadow-[0_30px_60px_rgba(0,169,164,0.3)] bg-gradient-to-br from-[#4B4B4B] to-[#2C2C2C]"
            >
              <Image src="/hero_mockup.png" alt="Main Screen" fill sizes="320px" unoptimized className="object-cover" />
              {/* Play Button Overlay perfectly matching reference */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <button className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
                  <Play size={32} className="ml-2" fill="currentColor" />
                </button>
              </div>
            </motion.div>

            {/* Screen +1 (Right) */}
            <motion.div initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 0.6, x: 0 }} viewport={{ once: true }}
              className="absolute translate-x-[250px] w-[280px] h-[580px] rounded-[3rem] border-[8px] border-gray-200 overflow-hidden shadow-2xl z-10"
            >
              <Image src="/hero_mockup.png" alt="Screen" fill sizes="280px" unoptimized className="object-cover" />
            </motion.div>

            {/* Screen +2 (Far Right) */}
            <motion.div initial={{ opacity: 0, x: -200 }} whileInView={{ opacity: 0.3, x: 0 }} viewport={{ once: true }}
              className="absolute translate-x-[500px] w-[260px] h-[550px] rounded-[3rem] border-[6px] border-gray-100 overflow-hidden shadow-2xl z-0 filter blur-[2px]"
            >
              <Image src="/hero_mockup.png" alt="Screen" fill sizes="260px" unoptimized className="object-cover" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 7. Features Section */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto bg-[#212121] rounded-[3rem] p-12 lg:p-24 relative overflow-hidden shadow-2xl">
          {/* Grid Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />

          {/* Header Row */}
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-12">
            <motion.div {...fadeUp} className="max-w-xl">
              <div className="flex items-center gap-3 text-[var(--color-primary)] font-bold text-sm uppercase tracking-widest mb-4">
                <div className="w-8 h-[2px] bg-[var(--color-primary)]" />
                Best Features
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                Key Features of <br />
                <span className="text-[var(--color-primary)]">3rip Booking App</span>
              </h2>
            </motion.div>

            <motion.div {...fadeUp} className="max-w-sm border-l-4 border-[var(--color-primary)] pl-8 py-2">
              <p className="text-gray-400 font-medium leading-relaxed">
                Experience the next generation of mobility. Our application is built to handle all your daily transportation and logistics needs with a single tap.
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Booking */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] pt-10 px-8 flex flex-col items-center text-center h-[550px] hover:shadow-2xl transition-shadow overflow-hidden"
            >
              <h3 className="text-2xl font-black text-[#4B4B4B] mb-3">Easy Booking Process</h3>
              <p className="text-gray-500 font-medium mb-6">Book any service in seconds. Our intuitive interface simplifies your journey from start to finish.</p>
              <div className="w-full flex-1 flex items-end justify-center">
                <div className="relative w-[280px] h-full -mb-4">
                  <Image src="/hero_mockup.png" alt="Booking Screen" fill sizes="280px" unoptimized className="object-cover object-top" />
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] pt-10 px-8 flex flex-col items-center text-center h-[550px] hover:shadow-2xl transition-shadow overflow-hidden"
            >
              <h3 className="text-2xl font-black text-[#4B4B4B] mb-3">Personalized Ride Tracking</h3>
              <p className="text-gray-500 font-medium mb-6">Monitor your ride or package in real-time with precise GPS tracking and live ETA updates.</p>
              <div className="w-full flex-1 flex items-end justify-center">
                <div className="relative w-[280px] h-full -mb-4">
                  <Image src="/hero_mockup.png" alt="Tracking Screen" fill sizes="280px" unoptimized className="object-cover object-top" />
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Support */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] pt-10 px-8 flex flex-col items-center text-center h-[550px] hover:shadow-2xl transition-shadow overflow-hidden"
            >
              <h3 className="text-2xl font-black text-[#4B4B4B] mb-3">Instant Driver Chat & Call</h3>
              <p className="text-gray-500 font-medium mb-6">Communicate seamlessly with your driver or delivery partner through our secure in-app chat.</p>
              <div className="w-full flex-1 flex items-end justify-center">
                <div className="relative w-[280px] h-full -mb-4">
                  <Image src="/hero_mockup.png" alt="Chat Screen" fill sizes="280px" unoptimized className="object-cover object-top" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Plans */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header section matching reference exactly */}
          <motion.div {...fadeUp} className="text-center mb-16 flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 text-[#4B4B4B] font-bold text-sm lg:text-base mb-6">
              <div className="w-6 h-[2px] bg-[var(--color-primary)]" />
              Pricing & Plans
            </div>

            <h2 id="business" className="text-4xl lg:text-[2.75rem] font-black leading-[1.2] tracking-tight mb-12 text-[#212121]">
              Let’s Know the Pricing <br />
              <span className="text-[var(--color-primary)]">Plan for You</span>
            </h2>

            {/* Toggle Switch */}
            <div className="flex items-center gap-6 text-[#212121] font-bold text-sm lg:text-base">
              <span>Bill Monthly</span>
              <div className="w-16 h-8 bg-gray-100 rounded-full p-1 cursor-pointer flex justify-end items-center shadow-inner relative border border-gray-200">
                <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full shadow-md absolute right-1" />
              </div>
              <span>Bill Annually</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
            {/* Left Card: Basic */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 p-10 lg:p-12 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col h-full"
            >
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[2.5rem] font-black text-[#212121]">$29</span>
                <span className="text-gray-500 font-medium">/month</span>
              </div>
              <h3 className="text-[1.75rem] font-medium text-[#212121] mb-4">Basic</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Essential mobility features for everyday commuters and standard parcel deliveries.
              </p>

              <div className="w-full h-px bg-gray-100 mb-8" />

              <ul className="space-y-5 mb-12 flex-1">
                {[
                  "Priority ride matching",
                  "5% discount on all trips",
                  "Standard in-app support"
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-500 text-sm font-medium">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                      <Check size={12} className="text-white" strokeWidth={4} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/login" className="w-full py-4 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors text-center">
                Choose Plan
              </Link>
            </motion.div>

            {/* Middle Card: Standard (Highlighted) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--color-primary)] p-10 lg:p-12 rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(0,169,164,0.5)] flex flex-col h-full relative z-10"
            >
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[2.5rem] font-black text-white">$49</span>
                <span className="text-white/90 font-medium">/month</span>
              </div>
              <h3 className="text-[1.75rem] font-medium text-white mb-4">Standard</h3>
              <p className="text-white/90 text-sm leading-relaxed mb-8">
                Perfect for frequent travelers wanting surge protection and premium support.
              </p>

              <div className="w-full h-px bg-white/20 mb-8" />

              <ul className="space-y-5 mb-12 flex-1">
                {[
                  "Zero peak surge pricing",
                  "15% discount on all trips",
                  "24/7 priority phone support"
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-4 text-white text-sm font-medium">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                      <Check size={12} className="text-[var(--color-primary)]" strokeWidth={4} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/login" className="w-full py-4 rounded-full bg-white text-[var(--color-primary)] font-bold shadow-lg hover:bg-gray-50 transition-colors text-center">
                Choose Plan
              </Link>
            </motion.div>

            {/* Right Card: Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-100 p-10 lg:p-12 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col h-full"
            >
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[2.5rem] font-black text-[#212121]">$99</span>
                <span className="text-gray-500 font-medium">/month</span>
              </div>
              <h3 className="text-[1.75rem] font-medium text-[#212121] mb-4">Premium</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                The ultimate mobility experience with access to luxury fleets and top drivers.
              </p>

              <div className="w-full h-px bg-gray-100 mb-8" />

              <ul className="space-y-5 mb-12 flex-1">
                {[
                  "Access to Premium SUVs",
                  "25% discount & free parcels",
                  "Dedicated personal concierge"
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-500 text-sm font-medium">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                      <Check size={12} className="text-white" strokeWidth={4} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/login" className="w-full py-4 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors text-center">
                Choose Plan
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. Availability Marquee */}
      <section className="bg-[var(--color-primary)] py-6 overflow-hidden whitespace-nowrap flex items-center shadow-inner">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 text-white text-3xl font-black"
        >
          {["USA", "Australia", "Lagos", "Canada", "India", "United Kingdom", "USA", "Australia", "Lagos", "Canada"].map((city, i) => (
            <div key={i} className="flex items-center gap-12">
              <span>{city}</span>
              {/* Outline star separator */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 10. Testimonials */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div {...fadeUp} className="mb-16">
            <div className="flex items-center justify-center gap-3 text-[#212121] font-bold text-sm lg:text-base mb-4">
              <div className="w-6 h-[2px] bg-[var(--color-primary)]" />
              Testimonials
            </div>
            <h2 className="text-4xl lg:text-[2.75rem] font-black leading-[1.2] tracking-tight text-[#212121]">
              Our Customer <span className="text-[var(--color-primary)]">Testimonials</span>
            </h2>
          </motion.div>

          <motion.div {...fadeUp} className="relative flex flex-col items-center">

            {/* Slider Navigation & Avatars */}
            <div className="flex items-center justify-between w-full mb-8">

              {/* Left Arrow (Inactive style) */}
              <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center text-white shrink-0 hover:bg-gray-200 transition-colors">
                <ChevronLeft size={20} className="text-white" strokeWidth={3} />
              </button>

              {/* 5 Avatars */}
              <div className="flex items-center justify-center gap-4 lg:gap-8 mx-4">
                <div className="hidden sm:block w-16 h-16 lg:w-[72px] lg:h-[72px] rounded-full overflow-hidden shrink-0">
                  <Image src="/about_user.png" alt="User 1" width={72} height={72} unoptimized className="object-cover w-full h-full" />
                </div>
                <div className="w-20 h-20 lg:w-[88px] lg:h-[88px] rounded-full overflow-hidden shrink-0">
                  <Image src="/about_user.png" alt="User 2" width={88} height={88} unoptimized className="object-cover w-full h-full" />
                </div>

                {/* Active Center */}
                <div className="relative shrink-0 flex items-center justify-center mx-2 lg:mx-4">
                  <div className="w-[120px] h-[120px] lg:w-[150px] lg:h-[150px] rounded-full border-[3px] border-[var(--color-primary)] flex items-center justify-center shadow-[0_15px_40px_rgba(0,169,164,0.35)] relative bg-white">
                    <div className="w-[104px] h-[104px] lg:w-[134px] lg:h-[134px] rounded-full overflow-hidden">
                      <Image src="/about_user.png" alt="Active User" width={134} height={134} unoptimized className="object-cover w-full h-full" />
                    </div>
                  </div>
                </div>

                <div className="w-20 h-20 lg:w-[88px] lg:h-[88px] rounded-full overflow-hidden shrink-0">
                  <Image src="/about_user.png" alt="User 4" width={88} height={88} unoptimized className="object-cover w-full h-full" />
                </div>
                <div className="hidden sm:block w-16 h-16 lg:w-[72px] lg:h-[72px] rounded-full overflow-hidden shrink-0">
                  <Image src="/about_user.png" alt="User 5" width={72} height={72} unoptimized className="object-cover w-full h-full" />
                </div>
              </div>

              {/* Right Arrow (Active style) */}
              <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0 shadow-lg hover:bg-[#00928f] transition-colors">
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Profile Info */}
            <h3 className="text-[1.5rem] font-bold text-[#212121] mb-1">Shane Lee</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">Satisfied Rider</p>

            {/* Stars */}
            <div className="flex gap-1.5 text-[var(--color-primary)] mb-12">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill="currentColor" strokeWidth={0} />)}
            </div>

            {/* Quote Block */}
            <div className="relative max-w-3xl px-6 lg:px-16 w-full">
              {/* Huge Background Quotes */}
              <div className="absolute top-0 left-0 lg:left-4 text-[160px] text-gray-50 font-serif leading-none select-none -translate-y-16 lg:-translate-y-20 z-0">
                &ldquo;
              </div>
              <div className="absolute bottom-0 right-0 lg:right-4 text-[160px] text-gray-50 font-serif leading-none select-none translate-y-16 lg:translate-y-20 z-0">
                &rdquo;
              </div>

              <p className="relative z-10 text-lg lg:text-[1.35rem] font-medium text-gray-600 leading-[1.8] text-center">
                I like that the app provides a variety of features, such as real-time tracking of the driver, fare estimates, and multiple payment options. These features make the app more user-friendly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 11. Top Drivers Showcase */}
      <section id="drive" className="relative py-24 lg:py-32 px-6 lg:px-12 bg-[#E0E0E0] overflow-hidden">
        {/* Subtle grid background matching Hero */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Decorative subtle strokes matching Hero style */}
        <div className="absolute top-20 right-[5%] z-0 opacity-40 text-[var(--color-primary)] hidden lg:block rotate-12">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M120 10 Q 150 40 120 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M140 30 Q 160 50 140 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M150 90 Q 170 110 150 130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <motion.div {...fadeUp}>
              <div className="flex items-center gap-3 text-[#212121] font-semibold text-sm lg:text-base mb-4">
                <div className="w-5 h-[2px] bg-[var(--color-primary)]" />
                Top Rated Driver
              </div>
              <h2 className="text-4xl lg:text-[2.75rem] font-medium leading-[1.3] tracking-tight text-[#212121]">
                The <span className="text-[var(--color-primary)] font-bold">Best Drivers</span> at <br />
                <span className="font-bold">Your Fingertips</span>
              </h2>
            </motion.div>
            <Link href="/login">
              <motion.button {...fadeUp} className="px-8 py-3.5 bg-[var(--color-primary)] text-white font-bold rounded-full shadow-lg hover:bg-[#00928f] transition-colors text-sm tracking-wide">
                View All Driver
              </motion.button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Esther Howard", rating: "5.0", role: "Premium SUV Driver" },
              { name: "Jenny Wilson", rating: "5.0", role: "Express Taxi Driver" },
              { name: "Jacob Jones", rating: "5.0", role: "Executive Sedan Driver" }
            ].map((driver, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white rounded-[2rem] p-4 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-50 group flex flex-col hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-shadow"
              >
                {/* Image Container with inner padding effect */}
                <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden bg-[#F3F4F6] relative mb-6">
                  <Image src="/driver-lifestyle.png" alt={driver.name} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>

                {/* Bottom Info */}
                <div className="flex justify-between items-start px-2 pb-2">
                  <div>
                    <h3 className="text-xl font-bold text-[#212121] mb-1">{driver.name}</h3>
                    <p className="text-[15px] font-medium text-gray-500">{driver.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[#212121] text-[15px] mt-1">
                    <Star size={16} fill="currentColor" className="text-[var(--color-primary)] mb-0.5" />
                    {driver.rating}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>      {/* 12. Blog & News */}
      <section id="blog" className="py-24 lg:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
            <motion.div {...fadeUp} className="max-w-xl">
              <div className="flex items-center gap-3 text-[#212121] font-semibold text-sm lg:text-base mb-4">
                <div className="w-5 h-[2px] bg-[var(--color-primary)]" />
                Blog and News
              </div>
              <h2 className="text-4xl lg:text-[2.75rem] font-bold leading-[1.2] tracking-tight text-[#212121]">
                Our Latest <span className="text-[var(--color-primary)]">Blog</span> & <span className="text-[var(--color-primary)]">News</span>
              </h2>
            </motion.div>
            <motion.div {...fadeUp} className="lg:w-1/2 border-l-4 border-[var(--color-primary)] pl-6">
              <p className="text-gray-500 font-medium leading-relaxed max-w-md">
                Stay updated with the latest trends in urban mobility, app features, and success stories from our global community of drivers and riders.
              </p>
            </motion.div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "How to Choose the Best Taxi Booking App for You",
                date: "23 Oct, 2023",
                category: "Taxi Booking",
                author: "Admin",
                img: "/driver-lifestyle.png"
              },
              {
                title: "The Best Taxi Booking Apps for Budget Travelers",
                date: "23 Oct, 2023",
                category: "Taxi Booking",
                author: "Admin",
                img: "/driver-lifestyle.png"
              },
              {
                title: "The Best Taxi Booking Apps for the Safety-Conscious",
                date: "23 Oct, 2023",
                category: "Taxi Booking",
                author: "Admin",
                img: "/driver-lifestyle.png"
              }
            ].map((blog, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] border border-gray-50 group flex flex-col hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] transition-shadow"
              >
                <div className="h-60 relative overflow-hidden">
                  <Image src={blog.img} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Category Tag */}
                  <div className="mb-4">
                    <span className="bg-[#FFF8F0] text-[var(--color-primary)] px-4 py-1.5 rounded-lg text-sm font-bold">
                      {blog.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#212121] leading-snug mb-8 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    {blog.title}
                  </h3>

                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                      <User size={18} className="text-[var(--color-primary)]" />
                      <span>by {blog.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                      <Calendar size={18} className="text-[var(--color-primary)]" />
                      <span>{blog.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Bottom CTA Section */}
      <section className="bg-white py-12 px-6 lg:px-12">
        <motion.div
          {...fadeUp}
          className="max-w-7xl mx-auto bg-[var(--color-primary)] rounded-[2.5rem] lg:rounded-[3.5rem] px-6 py-16 lg:py-24 text-center relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,169,164,0.3)]"
        >
          {/* Subtle grid background for the card to add texture */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <p className="text-white font-semibold text-lg lg:text-xl mb-4 tracking-wide opacity-90">
              Unlock Your Dream Ride: Your Taxi Booking Destination
            </p>
            <h2 className="text-4xl lg:text-[4.5rem] font-black text-white mb-8 leading-tight tracking-tight">
              Download the App Now!
            </h2>
            <p className="text-white/80 text-sm lg:text-base mb-12 max-w-lg mx-auto font-medium leading-relaxed">
              Join thousands of users experiencing the future of urban mobility with 3rip. Our all-in-one platform is your ultimate travel destination.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link href="https://play.google.com/store" target="_blank" className="flex items-center gap-4 px-8 py-4 bg-[#212121] text-white rounded-2xl hover:bg-black transition-all shadow-2xl hover:-translate-y-1 group">
                <Image src="/logo.png" alt="Google Play" width={28} height={28} unoptimized className="grayscale brightness-200 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 font-bold uppercase leading-tight tracking-widest">GET IT ON</div>
                  <div className="text-lg font-black leading-tight">Google Play</div>
                </div>
              </Link>
              <Link href="https://www.apple.com/app-store/" target="_blank" className="flex items-center gap-4 px-8 py-4 bg-[#212121] text-white rounded-2xl hover:bg-black transition-all shadow-2xl hover:-translate-y-1 group">
                <Image src="/logo.png" alt="App Store" width={28} height={28} unoptimized className="grayscale brightness-200 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 font-bold uppercase leading-tight tracking-widest">Download on the</div>
                  <div className="text-lg font-black leading-tight">App Store</div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 14. Footer */}
      <footer className="relative pt-24 pb-12 px-6 lg:px-12 bg-[#141414] text-white overflow-hidden">
        {/* Signature grid background */}
        <div className="absolute inset-0 z-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 mb-20">

            {/* Column 1: Logo & Intro */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
                  <Car size={24} className="text-white" fill="currentColor" />
                </div>
                <span className="text-2xl font-bold tracking-tight">3rip Mobility</span>
              </div>
              <p className="text-gray-400 text-[15px] leading-relaxed mb-10 max-w-sm font-medium">
                The world's leading mobility platform, revolutionizing how people and goods move across cities with AI-driven efficiency.
              </p>
              <div className="flex gap-4">
                {[
                  {
                    icon: (props: any) => (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    ),
                    href: "#"
                  },
                  { icon: Globe, href: "#" },
                  {
                    icon: (props: any) => (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                      </svg>
                    ),
                    href: "#"
                  },
                  {
                    icon: (props: any) => (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    ),
                    href: "#"
                  },
                  {
                    icon: (props: any) => (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    ),
                    href: "#"
                  }
                ].map((social, i) => (
                  <Link key={i} href={social.href} className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white hover:bg-[var(--color-primary)] transition-all hover:-translate-y-1 group">
                    <social.icon size={18} className="w-[18px] h-[18px] transition-transform group-hover:scale-110" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2: Company */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-bold mb-8">Company</h4>
              <ul className="space-y-4">
                {[
                  { name: "Home", href: "/" },
                  { name: "Features", href: "#features" },
                  { name: "Services", href: "/ride" },
                  { name: "About Us", href: "/about" },
                  { name: "Contact Us", href: "mailto:support@3rip.com" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 text-[15px] font-medium hover:text-[var(--color-primary)] transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="lg:col-span-3">
              <h4 className="text-lg font-bold mb-8">Contact</h4>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-gray-400 text-[15px] font-medium">
                  <Phone size={18} className="text-[var(--color-primary)]" />
                  (406) 555-0120
                </li>
                <li className="flex items-center gap-4 text-gray-400 text-[15px] font-medium">
                  <Globe size={18} className="text-[var(--color-primary)]" />
                  www.3rip.com
                </li>
                <li className="flex items-center gap-4 text-gray-400 text-[15px] font-medium">
                  <Mail size={18} className="text-[var(--color-primary)]" />
                  support@3rip.com
                </li>
                <li className="flex items-start gap-4 text-gray-400 text-[15px] font-medium">
                  <MapPin size={18} className="text-[var(--color-primary)] shrink-0" />
                  <span>56, Wuse 2, Abuja, Nigeria</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="lg:col-span-3">
              <h4 className="text-lg font-bold mb-8">Get the latest information</h4>
              <div className="flex bg-[#2A2A2A] rounded-xl overflow-hidden p-1.5 shadow-xl border border-white/5">
                <input
                  type="email"
                  placeholder="Email address"
                  className="bg-transparent border-none outline-none text-white px-4 py-3 w-full text-sm placeholder:text-gray-500 font-medium"
                />
                <button className="bg-[var(--color-primary)] text-white p-3 rounded-lg hover:bg-[#00928f] transition-all flex items-center justify-center shrink-0">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm font-medium">
              Copyright © 2026 3rip Mobility. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
              <Link href="#" className="hover:text-white transition-colors">User Terms & Conditions</Link>
              <div className="w-[1px] h-4 bg-gray-800" />
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
