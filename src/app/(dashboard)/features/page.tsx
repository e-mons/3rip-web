'use client'

import React, { useEffect, useState } from 'react'
import { ToggleLeft, ToggleRight, Zap, Shield, Car, Package, Truck, MessageCircle, CreditCard, Save, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SettingsService } from '@/lib/services/settings-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function FeatureTogglesPage() {
  const queryClient = useQueryClient()
  const [features, setFeatures] = useState([
    { id: 'feature_ride_hailing', name: 'Standard Ride-Hailing', description: 'Core car booking service for riders.', icon: Car, enabled: true, risk: 'Low' },
    { id: 'feature_parcel_delivery', name: 'Parcel Delivery', description: 'Enable small item and document delivery service.', icon: Package, enabled: true, risk: 'Medium' },
    { id: 'feature_freight_logistics', name: 'Freight & Trucking', description: 'B2B logistics and heavy vehicle booking.', icon: Truck, enabled: false, risk: 'High' },
    { id: 'feature_in_app_chat', name: 'In-App Chat', description: 'Real-time communication between rider and driver.', icon: MessageCircle, enabled: true, risk: 'Low' },
    { id: 'feature_digital_wallet', name: 'Digital Wallet', description: 'Allow users to store credits and pay via 3rip balance.', icon: CreditCard, enabled: true, risk: 'High' },
    { id: 'feature_surge_pricing', name: 'Dynamic Surge Pricing', description: 'Automated price multiplier based on demand.', icon: Zap, enabled: false, risk: 'High' },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadFeatures = async () => {
    try {
      setIsLoading(true)
      const settings = await SettingsService.getSettings()
      
      setFeatures(prev => prev.map(f => {
        const setting = settings.find((s: any) => s.key === f.id)
        return {
          ...f,
          enabled: setting ? setting.value === 'true' : f.enabled
        }
      }))
    } catch (error) {
      console.error('Failed to load features:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFeatures()
  }, [])

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f))
  }

  const commitMutation = useMutation({
    mutationFn: async (currentFeatures: typeof features) => {
      await Promise.all(currentFeatures.map(f => 
        SettingsService.updateSetting(f.id, String(f.enabled))
      ))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Feature flags updated successfully!')
    },
    onError: (error: any) => {
      console.error('Failed to commit features:', error)
      toast.error('Failed to update feature flags.')
    }
  })

  const handleCommit = () => {
    commitMutation.mutate(features)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Feature Management</h1>
          <p className="text-gray-500 mt-1">Kill-switch control for global platform modules and experimental features.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="danger" className="animate-pulse">Production Environment</Badge>
          <Button 
            size="sm" 
            className="bg-primary"
            onClick={handleCommit}
            disabled={commitMutation.isPending || isLoading}
          >
            <Save className="w-4 h-4 mr-2" /> {commitMutation.isPending ? 'COMMITTING...' : 'Commit Changes'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {features.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn(
                   "p-6 transition-all duration-500",
                   feature.enabled ? "bg-white border-black/10 shadow-sm shadow-black/5" : "bg-gray-50/50 border-black/5 opacity-60"
                )}>
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                       feature.enabled ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
                    )}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <button 
                      onClick={() => toggleFeature(feature.id)}
                      className="transition-transform active:scale-90"
                    >
                      {feature.enabled ? (
                        <ToggleRight className="w-10 h-10 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-200" />
                      )}
                    </button>
                  </div>

                  <div className="mb-6">
                     <h3 className={cn("text-lg font-bold mb-1 transition-colors", feature.enabled ? "text-gray-900" : "text-gray-400")}>
                        {feature.name}
                     </h3>
                     <p className="text-xs text-gray-500 leading-relaxed min-h-[32px]">{feature.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-black/5">
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stability Risk:</span>
                        <span className={cn(
                           "text-[10px] font-black uppercase tracking-widest",
                           feature.risk === 'High' ? "text-red-500" : feature.risk === 'Medium' ? "text-amber-500" : "text-emerald-500"
                        )}>{feature.risk}</span>
                     </div>
                     {feature.enabled && (
                        <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                        </div>
                     )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Critical Warning */}
      <div className="p-8 rounded-[40px] bg-red-50 border border-red-100 flex flex-col md:flex-row items-center gap-8">
         <div className="w-16 h-16 rounded-[24px] bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-8 h-8 text-red-500" />
         </div>
         <div className="flex-1">
            <h3 className="text-lg font-bold text-red-600 mb-2">Global Kill-Switch Notice</h3>
            <p className="text-sm text-red-400 leading-relaxed max-w-2xl">
               Disabling core features like 'Standard Ride-Hailing' or 'Digital Wallet' will immediately impact all active users globally. 
               This action is logged in the system audit trail with your Admin ID and timestamp.
            </p>
         </div>
         <Button variant="danger" className="h-12 px-8 font-black italic tracking-widest">SYSTEM RESET</Button>
      </div>
    </div>
  )
}
