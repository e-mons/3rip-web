"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Car, Clock, Shield, Star, MapPin } from "lucide-react";

export default function RidePage() {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 lg:px-12 bg-[#212121] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
              Ride in <span className="text-[var(--color-primary)]">Comfort</span> <br />
              and Style
            </h1>
            <p className="text-xl text-gray-400 mb-10 font-medium leading-relaxed">
              From budget-friendly shared rides to luxury black cars, we provide the best transportation experience in the city.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="px-10 py-4 bg-[var(--color-primary)] text-white font-black rounded-full shadow-xl shadow-[var(--color-primary)]/20 text-center">Book Now</Link>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative h-[500px]">
             <Image src="/hero-car.png" alt="Ride" fill className="object-contain" />
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-black text-[#4B4B4B]">Our Ride Options</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Standard", desc: "Economical everyday rides for individuals and small groups.", price: "Low Cost", icon: Car },
            { title: "Executive", desc: "High-end luxury sedans for professional travel and comfort.", price: "Premium", icon: Star },
            { title: "Ride Share", desc: "Share your ride and save even more while reducing your carbon footprint.", price: "Economy", icon: Clock }
          ].map((s, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="group p-10 rounded-[3rem] border border-gray-100 bg-white hover:border-[var(--color-primary)]/50 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-8 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <s.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#4B4B4B] mb-4">{s.title}</h3>
              <p className="text-gray-500 font-medium mb-6">{s.desc}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-[var(--color-primary)] uppercase tracking-widest text-xs">{s.price}</span>
                <span className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                  <MapPin size={20} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
