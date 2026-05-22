'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Notification } from '@/components/ui'
import { useNotifications } from '@/hooks/use-realtime'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { notifications } = useNotifications()
  const [activeNotification, setActiveNotification] = useState<any>(null)

  useEffect(() => {
    if (notifications.length > 0) {
      setActiveNotification(notifications[notifications.length - 1])
      const timer = setTimeout(() => setActiveNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground flex">
      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-[70]"
            >
              <div className="relative h-full">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute top-8 right-[-50px] w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-md"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeNotification && (
          <Notification 
            title={activeNotification.title}
            message={activeNotification.message}
            type={activeNotification.type}
            onClose={() => setActiveNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative pb-20 lg:pb-0">
        <Header />
        
        <div className="flex-1 p-4 lg:p-10 max-w-[1600px] w-full mx-auto">
          {children}
        </div>

        {/* Footer info */}
        <footer className="px-10 py-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black/5 rounded-md flex items-center justify-center">
              <span className="text-gray-500 text-[10px] font-black italic">3</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
              3rip Administrative Control Panel v1.0.4
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[10px] text-gray-400 font-bold uppercase hover:text-gray-900 transition-colors">Documentation</button>
            <button className="text-[10px] text-gray-400 font-bold uppercase hover:text-gray-900 transition-colors">API Status</button>
            <button className="text-[10px] text-gray-400 font-bold uppercase hover:text-gray-900 transition-colors">System Health</button>
          </div>
        </footer>
      </main>
    </div>
  )
}

