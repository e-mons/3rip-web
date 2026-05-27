'use client'

import React, { useEffect, useState } from 'react'
import { CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, Download, Search, Filter, MoreHorizontal, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input, Modal } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PaymentService } from '@/lib/services/payment-service'
import { SettingsService } from '@/lib/services/settings-service'
import { toast } from 'sonner'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'captured' | 'refunded' | 'failed'>('all')
  const [commissionRate, setCommissionRate] = useState(0.2) // Default 20%
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<any | null>(null)
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [refundReason, setRefundReason] = useState<string>('')
  const [isRefundSubmitLoading, setIsRefundSubmitLoading] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [paymentsData, settings] = await Promise.all([
        PaymentService.getPayments(),
        SettingsService.getSettings()
      ])
      
      setPayments(paymentsData)
      const commSetting = settings.find((s: any) => s.key === 'commission_rate')
      if (commSetting && commSetting.value) {
        const val = typeof commSetting.value === 'string' ? JSON.parse(commSetting.value) : commSetting.value
        if (val && val.percentage !== undefined) {
          setCommissionRate(Number(val.percentage) / 100)
        }
      }
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = {
    totalVolume: payments.filter(p => p.status === 'captured').reduce((acc, p) => acc + Number(p.amount), 0),
    refunds: payments.filter(p => p.status === 'refunded').length,
    refundRate: payments.length ? ((payments.filter(p => p.status === 'refunded').length / payments.length) * 100).toFixed(1) : '0'
  }

  const calculateGrowth = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const thisMonth = payments.filter(p => p.status === 'captured' && new Date(p.created_at) >= thirtyDaysAgo).reduce((acc, p) => acc + Number(p.amount), 0)
    const lastMonth = payments.filter(p => p.status === 'captured' && new Date(p.created_at) >= sixtyDaysAgo && new Date(p.created_at) < thirtyDaysAgo).reduce((acc, p) => acc + Number(p.amount), 0)

    if (lastMonth === 0) return '+100%'
    const growth = ((thisMonth - lastMonth) / lastMonth) * 100
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
  }

  const handleExportCSV = () => {
    const headers = ['Payment ID', 'Booking ID', 'Rider Name', 'Amount', 'Status', 'Date']
    const data = payments.map(p => [
      p.id,
      p.booking_id,
      `${p.rider?.first_name || ''} ${p.rider?.last_name || ''}`.trim(),
      p.amount,
      p.status,
      new Date(p.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...data].map(e => `"${e.join('","')}"`).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `3rip_financial_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const initiateRefund = (payment: any) => {
    setSelectedPaymentForRefund(payment)
    setRefundAmount(payment.amount.toString())
    setRefundReason('Rider cancellation / request')
  }

  const handleRefundSubmit = async () => {
    if (!selectedPaymentForRefund) return
    try {
      setIsRefundSubmitLoading(true)
      await PaymentService.refundPayment(
        selectedPaymentForRefund.id, 
        Number(refundAmount), 
        refundReason
      )
      toast.success('Payment refunded successfully!')
      setSelectedPaymentForRefund(null)
      loadData()
    } catch (error: any) {
      console.error('Failed to refund payment:', error)
      toast.error(error.message || 'Failed to refund payment.')
    } finally {
      setIsRefundSubmitLoading(false)
    }
  }

  const filteredPayments = payments.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const riderName = `${p.rider?.first_name || ''} ${p.rider?.last_name || ''}`.toLowerCase()
    const id = p.id.toLowerCase()
    const matchesSearch = riderName.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Revenue & Payments</h1>
          <p className="text-gray-500 mt-1">Real-time ledger of all platform transactions and income streams.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Financial Report
          </Button>
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-[10px]"
            onClick={() => window.open('https://dashboard.paystack.com/', '_blank')}
          >
            <Wallet className="w-4 h-4 mr-2" /> View Paystack Dashboard
          </Button>
        </div>
      </div>

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 border-none shadow-2xl shadow-primary/20">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
           <div className="relative z-10 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Total Platform Volume</p>
              <h2 className="text-4xl font-black italic mb-6">${stats.totalVolume.toLocaleString()}</h2>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 text-white text-[10px] font-bold">
                    <ArrowUpRight className="w-3 h-3" /> {calculateGrowth()}
                 </div>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Growth vs Last 30 Days</p>
              </div>
           </div>
        </Card>

        <Card className="p-8">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Net Commission ({commissionRate * 100}%)</p>
           <h2 className="text-4xl font-black italic text-emerald-500 mb-6">${(stats.totalVolume * commissionRate).toLocaleString()}</h2>
           <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white" />
                 ))}
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Processing {payments.length} payments</p>
           </div>
        </Card>

        <Card className="p-8">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Refund Rate</p>
           <h2 className="text-4xl font-black italic text-gray-900 mb-6">{stats.refundRate}%</h2>
           <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> Healthy threshold
           </div>
        </Card>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 bg-white p-4 rounded-[32px] border border-black/5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
             <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                   <Input 
                     placeholder="Search rider or txn id..." 
                     className="pl-10 h-10 bg-gray-50 border-black/5 rounded-xl text-xs"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl border border-black/5 overflow-x-auto">
             {[
               { label: 'All', value: 'all' },
               { label: 'Captured', value: 'captured' },
               { label: 'Refunded', value: 'refunded' },
               { label: 'Failed', value: 'failed' }
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

        <Card className="overflow-hidden border-black/5 min-h-[400px]">
           {isLoading ? (
             <div className="flex items-center justify-center py-20">
               <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-black/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                         <th className="px-8 py-5">Transaction ID</th>
                         <th className="px-8 py-5">Participant</th>
                         <th className="px-8 py-5">Amount</th>
                         <th className="px-8 py-5">Method</th>
                         <th className="px-8 py-5">Status</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-black/5">
                      <AnimatePresence>
                        {filteredPayments.map((p, i) => (
                           <motion.tr 
                              key={p.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: i * 0.05 }}
                              className="group hover:bg-gray-50 transition-colors"
                           >
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className={cn(
                                       "w-8 h-8 rounded-lg flex items-center justify-center",
                                       p.status === 'captured' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                       {p.status === 'captured' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>
                                    <div>
                                       <p className="text-xs font-mono font-bold text-gray-900 group-hover:text-primary transition-colors uppercase italic">{p.id.split('-')[0]}</p>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(p.created_at).toLocaleTimeString()}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <p className="text-xs font-bold text-gray-900 mb-0.5">{p.rider?.first_name} {p.rider?.last_name}</p>
                                 <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Rider</p>
                              </td>
                              <td className="px-8 py-5">
                                 <span className={cn(
                                    "text-sm font-black italic",
                                    p.status === 'captured' ? "text-gray-900" : "text-red-500"
                                 )}>${Number(p.amount).toLocaleString()}</span>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 capitalize">{p.payment_method?.replace('_', ' ') || 'card'}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <Badge variant={
                                    p.status === 'captured' ? 'success' : 
                                    p.status === 'refunded' ? 'info' : 'danger'
                                 }>
                                    {p.status}
                                 </Badge>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 {p.status === 'captured' ? (
                                    <Button 
                                       variant="secondary" 
                                       size="sm" 
                                       className="h-8 text-[10px] font-black tracking-widest uppercase hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                       onClick={() => initiateRefund(p)}
                                    >
                                       Refund
                                    </Button>
                                 ) : (
                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl" disabled>
                                       <MoreHorizontal className="w-4 h-4 text-gray-300" />
                                    </Button>
                                 )}
                              </td>
                           </motion.tr>
                        ))}
                      </AnimatePresence>
                   </tbody>
                </table>
                {!isLoading && filteredPayments.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-gray-400 italic">No transactions found matching your search.</p>
                  </div>
                )}
             </div>
           )}
         </Card>
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={!!selectedPaymentForRefund}
        onClose={() => setSelectedPaymentForRefund(null)}
        title="Refund Transaction"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 text-xs leading-relaxed italic">
            You are about to refund transaction <strong className="font-mono font-bold">{selectedPaymentForRefund?.id.split('-')[0].toUpperCase()}</strong>. This will instantly initiate a payout back to the rider's bank account via Paystack and update the ledger. This action is irreversible.
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Refund Amount ($)</label>
            <Input 
              type="number"
              step="0.01"
              max={selectedPaymentForRefund?.amount}
              className="bg-gray-50 border-black/5 font-black italic text-lg"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
            <p className="text-[10px] text-gray-400">Maximum refundable amount is ${selectedPaymentForRefund?.amount}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reason for Refund</label>
            <Input 
              placeholder="e.g. Booking cancelled, rider double-charged"
              className="bg-gray-50 border-black/5 font-bold"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="secondary" 
              className="flex-1 font-black italic tracking-widest uppercase"
              onClick={() => setSelectedPaymentForRefund(null)}
              disabled={isRefundSubmitLoading}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black italic tracking-widest uppercase"
              onClick={handleRefundSubmit}
              disabled={isRefundSubmitLoading || !refundAmount || Number(refundAmount) <= 0 || Number(refundAmount) > Number(selectedPaymentForRefund?.amount)}
            >
              {isRefundSubmitLoading ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
