'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Send, Users, Smartphone, Mail, Clock, Search, Filter, Plus, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NotificationService } from '@/lib/services/notification-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'Marketing',
    target: 'all' as 'all' | 'riders' | 'drivers'
  })

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true)
      const data = await NotificationService.getSystemAnnouncements()
      setAnnouncements(data)
    } catch (error) {
      console.error('Failed to load announcements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const broadcastMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await NotificationService.broadcast(
        data.title,
        data.content,
        data.type,
        data.target
      )
    },
    onSuccess: () => {
      setFormData({ title: '', content: '', type: 'Marketing', target: 'all' })
      loadAnnouncements()
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement broadcasted successfully!')
    },
    onError: (error: any) => {
      console.error('Failed to broadcast:', error)
      toast.error('Failed to broadcast announcement.')
    }
  })

  const handleBroadcast = () => {
    if (!formData.title || !formData.content) return
    broadcastMutation.mutate(formData)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">System Announcements</h1>
          <p className="text-gray-500 mt-1">Broadcast messages, push notifications and marketing campaigns.</p>
        </div>
        <Button size="sm" className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Compose Section */}
          <Card className="xl:col-span-1 p-8 h-fit">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-gray-900">
                <Send className="w-5 h-5 text-primary" />
                Quick Broadcast
             </h3>
            <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Target Audience</label>
                   <select 
                     className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none"
                     value={formData.target}
                     onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value as any }))}
                   >
                      <option value="all">All Users (Riders + Drivers)</option>
                      <option value="riders">Riders Only</option>
                      <option value="drivers">Drivers Only</option>
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Announcement Type</label>
                   <select 
                     className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none"
                     value={formData.type}
                     onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                   >
                      <option>Marketing</option>
                      <option>System</option>
                      <option>Regulatory</option>
                      <option>Automated</option>
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Title</label>
                   <Input 
                     placeholder="Enter notification title..." 
                     className="bg-white border-black/5" 
                     value={formData.title}
                     onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Message Body</label>
                   <textarea 
                      placeholder="Type your message here..." 
                      className="w-full bg-gray-50 border border-black/5 rounded-2xl p-4 text-sm text-gray-900 outline-none focus:border-primary/50 min-h-[120px] resize-none"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                   />
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-black/5">
                   <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">Push Notification</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Send to mobile apps</p>
                   </div>
                  <div className="w-10 h-6 bg-primary rounded-full flex items-center px-1 cursor-pointer">
                     <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </div>
               </div>
               <Button 
                 className="w-full h-12 italic font-black tracking-[0.2em]"
                 onClick={handleBroadcast}
                 disabled={broadcastMutation.isPending || !formData.title || !formData.content}
               >
                 {broadcastMutation.isPending ? 'BROADCASTING...' : 'BROADCAST NOW'}
               </Button>
            </div>
          </Card>

         {/* History Section */}
          <Card className="xl:col-span-2 overflow-hidden border-black/5 min-h-[400px]">
             <div className="p-8 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Announcement History</h3>
                <div className="flex items-center gap-2">
                   <Button variant="secondary" size="icon" className="w-9 h-9"><Search className="w-4 h-4" /></Button>
                   <Button variant="secondary" size="icon" className="w-9 h-9"><Filter className="w-4 h-4" /></Button>
                </div>
             </div>
            
             {isLoading ? (
               <div className="flex items-center justify-center py-20">
                 <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
               </div>
             ) : (
               <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-black/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="px-8 py-5">Announcement</th>
                            <th className="px-8 py-5">Target</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Created</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        <AnimatePresence>
                          {announcements.map((note, i) => (
                              <motion.tr 
                                 key={note.id}
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 exit={{ opacity: 0 }}
                                 transition={{ delay: i * 0.05 }}
                                 className="group hover:bg-gray-50 transition-colors"
                              >
                                 <td className="px-8 py-5">
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{note.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 line-clamp-1">{note.content}</p>
                                 </td>
                                 <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                       <Users className="w-3.5 h-3.5 text-gray-400" />
                                       <span className="text-xs font-medium text-gray-600 capitalize">{note.target_audience}</span>
                                    </div>
                                 </td>
                                <td className="px-8 py-5">
                                   <Badge variant={note.status === 'sent' ? 'success' : 'warning'}>
                                      {note.status}
                                   </Badge>
                                </td>
                                <td className="px-8 py-5">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      {new Date(note.created_at).toLocaleDateString()}
                                   </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl"><MoreVertical className="w-4 h-4" /></Button>
                                </td>
                             </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                   </table>
                   {!isLoading && announcements.length === 0 && (
                     <div className="py-20 text-center">
                       <p className="text-gray-400 italic">No announcement history found.</p>
                     </div>
                   )}
               </div>
             )}
          </Card>
      </div>
    </div>
  )
}
