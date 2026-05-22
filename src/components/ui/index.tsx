'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-900 outline-none focus:border-primary/50 transition-all placeholder:text-gray-400',
        className
      )}
      {...props}
    />
  )
}

export function Card({ className, children, onClick }: { className?: string, children: React.ReactNode, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        'bg-white border border-black/[0.04] shadow-xl shadow-black/[0.02] rounded-[32px] overflow-hidden', 
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Badge({ 
  className, 
  variant = 'default',
  children 
}: { 
  className?: string, 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info',
  children: React.ReactNode 
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-600 border border-amber-200',
    danger: 'bg-red-50 text-red-600 border border-red-200',
    info: 'bg-blue-50 text-blue-600 border border-blue-200',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function Notification({ title, message, type = 'info', onClose }: { title: string, message: string, type?: 'info' | 'success' | 'warning' | 'danger', onClose: () => void }) {
  const icons = {
    info: '🔵',
    success: '🟢',
    warning: '🟠',
    danger: '🔴',
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] w-80 bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-3xl p-5 shadow-2xl shadow-black/10"
    >
      <div className="flex gap-4">
        <div className="text-xl shrink-0">{icons[type]}</div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">✕</button>
      </div>
    </motion.div>
  )
}

export { Switch } from './switch'
export { Modal } from './modal'
export { ConfirmModal } from './confirm-modal'
export { ImageUpload } from './image-upload'
