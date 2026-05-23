"use client";

import React from "react";
import Link from "next/link";
import { 
  Phone, Globe, Mail, MapPin, Send, Car 
} from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="relative pt-24 pb-12 px-6 lg:px-12 bg-[#141414] text-white overflow-hidden mt-auto">
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
                { name: "Features", href: "/#features" },
                { name: "Services", href: "/ride" },
                { name: "About Us", href: "/about" },
                { name: "Contact Us", href: "mailto:support@3rip.org" }
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
                www.3rip.org
              </li>
              <li className="flex items-center gap-4 text-gray-400 text-[15px] font-medium">
                <Mail size={18} className="text-[var(--color-primary)]" />
                support@3rip.org
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
  );
}
