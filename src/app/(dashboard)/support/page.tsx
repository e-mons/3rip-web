'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Inbox, MessageSquare, Clock, CheckCircle2, AlertCircle, Search, Filter, MoreHorizontal, User, Send, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SupportService } from '@/lib/services/support-service'
import { useSupportConversation } from '@/hooks/use-realtime'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supportTicketReplySchema, SupportTicketReplyFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const CANNED_TEMPLATES = [
  {
    title: "Greeting & Help",
    text: "Hello! Thank you for reaching out to 3rip support. How can I assist you with your concern today?"
  },
  {
    title: "Refund Processing",
    text: "We have processed a refund for your booking. It should reflect in your bank account or wallet within 3-5 business days depending on your financial institution."
  },
  {
    title: "Waived Fee",
    text: "We apologize for the inconvenience. We have waived the cancellation fee for your ride. The adjusted amount will show in your transaction history shortly."
  },
  {
    title: "Driver Investigation",
    text: "Thank you for sharing your feedback. We take user experience very seriously. We have flagged this driver and initiated an internal investigation into the behavior reported."
  },
  {
    title: "Request Details",
    text: "To help us investigate this issue further, could you please provide more details, screenshots, or any screenshots of the payment confirmation?"
  }
]

export default function SupportTicketsPage() {
  const queryClient = useQueryClient()
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['support_tickets'],
    queryFn: () => SupportService.getTickets()
  })

  const { data: currentUser } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  const activeTicket = tickets.find((t: any) => t.id === selectedTicket?.id) || selectedTicket

  // Auto-select first ticket if none selected and tickets exist
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0])
    }
  }, [tickets, selectedTicket])

  const { messages: realtimeMessages } = useSupportConversation(selectedTicket?.id)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [realtimeMessages, selectedTicket])

  const { register, handleSubmit, reset, setValue, formState: { errors, isValid } } = useForm<SupportTicketReplyFormData>({
    resolver: zodResolver(supportTicketReplySchema) as any,
    defaultValues: { content: '' }
  })

  const replyMutation = useMutation({
    mutationFn: (data: SupportTicketReplyFormData) => SupportService.replyToTicket(selectedTicket.id, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] })
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send reply')
    }
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => SupportService.resolveTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] })
      toast.success('Ticket resolved successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resolve ticket')
    }
  })

  const priorityMutation = useMutation({
    mutationFn: ({ ticketId, priority }: { ticketId: string, priority: string }) => 
      SupportService.changePriority(ticketId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] })
      toast.success('Ticket priority updated')
      setIsActionsOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update priority')
    }
  })

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, adminId }: { ticketId: string, adminId: string | null }) => 
      SupportService.assignTicket(ticketId, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] })
      toast.success('Ticket assignment updated')
      setIsActionsOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign ticket')
    }
  })

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string, status: string }) => 
      SupportService.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] })
      toast.success('Ticket status updated')
      setIsActionsOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status')
    }
  })

  const onSubmit = (data: SupportTicketReplyFormData) => {
    if (!selectedTicket) return
    replyMutation.mutate(data)
  }

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' || 
                          (filter === 'Closed' 
                            ? (t.status === 'closed' || t.status === 'resolved')
                            : t.status.toLowerCase() === filter.toLowerCase().replace(' ', '_'))
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.user?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
      {/* Tickets List Sidebar */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
           <h1 className="text-2xl font-bold tracking-tight">Support</h1>
           <Badge variant="info" className="h-6">{tickets.filter(t => t.status === 'open').length} New</Badge>
        </div>
        
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <Input 
             placeholder="Search tickets..." 
             className="pl-12 bg-gray-50 border-black/5 rounded-2xl h-11" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl border border-black/5">
           {['All', 'Open', 'In Progress', 'Closed'].map(t => (
             <button 
               key={t} 
               onClick={() => setFilter(t)}
               className={cn(
                 "flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", 
                 t === filter ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
               )}
             >
                {t}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
           {isLoading ? (
             <div className="flex items-center justify-center py-20">
               <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
             </div>
           ) : (
             <AnimatePresence>
               {filteredTickets.map((ticket, i) => (
                 <motion.div
                   key={ticket.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   onClick={() => setSelectedTicket(ticket)}
                 >
                    <Card className={cn(
                      "p-4 cursor-pointer hover:border-black/10 transition-all group relative overflow-hidden",
                      selectedTicket?.id === ticket.id ? "bg-primary/5 border-primary/20" : "bg-transparent border-black/5"
                    )}>
                      {selectedTicket?.id === ticket.id && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      )}
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-mono font-bold text-primary/60 uppercase">TIC-{ticket.id.split('-')[0]}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className={cn("text-sm font-bold mb-1 line-clamp-1 transition-colors", selectedTicket?.id === ticket.id ? "text-primary" : "text-gray-900")}>
                         {ticket.subject}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center">
                              <User className="w-3 h-3 text-gray-400" />
                           </div>
                           <span className="text-[10px] font-bold text-gray-400">{ticket.user?.first_name} {ticket.user?.last_name}</span>
                        </div>
                        <Badge variant={
                           ticket.priority === 'urgent' ? 'danger' : 
                           ticket.priority === 'high' ? 'warning' : 'info'
                        } className="text-[9px] px-1.5 py-0 capitalize">
                           {ticket.priority}
                        </Badge>
                     </div>
                   </Card>
                 </motion.div>
               ))}
               {filteredTickets.length === 0 && (
                 <div className="py-10 text-center">
                   <p className="text-gray-400 italic text-sm">No tickets found.</p>
                 </div>
               )}
             </AnimatePresence>
           )}
        </div>
      </div>

      {/* Ticket Conversation View */}
      <Card className="flex-1 flex flex-col bg-white border-black/5 overflow-hidden relative">
         {!activeTicket ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
             <div className="w-16 h-16 rounded-[24px] bg-gray-100 flex items-center justify-center mb-4 text-gray-300">
               <Inbox className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Select a ticket</h3>
             <p className="text-gray-500 text-sm max-w-xs">Pick a conversation from the list to start assisting our customers.</p>
           </div>
         ) : (
           <>
              {/* Conversation Header */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center font-bold text-primary text-xl italic uppercase">
                       {activeTicket.user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-gray-900">{activeTicket.subject}</h3>
                       <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-500">From: <span className="text-gray-900 font-bold">{activeTicket.user?.first_name} {activeTicket.user?.last_name}</span></span>
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                          <Badge variant={activeTicket.status === 'closed' || activeTicket.status === 'resolved' ? 'success' : 'info'} className="capitalize">{activeTicket.status.replace('_', ' ')}</Badge>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 relative">
                    {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => resolveMutation.mutate(activeTicket.id)}
                        disabled={resolveMutation.isPending}
                      >
                        {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
                      </Button>
                    )}
                    
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsActionsOpen(!isActionsOpen)}
                        className={cn("text-gray-400 hover:text-gray-900", isActionsOpen && "text-gray-900 bg-gray-100")}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                      
                      {isActionsOpen && (
                        <div className="absolute right-0 top-12 w-56 bg-white border border-black/10 rounded-2xl shadow-2xl p-2 z-50 text-left">
                          <div className="space-y-1">
                            {/* Assignment Action */}
                            {activeTicket.assigned_to !== currentUser?.id ? (
                              <button
                                type="button"
                                onClick={() => assignMutation.mutate({ ticketId: activeTicket.id, adminId: currentUser?.id || null })}
                                disabled={assignMutation.isPending || !currentUser}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                Assign to Me
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => assignMutation.mutate({ ticketId: activeTicket.id, adminId: null })}
                                disabled={assignMutation.isPending}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                Unassign Me
                              </button>
                            )}
                            
                            <div className="h-[1px] bg-black/5 my-1" />
                            
                            {/* Status Actions */}
                            <div className="px-3 py-1 text-[9px] font-black uppercase tracking-wider text-gray-400">Status</div>
                            {['open', 'in_progress', 'resolved', 'closed'].map((statusOption) => (
                              <button
                                key={statusOption}
                                type="button"
                                onClick={() => statusMutation.mutate({ ticketId: activeTicket.id, status: statusOption })}
                                disabled={statusMutation.isPending || activeTicket.status === statusOption}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold capitalize flex items-center justify-between transition-colors",
                                  activeTicket.status === statusOption ? "text-primary bg-primary/5" : "text-gray-700 hover:bg-gray-50"
                                )}
                              >
                                <span>{statusOption.replace('_', ' ')}</span>
                                {activeTicket.status === statusOption && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                              </button>
                            ))}
                            
                            <div className="h-[1px] bg-black/5 my-1" />
                            
                            {/* Priority Actions */}
                            <div className="px-3 py-1 text-[9px] font-black uppercase tracking-wider text-gray-400">Priority</div>
                            {['low', 'medium', 'high', 'urgent'].map((priorityOption) => (
                              <button
                                key={priorityOption}
                                type="button"
                                onClick={() => priorityMutation.mutate({ ticketId: activeTicket.id, priority: priorityOption })}
                                disabled={priorityMutation.isPending || activeTicket.priority === priorityOption}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold capitalize flex items-center justify-between transition-colors",
                                  activeTicket.priority === priorityOption ? "text-primary bg-primary/5" : "text-gray-700 hover:bg-gray-50"
                                )}
                              >
                                <span>{priorityOption}</span>
                                {activeTicket.priority === priorityOption && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
              </div>

               {/* Messages Area */}
               <div 
                 ref={scrollRef}
                 className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-gray-50/50"
               >
                  {/* Original Description */}
                  <div className="flex gap-4 max-w-2xl">
                     <div className="w-8 h-8 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                     </div>
                     <div className="space-y-2">
                        <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-black/5 shadow-sm">
                           <p className="text-sm text-gray-700 leading-relaxed">
                              {activeTicket.description}
                           </p>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{new Date(activeTicket.created_at).toLocaleString()}</span>
                     </div>
                  </div>

                  {realtimeMessages.map((msg: any) => (
                    <div key={msg.id} className={cn("flex gap-4 max-w-2xl", msg.is_admin_reply ? "ml-auto flex-row-reverse text-right" : "")}>
                       <div className={cn("w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center", msg.is_admin_reply ? "bg-primary/20" : "bg-gray-100")}>
                          {msg.is_admin_reply ? <span className="text-[10px] font-black text-primary italic">3R</span> : <User className="w-4 h-4 text-gray-400" />}
                       </div>
                       <div className="space-y-2">
                          <div className={cn("p-4 rounded-2xl border shadow-sm", msg.is_admin_reply ? "bg-primary/10 border-primary/20 rounded-tr-none" : "bg-gray-50 border-black/5 rounded-tl-none")}>
                             <p className="text-sm leading-relaxed text-gray-700">{msg.content}</p>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 block">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Reply Box */}
               <form onSubmit={handleSubmit(onSubmit)} className="p-6 border-t border-black/5 bg-gray-50/50">
                  <div className={cn("bg-white border rounded-[24px] p-2 transition-all shadow-sm", errors.content ? "border-red-500" : "border-black/10 focus-within:border-primary/50")}>
                     <textarea 
                        {...register('content')}
                        placeholder="Type your response here..." 
                        className="w-full bg-transparent border-none outline-none text-sm text-gray-900 p-4 min-h-[100px] resize-none placeholder:text-gray-300"
                        disabled={activeTicket.status === 'closed' || activeTicket.status === 'resolved'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(onSubmit)();
                          }
                        }}
                     />
                     <div className="flex items-center justify-between p-2 border-t border-black/5">
                        <div className="flex gap-2 relative">
                           <Button type="button" variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-gray-400 hover:text-gray-900"><Paperclip className="w-5 h-5" /></Button>
                           <div className="relative">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                                className={cn("w-10 h-10 rounded-xl text-gray-400 hover:text-gray-900", isTemplatesOpen && "text-primary bg-primary/10")}
                              >
                                 <MessageSquare className="w-5 h-5" />
                              </Button>
                              
                              {isTemplatesOpen && (
                                <div className="absolute bottom-12 left-0 w-80 bg-white border border-black/10 rounded-2xl shadow-2xl p-4 z-50 text-left">
                                  <h5 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Canned Templates</h5>
                                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {CANNED_TEMPLATES.map((tmpl, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          setValue('content', tmpl.text, { shouldValidate: true })
                                          setIsTemplatesOpen(false)
                                        }}
                                        className="w-full text-left p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-black/5 transition-all"
                                      >
                                        <p className="text-xs font-bold text-gray-900 mb-0.5">{tmpl.title}</p>
                                        <p className="text-[10px] text-gray-500 line-clamp-1">{tmpl.text}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                           </div>
                        </div>
                        <Button 
                          type="submit"
                          size="sm" 
                          className="h-10 px-6 italic font-black tracking-widest shadow-lg shadow-primary/20"
                          disabled={replyMutation.isPending || !isValid || activeTicket.status === 'closed' || activeTicket.status === 'resolved'}
                        >
                           {replyMutation.isPending ? 'SENDING...' : 'SEND REPLY'} <Send className="w-4 h-4 ml-2" />
                        </Button>
                     </div>
                  </div>
               </form>
           </>
         )}
      </Card>
    </div>
  )
}
