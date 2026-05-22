'use client'

import React from 'react'
import { Modal } from './index'
import { Button } from './button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'secondary' | 'outline' | 'ghost'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50 border border-orange-100">
           <AlertTriangle className="w-5 h-5 text-orange-500" />
           <p className="text-xs text-orange-700 font-medium italic">
             Please confirm your decision to proceed.
           </p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3 pt-2">
           <Button 
            variant="secondary" 
            className="flex-1" 
            onClick={onClose}
            disabled={isLoading}
           >
             {cancelText}
           </Button>
           <Button 
            variant={variant} 
            className="flex-1" 
            onClick={onConfirm}
            disabled={isLoading}
           >
             {isLoading ? 'Processing...' : confirmText}
           </Button>
        </div>
      </div>
    </Modal>
  )
}
