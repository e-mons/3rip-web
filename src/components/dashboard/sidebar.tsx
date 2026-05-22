'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  Calendar, 
  Ticket, 
  MessageSquare, 
  AlertCircle, 
  DollarSign, 
  CreditCard, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  LogOut,
  Brain,
  Zap,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { group: 'Overview', items: [
    { name: 'Dashboard', href: '/overview', icon: LayoutDashboard },
    { name: 'Live Tracking', href: '/tracking', icon: MapPin },
    { name: 'AI Insights', href: '/ai-insights', icon: Brain },
  ]},
  { group: 'Management', items: [
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Drivers', href: '/drivers', icon: ShieldCheck },
    { name: 'Vehicles', href: '/vehicles', icon: Car },
    { name: 'Bookings', href: '/bookings', icon: Calendar },
    { name: 'Coupons', href: '/coupons', icon: Ticket },
  ]},
  { group: 'Operations', items: [
    { name: 'Support', href: '/support', icon: MessageSquare },
    { name: 'Disputes', href: '/disputes', icon: AlertCircle },
    { name: 'Notifications', href: '/notifications', icon: Zap },
  ]},
  { group: 'Finance', items: [
    { name: 'Payments', href: '/payments', icon: DollarSign },
    { name: 'Payouts', href: '/payouts', icon: CreditCard },
    { name: 'Commission', href: '/commission', icon: BarChart3 },
  ]},
  { group: 'System', items: [
    { name: 'Settings', href: '/system', icon: Settings },
    { name: 'Audit Logs', href: '/audit', icon: ShieldCheck },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-72 h-screen border-r border-gray-100 bg-white flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/logo.png" 
            alt="3rip Logo" 
            width={40} 
            height={40} 
            className="w-10 h-10 object-contain"
          />
          <span className="text-gray-900 font-black text-2xl tracking-tighter uppercase italic">3<span className="text-[var(--color-primary)]">rip</span> <span className="text-[var(--color-primary)]/60 text-sm align-top ml-1">Admin</span></span>
        </Link>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {navigation.map((group) => (
          <div key={group.group} className="mb-8">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/(dashboard)' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group relative",
                      isActive 
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon className={cn("w-5 h-5", isActive ? "text-[var(--color-primary)]" : "text-gray-300 group-hover:text-gray-500")} />
                      <span className="text-sm font-semibold">{item.name}</span>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-2xl"
                      />
                    )}
                    <ChevronRight className={cn("w-4 h-4 transition-transform opacity-0 group-hover:opacity-100", isActive ? "opacity-100 text-[var(--color-primary)]" : "text-gray-200")} />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Footer */}
      <div className="p-6 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-between w-full p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900">Alex Admin</p>
              <p className="text-[10px] text-gray-500">Super Admin</p>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </aside>
  )
}

