"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { CheckCircle2, Globe, Shield, Zap } from "lucide-react";

export default function AboutPage() {
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
      <section className="relative pt-40 pb-24 px-6 lg:px-12 bg-[#E0E0E0] overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div {...fadeUp}>
            <h1 className="text-5xl lg:text-7xl font-black text-[#4B4B4B] mb-8 tracking-tighter">
              About <span className="text-[var(--color-primary)]">3rip</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
              We are on a mission to revolutionize urban mobility through technology, efficiency, and human-centric design.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeUp} className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
            <Image src="/about_user.png" alt="Team" fill className="object-cover" />
          </motion.div>
          
          <motion.div {...fadeUp}>
            <h2 className="text-4xl font-black text-[#4B4B4B] mb-8">Our Story</h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed font-medium">
              3rip started with a simple idea: transportation should be seamless, safe, and accessible to everyone. Today, we've grown into a global ecosystem that handles rides, logistics, and more.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-black text-[var(--color-primary)] mb-2">5M+</h4>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Users</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-[var(--color-primary)] mb-2">200+</h4>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cities Covered</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black text-[#4B4B4B]">Our Values</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Shield, title: "Safety First", desc: "Your safety is our top priority, with 24/7 monitoring and verified partners." },
            { icon: Zap, title: "Fast & Efficient", desc: "Optimized routing and AI matching for the quickest service possible." },
            { icon: Globe, title: "Global Scale", desc: "A unified platform working across borders to keep you moving." }
          ].map((v, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-6">
                <v.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#4B4B4B] mb-4">{v.title}</h3>
              <p className="text-gray-500 font-medium">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
