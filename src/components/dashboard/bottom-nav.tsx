'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, MapPin, Users, Settings, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Tracking', href: '/tracking', icon: MapPin },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/system', icon: Settings },
]

export function BottomNav({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 min-w-[64px]"
            >
              <div className={cn(
                "w-12 h-8 rounded-full flex items-center justify-center mb-1 transition-all",
                isActive ? "bg-primary/20" : "bg-transparent hover:bg-gray-100"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-gray-400")} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-wider",
                isActive ? "text-gray-900" : "text-gray-400"
              )}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-2 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_var(--color-primary)]"
                />
              )}
            </Link>
          )
        })}
        <button
          onClick={onMenuClick}
          className="relative flex flex-col items-center justify-center p-2 min-w-[64px]"
        >
          <div className="w-12 h-8 rounded-full flex items-center justify-center mb-1 bg-transparent hover:bg-gray-100 transition-all">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
          <span className="text-[10px] font-bold tracking-wider text-gray-400">
            More
          </span>
        </button>
      </div>
    </div>
  )
}
