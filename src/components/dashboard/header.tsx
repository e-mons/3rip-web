'use client'

import React from 'react'
import { Search, Bell, Moon, Sun, Search as SearchIcon, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  
  // Convert pathname to breadcrumbs
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .filter(segment => !segment.startsWith('('))
    .map((segment) => {
      return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
    })

  return (
    <header className="h-20 border-b border-black/5 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">3rip</span>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Admin</span>
        {breadcrumbs.length > 0 && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-primary text-xs font-bold uppercase tracking-widest">
              {breadcrumbs[breadcrumbs.length - 1]}
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Global Search */}
        <div className="hidden md:flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl w-80 group focus-within:border-primary/50 transition-all">
          <SearchIcon className="w-4 h-4 text-gray-400 group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full"
          />
          <kbd className="hidden sm:block text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-400">⌘K</kbd>
        </div>

        {/* System Status */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live System</span>
        </div>

        <div className="h-6 w-[1px] bg-black/5 mx-2" />

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all group">
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
        </button>

        {/* Profile (Simplified for Header) */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-0.5 shadow-lg shadow-primary/20">
          <div className="w-full h-full rounded-[14px] bg-white items-center justify-center flex">
            <span className="text-gray-900 font-bold text-xs">AA</span>
          </div>
        </div>
      </div>
    </header>
  )
}

