'use client'

import React, { useState } from 'react'
import { AlertCircle, Gavel, Scale, Clock, CheckCircle2, XCircle, Search, Filter, MoreHorizontal, User, Car, DollarSign, Activity, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input, Modal } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DisputeService } from '@/lib/services/disputes-service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function DisputesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isVerdictModalOpen, setIsVerdictModalOpen] = useState(false)
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null)
  const [verdictType, setVerdictType] = useState<'refunded' | 'upheld' | null>(null)
  const [verdictNotes, setVerdictNotes] = useState('')

  const { data: disputes = [], isLoading: isLoadingDisputes } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => DisputeService.getDisputes()
  })

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['dispute-analytics'],
    queryFn: () => DisputeService.getAnalytics()
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, verdict, notes }: { id: string, verdict: 'refunded' | 'upheld', notes: string }) => 
      DisputeService.resolveDispute(id, verdict, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
      queryClient.invalidateQueries({ queryKey: ['dispute-analytics'] })
      toast.success('Dispute resolved successfully')
      setIsVerdictModalOpen(false)
      setSelectedDisputeId(null)
      setVerdictType(null)
      setVerdictNotes('')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resolve dispute')
    }
  })

  const filteredDisputes = disputes.filter(d => {
    const riderName = `${d.rider?.first_name} ${d.rider?.last_name}`.toLowerCase()
    const driverName = `${d.driver?.users?.first_name} ${d.driver?.users?.last_name}`.toLowerCase()
    return riderName.includes(searchTerm.toLowerCase()) || 
           driverName.includes(searchTerm.toLowerCase()) || 
           d.id.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleResolveClick = (id: string, verdict: 'refunded' | 'upheld') => {
    setSelectedDisputeId(id)
    setVerdictType(verdict)
    setIsVerdictModalOpen(true)
  }

  const handleVerdictSubmit = () => {
    if (!selectedDisputeId || !verdictType) return
    if (!verdictNotes.trim()) {
      toast.error('Please provide verdict notes')
      return
    }
    resolveMutation.mutate({ id: selectedDisputeId, verdict: verdictType, notes: verdictNotes })
  }

  const isLoading = isLoadingDisputes || isLoadingAnalytics

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic text-gray-900 uppercase">Resolution Center</h1>
          <p className="text-gray-500 font-medium mt-1">Arbitrate rider-driver conflicts and process refunds.</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <Card className="p-4 bg-gray-50 border-black/5 min-w-[160px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Open Tickets</p>
            <p className="text-2xl font-black italic text-gray-900">{analytics?.pending || 0}</p>
          </Card>
          <Card className="p-4 bg-emerald-50 border-emerald-100 min-w-[160px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Resolved (MTD)</p>
            <p className="text-2xl font-black italic text-emerald-600">{analytics?.resolvedMtd || 0}</p>
          </Card>
          <Card className="p-4 bg-red-50 border-red-100 min-w-[160px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">Total Disputed</p>
            <p className="text-2xl font-black italic text-red-600">${analytics?.totalAmount?.toFixed(2) || '0.00'}</p>
          </Card>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[32px] border border-black/5 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by ID, rider or driver..." 
            className="pl-12 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" className="gap-2 h-12 px-6 rounded-2xl flex-1 md:flex-none">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="gap-2 h-12 px-6 rounded-2xl flex-1 md:flex-none bg-black text-white hover:bg-black/80">
             Export Log
          </Button>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Scanning Disputes...</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredDisputes.map((dispute, i) => (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group hover:border-primary/20 transition-all overflow-visible">
                  <div className="p-6">
                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex gap-6">
                           <div className={cn(
                             "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0",
                             dispute.status === 'under_review' ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"
                           )}>
                              {dispute.status === 'under_review' ? <Scale className="w-8 h-8" /> : <Gavel className="w-8 h-8" />}
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-mono font-bold text-primary italic uppercase tracking-widest">
                                  #{dispute.id.split('-')[0].toUpperCase()}
                                </span>
                                <Badge variant={dispute.status === 'under_review' ? 'warning' : 'default'}>
                                  {dispute.status.replace('_', ' ')}
                                </Badge>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {new Date(dispute.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{dispute.reason}</h3>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-700">{dispute.rider?.first_name} {dispute.rider?.last_name}</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase">Rider</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Car className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-700">{dispute.driver?.users?.first_name} {dispute.driver?.users?.last_name}</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase">Driver</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-8 w-full lg:w-auto">
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Disputed Amount</p>
                              <div className="flex items-center justify-end gap-1 text-red-600">
                                 <DollarSign className="w-4 h-4" />
                                 <span className="text-xl font-black italic">{Number(dispute.disputed_amount).toFixed(2)}</span>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              {dispute.status === 'under_review' ? (
                                <>
                                  <Button 
                                    variant="secondary" 
                                    className="h-10 text-[10px] font-black uppercase tracking-widest"
                                    onClick={() => handleResolveClick(dispute.id, 'upheld')}
                                  >
                                    Upheld
                                  </Button>
                                  <Button 
                                    className="h-10 text-[10px] font-black uppercase tracking-widest"
                                    onClick={() => handleResolveClick(dispute.id, 'refunded')}
                                  >
                                    Refund
                                  </Button>
                                </>
                              ) : (
                                <Badge className="h-10 px-6 font-black uppercase tracking-widest opacity-50">
                                   RESOLVED
                                </Badge>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-4">
         <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
         <p className="text-xs text-primary/60 leading-relaxed">
            <span className="font-bold text-primary">Admin Note:</span> Disputes marked as "Resolved" cannot be reopened unless new evidence is provided. 
            All financial refunds are processed through the respective payment gateway and may take up to 5-10 business days to reflect in the rider's bank account.
         </p>
      </div>

      {/* Verdict Modal */}
      <Modal
        isOpen={isVerdictModalOpen}
        onClose={() => setIsVerdictModalOpen(false)}
        title={`Resolve Dispute: ${verdictType === 'upheld' ? 'Uphold Charge' : 'Issue Refund'}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
            <p className="text-xs text-gray-600 leading-relaxed italic">
              {verdictType === 'upheld' 
                ? "You are deciding to uphold the original charge. The funds will remain with the driver/platform." 
                : "You are deciding to refund the rider. The disputed amount will be deducted from the driver's next payout."}
            </p>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Verdict Notes</label>
            <textarea
              className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50 min-h-[100px]"
              placeholder="Provide reasoning for this verdict..."
              value={verdictNotes}
              onChange={(e) => setVerdictNotes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsVerdictModalOpen(false)}>Cancel</Button>
            <Button 
              className="flex-1" 
              onClick={handleVerdictSubmit}
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? 'Processing...' : 'Confirm Verdict'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
