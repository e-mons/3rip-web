"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { DollarSign, Shield, Smartphone, Zap, CheckCircle2 } from "lucide-react";

export default function DrivePage() {
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
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div {...fadeUp} className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
              Drive with <span className="text-[var(--color-primary)]">Purpose</span> <br />
              and Profit
            </h1>
            <p className="text-xl text-gray-400 mb-10 font-medium leading-relaxed">
              Join the world's most driver-centric mobility platform. Get paid instantly, work when you want, and enjoy premium benefits.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/login" className="px-10 py-4 bg-[var(--color-primary)] text-white font-black rounded-full shadow-xl shadow-[var(--color-primary)]/20 text-center">Sign Up to Drive</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Driver Benefits */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl font-black text-[#4B4B4B] mb-8">Why Drive with 3rip?</h2>
            <div className="space-y-8">
              {[
                { title: "Highest Earnings", desc: "Keep a larger percentage of every fare with our fair commission structure.", icon: DollarSign },
                { title: "Instant Payouts", desc: "Access your earnings immediately with our real-time payout system.", icon: Zap },
                { title: "Full Safety", desc: "24/7 emergency assistance and insurance coverage for every trip.", icon: Shield },
                { title: "Smart Tools", desc: "Advanced app features to help you find the busiest areas and maximize profit.", icon: Smartphone }
              ].map((b, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center text-[var(--color-primary)] shrink-0">
                    <b.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#4B4B4B] mb-2">{b.title}</h4>
                    <p className="text-gray-500 font-medium">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div {...fadeUp} className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
            <Image src="/driver-lifestyle.png" alt="Driver" fill className="object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black text-[#4B4B4B]">How to Start</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Apply Online", desc: "Fill out the application form and upload your documents." },
            { step: "02", title: "Get Verified", desc: "Our team will review your profile and vehicle within 24 hours." },
            { step: "03", title: "Start Earning", desc: "Go online and start accepting ride requests instantly." }
          ].map((s, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <span className="text-[var(--color-primary)] font-black text-4xl mb-6 block">{s.step}</span>
              <h3 className="text-xl font-bold text-[#4B4B4B] mb-4">{s.title}</h3>
              <p className="text-gray-500 font-medium">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
