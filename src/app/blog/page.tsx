"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  };

  const posts = [
    {
      title: "How to Choose the Best Taxi Booking App for You",
      date: "23 Oct, 2023",
      category: "Taxi Booking",
      author: "Admin",
      img: "/driver-lifestyle.png",
      excerpt: "Explore the key features that define a premium mobility experience and how to identify them."
    },
    {
      title: "The Best Taxi Booking Apps for Budget Travelers",
      date: "23 Oct, 2023",
      category: "Taxi Booking",
      author: "Admin",
      img: "/driver-lifestyle.png",
      excerpt: "Save money without compromising on safety or comfort with our top picks for budget-conscious riders."
    },
    {
      title: "The Best Taxi Booking Apps for the Safety-Conscious",
      date: "23 Oct, 2023",
      category: "Taxi Booking",
      author: "Admin",
      img: "/driver-lifestyle.png",
      excerpt: "A deep dive into the safety features you should never compromise on when booking a ride."
    },
    {
      title: "Future of Urban Mobility: What to Expect in 2026",
      date: "15 Jan, 2026",
      category: "Innovation",
      author: "Editor",
      img: "/driver-lifestyle.png",
      excerpt: "From AI-driven dispatch to electric fleets, see how the landscape of transportation is changing."
    }
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 lg:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h1 className="text-5xl lg:text-7xl font-black text-[#4B4B4B] mb-8 tracking-tighter">
              3rip <span className="text-[var(--color-primary)]">Newsroom</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Stay updated with the latest trends in urban mobility, product updates, and success stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
          {posts.map((blog, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-2xl transition-all"
            >
              <div className="h-80 relative overflow-hidden">
                <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-md text-[var(--color-primary)] px-6 py-2 rounded-xl text-sm font-black shadow-sm">
                    {blog.category}
                  </span>
                </div>
              </div>

              <div className="p-10 flex flex-col flex-1">
                <div className="flex items-center gap-6 text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">
                   <div className="flex items-center gap-2">
                      <User size={16} className="text-[var(--color-primary)]" />
                      <span>{blog.author}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[var(--color-primary)]" />
                      <span>{blog.date}</span>
                   </div>
                </div>

                <h3 className="text-2xl lg:text-3xl font-black text-[#4B4B4B] leading-tight mb-6 group-hover:text-[var(--color-primary)] transition-colors">
                  {blog.title}
                </h3>
                
                <p className="text-gray-500 font-medium mb-10 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>

                <Link href="/login" className="mt-auto flex items-center gap-3 text-[var(--color-primary)] font-black text-sm uppercase tracking-widest hover:gap-5 transition-all">
                  Read More <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
