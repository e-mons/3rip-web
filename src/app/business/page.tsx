"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Briefcase, Building2, Package, TrendingUp, Users } from "lucide-react";

export default function BusinessPage() {
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
              3rip <span className="text-[var(--color-primary)]">for Business</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 font-medium leading-relaxed">
              Power your enterprise with our scalable logistics and transportation solutions. Manage travel, deliveries, and freight from a single dashboard.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="px-10 py-4 bg-[var(--color-primary)] text-white font-black rounded-full shadow-xl shadow-[var(--color-primary)]/20 text-center">Contact Sales</Link>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
             <Image src="/hero_mockup.png" alt="Business Dashboard" fill className="object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Business Solutions */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Corporate Travel", desc: "Unified billing and simplified expense management for your team's commutes.", icon: Building2 },
            { title: "Enterprise Logistics", desc: "Scale your delivery operations with our professional courier and freight network.", icon: Package },
            { title: "Team Management", desc: "Granular control over user permissions, budgets, and reporting.", icon: Users }
          ].map((s, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="p-10 rounded-[3rem] bg-gray-50 border border-gray-100 hover:bg-white hover:border-[var(--color-primary)] transition-all">
              <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center mb-8">
                <s.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#4B4B4B] mb-4">{s.title}</h3>
              <p className="text-gray-500 font-medium">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 lg:px-12 bg-[#141414] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
          <div>
            <h4 className="text-4xl font-black text-[var(--color-primary)] mb-2">10k+</h4>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Business Partners</p>
          </div>
          <div>
            <h4 className="text-4xl font-black text-[var(--color-primary)] mb-2">30%</h4>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Cost Savings</p>
          </div>
          <div>
            <h4 className="text-4xl font-black text-[var(--color-primary)] mb-2">24/7</h4>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Priority Support</p>
          </div>
          <div>
            <h4 className="text-4xl font-black text-[var(--color-primary)] mb-2">100%</h4>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Transparency</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
