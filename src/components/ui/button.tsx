'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading,
  children,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200',
    outline: 'bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
    icon: 'p-2.5',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-slate-400 border-t-primary rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  )
}
