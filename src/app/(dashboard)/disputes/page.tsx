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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all')
  const [expandedDisputeId, setExpandedDisputeId] = useState<string | null>(null)
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

  const filteredDisputes = disputes.filter((d: any) => {
    const matchesStatus = 
      statusFilter === 'all' 
        ? true 
        : statusFilter === 'pending' 
          ? (d.status === 'under_review' || d.status === 'action_required')
          : d.status.startsWith('resolved')

    const riderName = `${d.rider?.first_name || ''} ${d.rider?.last_name || ''}`.toLowerCase()
    const driverName = `${d.driver?.users?.first_name || ''} ${d.driver?.users?.last_name || ''}`.toLowerCase()
    const reasonText = (d.reason || '').toLowerCase()
    const idText = d.id.toLowerCase()
    
    const matchesSearch = riderName.includes(searchTerm.toLowerCase()) || 
                          driverName.includes(searchTerm.toLowerCase()) || 
                          reasonText.includes(searchTerm.toLowerCase()) ||
                          idText.includes(searchTerm.toLowerCase())
                          
    return matchesStatus && matchesSearch
  })

  const exportToCSV = () => {
    if (filteredDisputes.length === 0) {
      toast.error('No disputes to export')
      return
    }
    
    const headers = ['Dispute ID', 'Status', 'Created At', 'Reason', 'Rider', 'Driver', 'Amount', 'Verdict', 'Verdict Notes']
    const rows = filteredDisputes.map((d: any) => [
      d.id,
      d.status,
      new Date(d.created_at).toLocaleString(),
      d.reason || '',
      `${d.rider?.first_name || ''} ${d.rider?.last_name || ''}`,
      `${d.driver?.users?.first_name || ''} ${d.driver?.users?.last_name || ''}`,
      d.disputed_amount,
      d.verdict || '',
      d.verdict_notes || ''
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `disputes_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV log exported successfully')
  }

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

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-[32px] border border-black/5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
            <Button 
              onClick={exportToCSV}
              className="gap-2 h-12 px-6 rounded-2xl flex-1 md:flex-none bg-black text-white hover:bg-black/80 font-black uppercase tracking-widest text-[10px]"
            >
               Export Log
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl border border-black/5 overflow-x-auto">
           {[
             { label: 'All', value: 'all' },
             { label: 'Pending & Review', value: 'pending' },
             { label: 'Resolved', value: 'resolved' }
           ].map(t => (
             <button 
               key={t.value} 
               type="button"
               onClick={() => setStatusFilter(t.value as any)}
               className={cn(
                 "py-2 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap", 
                 t.value === statusFilter ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
               )}
             >
                {t.label}
             </button>
           ))}
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
            {filteredDisputes.map((dispute: any, i) => (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className={cn(
                    "group hover:border-primary/20 transition-all overflow-visible cursor-pointer",
                    expandedDisputeId === dispute.id && "border-primary bg-primary/[0.01]"
                  )}
                  onClick={() => setExpandedDisputeId(expandedDisputeId === dispute.id ? null : dispute.id)}
                >
                  <div className="p-6">
                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex gap-6">
                           <div className={cn(
                             "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 transition-colors",
                             dispute.status === 'under_review' ? "bg-amber-100 text-amber-600" : 
                             dispute.status === 'action_required' ? "bg-red-100 text-red-600" :
                             dispute.status.startsWith('resolved') ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                           )}>
                              {dispute.status.startsWith('resolved') ? <CheckCircle2 className="w-8 h-8" /> :
                               dispute.status === 'action_required' ? <AlertCircle className="w-8 h-8" /> :
                               <Scale className="w-8 h-8" />}
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-mono font-bold text-primary italic uppercase tracking-widest">
                                  #{dispute.id.split('-')[0].toUpperCase()}
                                </span>
                                <Badge variant={
                                  dispute.status === 'under_review' ? 'warning' :
                                  dispute.status === 'action_required' ? 'danger' :
                                  dispute.status.startsWith('resolved') ? 'success' : 'default'
                                }>
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

                        <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-start">
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Disputed Amount</p>
                              <div className="flex items-center justify-end gap-1 text-red-600">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="text-xl font-black italic">{Number(dispute.disputed_amount).toFixed(2)}</span>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              {!dispute.status.startsWith('resolved') ? (
                                <>
                                  <Button 
                                    variant="secondary" 
                                    className="h-10 text-[10px] font-black uppercase tracking-widest"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResolveClick(dispute.id, 'upheld');
                                    }}
                                  >
                                    Upheld
                                  </Button>
                                  <Button 
                                    className="h-10 text-[10px] font-black uppercase tracking-widest"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResolveClick(dispute.id, 'refunded');
                                    }}
                                  >
                                    Refund
                                  </Button>
                                </>
                              ) : (
                                <Badge variant="success" className="h-10 px-6 font-black uppercase tracking-widest opacity-80">
                                   RESOLVED
                                </Badge>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Expanded details timeline */}
                     <AnimatePresence>
                       {expandedDisputeId === dispute.id && (
                         <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="border-t border-black/5 mt-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden text-left"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <div className="space-y-4">
                             <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Dispute Telemetry & Details</h4>
                             <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-black/5">
                               <div>
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Booking Reference</span>
                                 <span className="text-xs font-mono font-bold text-gray-700">
                                   {dispute.booking_id ? `#${dispute.booking_id.split('-')[0].toUpperCase()}` : 'N/A'}
                                 </span>
                               </div>
                               <div>
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Dispute Category</span>
                                 <span className="text-xs font-bold text-gray-700 capitalize">
                                   {dispute.type ? dispute.type.replace('_', ' ') : 'General'}
                                 </span>
                               </div>
                               <div className="col-span-2">
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reason / Details Filed</span>
                                 <span className="text-xs text-gray-600 leading-relaxed">{dispute.reason}</span>
                               </div>
                             </div>
                           </div>

                           <div className="space-y-4">
                             <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Status Timeline & Verdict</h4>
                             <div className="bg-gray-50 p-4 rounded-2xl border border-black/5 space-y-4">
                               {/* Timeline steps */}
                               <div className="flex gap-4">
                                 <div className="flex flex-col items-center">
                                   <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">1</div>
                                   <div className="w-[2px] h-8 bg-primary/20" />
                                 </div>
                                 <div>
                                   <span className="text-[10px] font-bold text-gray-900 block">Dispute Filed</span>
                                   <span className="text-[9px] text-gray-400">{new Date(dispute.created_at).toLocaleString()}</span>
                                 </div>
                               </div>

                               <div className="flex gap-4">
                                 <div className="flex flex-col items-center">
                                   <div className={cn(
                                     "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                                     dispute.status === 'under_review' || dispute.status.startsWith('resolved') 
                                       ? "bg-amber-100 border border-amber-300 text-amber-600" 
                                       : "bg-gray-100 border border-gray-200 text-gray-400"
                                   )}>2</div>
                                   <div className="w-[2px] h-8 bg-gray-200" />
                                 </div>
                                 <div>
                                   <span className="text-[10px] font-bold text-gray-900 block">Under Arbitrator Review</span>
                                   <span className="text-[9px] text-gray-400">
                                     {dispute.status === 'under_review' || dispute.status.startsWith('resolved') ? "Reviewed" : "Pending review"}
                                   </span>
                                 </div>
                               </div>

                               <div className="flex gap-4">
                                 <div className="flex flex-col items-center">
                                   <div className={cn(
                                     "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                                     dispute.status.startsWith('resolved') 
                                       ? "bg-emerald-100 border border-emerald-300 text-emerald-600" 
                                       : "bg-gray-100 border border-gray-200 text-gray-400"
                                   )}>3</div>
                                 </div>
                                 <div>
                                   <span className="text-[10px] font-bold text-gray-900 block">Arbitration Resolved</span>
                                   {dispute.status.startsWith('resolved') ? (
                                     <div className="mt-1 space-y-1">
                                       <span className="text-[9px] text-gray-400 block">
                                         Resolved on: {dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleString() : new Date(dispute.updated_at).toLocaleString()}
                                       </span>
                                       {dispute.verdict && (
                                         <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[8px] font-black uppercase mt-1">
                                           Verdict: {dispute.verdict}
                                         </span>
                                       )}
                                       {dispute.verdict_notes && (
                                         <p className="text-[11px] text-gray-600 bg-white border border-black/5 p-2 rounded-xl mt-1 italic">
                                           "{dispute.verdict_notes}"
                                         </p>
                                       )}
                                     </div>
                                   ) : (
                                     <span className="text-[9px] text-gray-400">Awaiting final decision</span>
                                   )}
                                 </div>
                               </div>
                             </div>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
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
