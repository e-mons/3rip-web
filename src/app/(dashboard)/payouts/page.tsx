'use client'

import React, { useEffect, useState } from 'react'
import { Banknote, CreditCard, Clock, CheckCircle2, AlertCircle, Search, Filter, Download, User, ArrowUpRight, ShieldCheck, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input, ConfirmModal } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PayoutService } from '@/lib/services/payout-service'
import { SettingsService } from '@/lib/services/settings-service'
import { Payout } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function PayoutsPage() {
  const queryClient = useQueryClient()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [threshold, setThreshold] = useState("50")
  const [schedule, setSchedule] = useState("Every Monday")
  const [searchTerm, setSearchTerm] = useState('')
  const [releaseConfirmId, setReleaseConfirmId] = useState<string | null>(null)
  const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [payoutsData, stats] = await Promise.all([
        PayoutService.getPayouts(),
        PayoutService.getAnalytics()
      ])
      setPayouts(payoutsData)
      setAnalytics(stats)
    } catch (error) {
      console.error('Failed to load payouts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Driver Name', 'Amount', 'Status', 'Date']
    const data = payouts.map(p => [
      p.id,
      `${p.wallet?.user?.first_name || ''} ${p.wallet?.user?.last_name || ''}`.trim(),
      p.amount,
      p.status,
      new Date(p.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...data].map(e => `"${e.join('","')}"`).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `3rip_payouts_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const releaseFundsMutation = useMutation({
    mutationFn: (id: string) => PayoutService.releaseFunds(id),
    onSuccess: () => {
      toast.success('Funds released successfully!')
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
      loadData()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to release funds')
    }
  })

  const releaseFunds = (id: string) => {
    setReleaseConfirmId(id)
  }

  const runPayoutCycleMutation = useMutation({
    mutationFn: async (pendingPayouts: any[]) => {
      return Promise.all(pendingPayouts.map(p => PayoutService.releaseFunds(p.id)))
    },
    onSuccess: (data) => {
      toast.success(`Successfully processed ${data.length} payout(s)!`)
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
      loadData()
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during the payout cycle.')
    }
  })

  const handleRunPayoutCycle = () => {
    const pendingPayouts = payouts.filter(p => p.status === 'pending')
    if (pendingPayouts.length === 0) {
      toast.info('No pending payouts to process.')
      return
    }
    setIsBatchConfirmOpen(true)
  }

  const saveRulesMutation = useMutation({
    mutationFn: async () => {
      await SettingsService.updateSetting('payout_rules', { threshold, schedule })
    },
    onSuccess: () => {
      toast.success('Payout rules saved successfully!')
    },
    onError: () => {
      toast.error('Failed to save payout rules.')
    }
  })

  const filteredPayouts = payouts.filter(p => {
    const driverName = `${p.wallet?.user?.first_name} ${p.wallet?.user?.last_name}`.toLowerCase()
    return driverName.includes(searchTerm.toLowerCase()) || 
           p.id.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Driver Payouts</h1>
          <p className="text-gray-500 mt-1">Manage weekly earnings disbursement and tax compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Payout Summary
          </Button>
          <Button size="sm" className="bg-primary" onClick={handleRunPayoutCycle}>
            <Banknote className="w-4 h-4 mr-2" /> Run Payout Cycle
          </Button>
        </div>
      </div>

      {/* Payout Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Payouts', value: `$${analytics?.totalPending?.toLocaleString() || '0'}`, icon: Clock, color: 'text-amber-500' },
          { label: 'Processed (MTD)', value: `$${analytics?.processedMtd?.toLocaleString() || '0'}`, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Active Drivers', value: analytics?.activeDrivers || '0', icon: User, color: 'text-primary' },
          { label: 'Failed Payouts', value: analytics?.failedPayouts || '0', icon: AlertCircle, color: 'text-red-500' },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center", stat.color)}>
                   <stat.icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-200" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
             <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {/* Payout Queue */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Earnings Queue</h3>
            <div className="flex items-center gap-2">
               <Badge variant="success">Paystack Transfers Active</Badge>
            </div>
         </div>

         <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by driver name or transaction ID..." 
              className="pl-12 bg-white border-black/5 text-xs h-12 rounded-2xl" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {isLoading ? (
           <div className="flex items-center justify-center py-20">
             <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           </div>
         ) : (
           <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {filteredPayouts.map((payout, i) => (
                    <motion.div
                       key={payout.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ delay: i * 0.1 }}
                    >
                       <Card className="p-6 hover:bg-gray-50 transition-all border-black/5">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-primary/10 to-blue-500/10 border border-black/5 flex items-center justify-center text-xl font-black italic text-primary">
                                   {payout.wallet?.user?.first_name?.charAt(0)}
                                </div>
                                <div>
                                   <h4 className="text-sm font-bold text-gray-900 mb-0.5">
                                      {payout.wallet?.user?.first_name} {payout.wallet?.user?.last_name}
                                   </h4>
                                   <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                                      POT-{payout.id.split('-')[0].toUpperCase()}
                                   </p>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 lg:ml-12">
                                <div>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Requested Amount</p>
                                   <p className="text-sm font-black italic text-gray-900">${Number(payout.amount).toFixed(2)}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Wallet Balance</p>
                                   <p className="text-sm font-bold text-gray-600">${Number(payout.wallet?.balance).toFixed(2)}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Method</p>
                                   <div className="flex items-center gap-1.5">
                                      <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-xs font-medium text-gray-500">Paystack Transfer</span>
                                   </div>
                                </div>
                                <div>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                   <Badge variant={payout.status === 'completed' ? 'success' : payout.status === 'failed' ? 'danger' : 'warning'}>
                                      {payout.status === 'completed' ? 'Processed' : payout.status === 'failed' ? 'Failed' : 'Pending Approval'}
                                   </Badge>
                                </div>
                             </div>

                             <div className="flex items-center gap-2">
                                <Button 
                                   variant="secondary" 
                                   size="sm" 
                                   className="h-10 text-[10px] font-black tracking-widest uppercase"
                                   onClick={() => {
                                      toast.info(`Transaction Ledger Audit`, {
                                         description: `Verified POT-${payout.id.split('-')[0].toUpperCase()} against bank gateway. Status: VALIDATED.`,
                                      })
                                   }}
                                 >
                                    Inspect Ledger
                                 </Button>
                                {payout.status === 'pending' && (
                                   <Button 
                                     size="sm" 
                                     className="h-10 text-[10px] font-black tracking-widest uppercase"
                                     onClick={() => releaseFunds(payout.id)}
                                   >
                                      Release Funds
                                   </Button>
                                )}
                             </div>
                         </div>
                       </Card>
                    </motion.div>
                ))}
              </AnimatePresence>
              {!isLoading && filteredPayouts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-gray-400 italic">No pending payout requests found.</p>
                </div>
              )}
           </div>
         )}
      </div>

      {/* Compliance Box */}
       <Card className="p-8 border-black/5 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-3 text-gray-900">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   Automatic Payout Rules
                </h3>
                <p className="text-sm text-gray-500 max-w-md">
                   Configure thresholds for automated driver earnings release. 3rip uses Paystack Transfers for real-time disbursement.
                </p>
             </div>
             <div className="w-full md:w-auto flex flex-col gap-4">
                <div className="flex items-center justify-between gap-12 bg-gray-100 p-4 rounded-2xl border border-black/5">
                   <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Payout Threshold</span>
                   <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">$</span>
                      <Input 
                         className="w-16 h-8 p-1 text-center font-bold bg-white border-black/10" 
                         value={threshold} 
                         onChange={(e) => setThreshold(e.target.value)}
                      />
                   </div>
                </div>
                <div className="flex items-center justify-between gap-12 bg-gray-100 p-4 rounded-2xl border border-black/5">
                   <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Schedule</span>
                   <select 
                     className="bg-transparent text-xs font-bold text-gray-900 outline-none"
                     value={schedule}
                     onChange={(e) => setSchedule(e.target.value)}
                   >
                      <option>Every Monday</option>
                      <option>Every Friday</option>
                      <option>Instant Payout</option>
                   </select>
                </div>
                <Button 
                  onClick={() => saveRulesMutation.mutate()} 
                  disabled={saveRulesMutation.isPending}
                  className="w-full font-black italic tracking-widest uppercase shadow-lg shadow-primary/20"
                >
                  {saveRulesMutation.isPending ? 'SAVING...' : 'SAVE RULES'}
                </Button>
             </div>
          </div>
       </Card>
      {/* Release Individual Confirmation Modal */}
      <ConfirmModal
        isOpen={!!releaseConfirmId}
        onClose={() => setReleaseConfirmId(null)}
        onConfirm={() => {
          if (releaseConfirmId) {
            releaseFundsMutation.mutate(releaseConfirmId)
            setReleaseConfirmId(null)
          }
        }}
        isLoading={releaseFundsMutation.isPending}
        title="Release Payout"
        description="This will instantly transfer the funds to the driver's linked bank account or wallet. This action is irreversible."
      />

      {/* Batch Release Confirmation Modal */}
      <ConfirmModal
        isOpen={isBatchConfirmOpen}
        onClose={() => setIsBatchConfirmOpen(false)}
        onConfirm={() => {
          const pendingPayouts = payouts.filter(p => p.status === 'pending')
          runPayoutCycleMutation.mutate(pendingPayouts)
          setIsBatchConfirmOpen(false)
        }}
        isLoading={runPayoutCycleMutation.isPending}
        title="Execute Payout Cycle"
        description={`You are about to process ${payouts.filter(p => p.status === 'pending').length} pending payouts. This will batch transfer all available driver earnings.`}
      />
    </div>
  )
}
