'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export const Switch = ({ checked, onCheckedChange, className, disabled = false }: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-gray-200",
        className
      )}
    >
      <motion.span
        initial={false}
        animate={{
          x: checked ? 20 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0"
        )}
      />
    </button>
  )
}
