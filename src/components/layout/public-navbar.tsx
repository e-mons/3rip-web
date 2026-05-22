"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Ride", href: "/ride" },
    { name: "Drive", href: "/drive" },
    { name: "Business", href: "/business" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 lg:px-12 transition-all duration-300",
      scrolled ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-2" : "bg-transparent py-4"
    )}>
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Image src="/logo.png" alt="3rip Logo" width={44} height={44} priority className="rounded-xl shadow-md shadow-[var(--color-primary)]/10" />
        <span className={cn(
          "text-3xl font-black tracking-tighter transition-colors",
          scrolled ? "text-[#4B4B4B]" : "text-[#4B4B4B]" // Keeping consistent for now as background is light in current hero
        )}>
          <span className="text-[var(--color-primary)]">3</span>rip
        </span>
      </Link>

      <div className="hidden lg:flex items-center gap-10 text-sm font-bold">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            className={cn(
              "transition-colors hover:text-[var(--color-primary)]",
              pathname === link.href ? "text-[var(--color-primary)]" : "text-gray-500"
            )}
          >
            {link.name}
          </Link>
        ))}
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
  );
}
