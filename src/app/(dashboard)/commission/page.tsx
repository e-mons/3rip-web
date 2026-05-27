'use client'

import React, { useEffect, useState } from 'react'
import { Settings, Percent, Zap, TrendingUp, Shield, HelpCircle, Save, Info, Sparkles, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input, Switch, Modal, ConfirmModal } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SettingsService } from '@/lib/services/settings-service'
import { AdminService } from '@/lib/services/admin-service'
import { PaymentService } from '@/lib/services/payment-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function CommissionPage() {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [commission, setCommission] = useState({ percentage: 20, min_fee: 1.5 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRule, setNewRule] = useState({
    id: '',
    label: '',
    condition: '',
    multiplier: 1.5,
    active: true
  })
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [data, payments] = await Promise.all([
        SettingsService.getSettings(),
        PaymentService.getPayments().catch(() => [])
      ])
      
      const comm = data.find((s: any) => s.key === 'commission_rate')?.value || { percentage: 20, min_fee: 1.5 }
      const surge = data.find((s: any) => s.key === 'surge_rules')?.value || []
      const strat = data.find((s: any) => s.key === 'pricing_strategy')?.value || { ai_enabled: true, target_margin: 15, max_multiplier: 2.5 }
      if (strat.max_multiplier === undefined) strat.max_multiplier = 2.5
      
      setCommission(comm)
      setSurgeRules(Array.isArray(surge) ? surge : JSON.parse(surge as any))
      setStrategy(strat)

      // Calculate dynamic ARPU
      const capturedPayments = payments.filter((p: any) => p.status === 'captured')
      const totalVolume = capturedPayments.reduce((acc: number, p: any) => acc + Number(p.amount), 0)
      const uniqueRiders = new Set(capturedPayments.map((p: any) => p.rider_id)).size
      const calculatedArpu = uniqueRiders > 0 ? (totalVolume / uniqueRiders) : 42.10
      setArpu(calculatedArpu)
    } catch (error) {
      console.error('Failed to load pricing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [surgeRules, setSurgeRules] = useState<any[]>([])
  const [strategy, setStrategy] = useState({ ai_enabled: true, target_margin: 15, max_multiplier: 2.5 })
  const [arpu, setArpu] = useState<number>(42.10)

  useEffect(() => {
    loadData()
  }, [])

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        SettingsService.updateSetting('commission_rate', commission),
        SettingsService.updateSetting('surge_rules', surgeRules),
        SettingsService.updateSetting('pricing_strategy', strategy)
      ])
      
      await AdminService.logAction('UPDATE', 'system_settings', null, {
        action: 'pricing_update',
        commission,
        surge_rules_count: surgeRules.length,
        ai_enabled: strategy.ai_enabled
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Pricing architecture updated and published to grid.')
    },
    onError: (error: any) => {
      console.error('Failed to publish changes:', error)
      toast.error('Failed to publish changes.')
    }
  })

  const handleSave = () => {
    saveMutation.mutate()
  }

  const toggleRule = (id: string) => {
    setSurgeRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  const handleAddRule = () => {
    const ruleToAdd = { ...newRule, id: Date.now().toString() }
    setSurgeRules(prev => [...prev, ruleToAdd])
    setIsModalOpen(false)
    setNewRule({
      id: '',
      label: '',
      condition: '',
      multiplier: 1.5,
      active: true
    })
  }

  const deleteRule = (id: string) => {
    setDeleteRuleId(id)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase italic">Pricing Engine</h1>
          <p className="text-gray-500 mt-1">Configure platform economy, dynamic surge rules, and AI pricing models.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" onClick={loadData} disabled={isLoading}>RESET</Button>
           <Button 
             className="px-6 italic font-black tracking-widest shadow-xl shadow-primary/40"
             onClick={handleSave}
             disabled={saveMutation.isPending || isLoading}
           >
             <Save className="w-4 h-4 mr-2" /> {saveMutation.isPending ? 'PUBLISHING...' : 'PUBLISH CHANGES'}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Main Settings */}
         <div className="xl:col-span-2 space-y-8">
            {/* AI Strategy Card */}
            <Card className="p-8 bg-primary/5 border-primary/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Sparkles className="w-16 h-16 text-primary" />
               </div>
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <TrendingUp className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-900">AI-Powered Dynamic Pricing</h3>
                        <p className="text-xs text-gray-500">Autonomous adjustment based on real-time grid density.</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/50 p-2 rounded-2xl border border-black/5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Engine Status</span>
                     <Switch 
                        checked={strategy.ai_enabled}
                        onCheckedChange={(val) => setStrategy(prev => ({ ...prev, ai_enabled: val }))}
                     />
                  </div>
               </div>
            </Card>

            <Card className="p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <Percent className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Standard Commission Architecture</h3>
               </div>

               {isLoading ? (
                 <div className="flex items-center justify-center py-10">
                   <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Platform Commission</label>
                       <div className="relative">
                          <Input 
                            className="pl-6 h-12 text-lg font-black italic bg-gray-50 border-black/5 text-gray-900" 
                            type="number"
                            value={commission.percentage}
                            onChange={(e) => setCommission(prev => ({ ...prev, percentage: Number(e.target.value) }))}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Min Service Fee</label>
                       <div className="relative">
                          <Input 
                            className="pl-6 h-12 text-lg font-black italic bg-gray-50 border-black/5 text-gray-900" 
                            type="number"
                            value={commission.min_fee}
                            onChange={(e) => setCommission(prev => ({ ...prev, min_fee: Number(e.target.value) }))}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                       </div>
                    </div>
                 </div>
               )}
            </Card>

            <Card className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-amber-500" />
                     </div>
                     <h3 className="text-lg font-bold">Manual Surge Multipliers</h3>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-[10px] font-black tracking-widest uppercase"
                    onClick={() => setIsModalOpen(true)}
                  >
                    + Add Rule
                  </Button>
               </div>

                <div className="space-y-4">
                   {surgeRules.map((rule, i) => (
                     <div key={rule.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-black/5 group hover:border-black/10 transition-all">
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                             rule.active ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-200 text-gray-400"
                           )}>
                              <Zap className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900">{rule.label}</p>
                              <code className="text-[9px] text-gray-400 font-mono uppercase tracking-tighter bg-black/5 px-1.5 py-0.5 rounded">
                                 IF {rule.condition}
                              </code>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Multiplier</p>
                              <span className="text-lg font-black italic text-primary">x{rule.multiplier}</span>
                           </div>
                           <Switch 
                              checked={rule.active}
                              onCheckedChange={() => toggleRule(rule.id)}
                           />
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-gray-400 hover:text-red-500"
                             onClick={() => deleteRule(rule.id)}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
         </div>

         {/* Sidebar */}
         <div className="space-y-8">
            <Card className="p-8 border-emerald-100 bg-emerald-50/30">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                     <Info className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-900">Platform Economy Info</h4>
               </div>
               <div className="space-y-4">
                  <div className="p-4 bg-white/50 rounded-xl border border-emerald-100">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Projected ARPU</p>
                     <p className="text-2xl font-black italic text-emerald-900">${arpu.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-xl border border-emerald-100">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Driver Payout Ratio</p>
                     <p className="text-2xl font-black italic text-emerald-900">{(100 - commission.percentage)}%</p>
                  </div>
               </div>
            </Card>

            <Card className="p-8 border-amber-100 bg-amber-50/30">
               <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tighter">Guardrails Active</h4>
               </div>
               <div className="space-y-4">
                  <p className="text-xs text-amber-700 leading-relaxed italic font-medium">
                     The AI pricing engine is restricted from exceeding the maximum price multiplier to prevent extreme price shocks to riders.
                  </p>
                  <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-amber-100">
                     <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Max Multiplier</span>
                     <div className="flex items-center gap-1.5">
                        <Input 
                           type="number"
                           step="0.1"
                           className="w-16 h-8 p-1 text-center font-bold bg-white border-amber-200 text-xs text-amber-900 focus:border-amber-500" 
                           value={strategy.max_multiplier} 
                           onChange={(e) => setStrategy(prev => ({ ...prev, max_multiplier: Number(e.target.value) }))}
                        />
                        <span className="text-xs font-bold text-amber-800">x</span>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      </div>

      {/* Add Surge Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Surge Pricing Rule"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rule Label</label>
            <Input 
              placeholder="e.g. New Year's Eve Rush" 
              className="bg-gray-50 border-black/5 font-bold"
              value={newRule.label}
              onChange={(e) => setNewRule(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Condition (Description)</label>
            <Input 
              placeholder="e.g. Demand > 2x Grid Capacity" 
              className="bg-gray-50 border-black/5"
              value={newRule.condition}
              onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price Multiplier</label>
            <div className="relative">
              <Input 
                type="number" 
                step="0.1"
                className="bg-gray-50 border-black/5 font-black italic text-lg"
                value={newRule.multiplier}
                onChange={(e) => setNewRule(prev => ({ ...prev, multiplier: Number(e.target.value) }))}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">x</span>
            </div>
          </div>

          <Button 
            className="w-full h-12 italic font-black tracking-widest uppercase mt-4"
            onClick={handleAddRule}
            disabled={!newRule.label || !newRule.condition}
          >
            ADD SURGE RULE
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteRuleId}
        onClose={() => setDeleteRuleId(null)}
        onConfirm={() => {
          if (deleteRuleId) {
            setSurgeRules(prev => prev.filter(r => r.id !== deleteRuleId))
          }
          setDeleteRuleId(null)
        }}
        title="Delete Surge Rule"
        description="Are you sure you want to delete this surge pricing rule? This will take effect immediately upon publishing."
        confirmText="Delete Rule"
        variant="danger"
      />
    </div>
  )
}


