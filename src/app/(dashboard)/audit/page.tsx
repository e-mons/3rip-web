'use client'

import React, { useEffect, useState } from 'react'
import { Shield, Eye, Lock, Globe, User, Activity, Search, Filter, Download, Terminal, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AdminService } from '@/lib/services/admin-service'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      const data = await AdminService.getAuditLogs()
      setLogs(data)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Admin ID', 'Admin Name', 'Action', 'Target Table', 'Target ID', 'Details']
    const data = logs.map(log => [
      new Date(log.created_at).toISOString(),
      log.admin_id,
      `${log.admin?.first_name || ''} ${log.admin?.last_name || ''}`.trim(),
      log.action,
      log.target_table,
      log.target_id,
      JSON.stringify(log.details || {})
    ])

    const csvContent = [headers, ...data].map(e => `"${e.join('","')}"`).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `3rip_audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredLogs = logs.filter(log => {
    const adminName = `${log.admin?.first_name} ${log.admin?.last_name}`.toLowerCase()
    const action = log.action.toLowerCase()
    const table = log.target_table.toLowerCase()
    return adminName.includes(searchTerm.toLowerCase()) || 
           action.includes(searchTerm.toLowerCase()) || 
           table.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Security & Audit Logs</h1>
          <p className="text-gray-500 mt-1">Immutable trail of every administrative action taken on the 3rip platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export Logs
          </Button>
        </div>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="p-6 bg-emerald-50 border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-500">
               <Shield className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Security</p>
               <h3 className="text-xl font-bold text-gray-900">Hardened</h3>
            </div>
         </Card>
         <Card className="p-6 bg-gray-50 border-black/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Log Retention</p>
               <h3 className="text-xl font-bold text-gray-900">365 Days</h3>
            </div>
         </Card>
         <Card className="p-6 bg-primary/5 border-primary/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
               <Globe className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Audit Logs</p>
               <h3 className="text-xl font-bold text-gray-900">{logs.length} Total Events</h3>
            </div>
         </Card>
      </div>

       {/* Logs Table */}
      <Card className="overflow-hidden min-h-[400px]">
         <div className="p-6 border-b border-black/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50">
            <div className="relative w-full md:w-96">
               <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <Input 
                 placeholder="Filter by admin, action or target..." 
                 className="pl-12 bg-transparent border-black/10 text-xs" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2">
               <Button variant="secondary" size="sm"><Filter className="w-4 h-4 mr-2" /> Severity</Button>
               <Button variant="secondary" size="sm">Last 24 Hours</Button>
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
                       <th className="px-8 py-5">Event ID</th>
                       <th className="px-8 py-5">Administrator</th>
                       <th className="px-8 py-5">Action & Target</th>
                       <th className="px-8 py-5">Timestamp</th>
                       <th className="px-8 py-5 text-right">Details</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-black/5">
                    <AnimatePresence>
                      {filteredLogs.map((log, i) => (
                         <motion.tr 
                            key={log.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group hover:bg-gray-100/50 transition-colors"
                         >
                            <td className="px-8 py-5">
                               <span className="text-xs font-mono font-bold text-primary/60">LOG-{log.id.split('-')[0].toUpperCase()}</span>
                            </td>
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                                     <User className="w-3.5 h-3.5 text-gray-400" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-600">{log.admin?.first_name} {log.admin?.last_name}</span>
                                    <span className="text-[9px] text-gray-400">{log.admin?.email}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-5">
                               <p className="text-xs font-bold text-gray-900 mb-0.5">{log.action}</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Table: {log.target_table}</p>
                            </td>
                            <td className="px-8 py-5">
                               <p className="text-xs font-medium text-gray-600">{new Date(log.created_at).toLocaleString()}</p>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                  <Eye className="w-4 h-4 text-gray-400" />
                               </Button>
                            </td>
                         </motion.tr>
                      ))}
                    </AnimatePresence>
                 </tbody>
              </table>
              {!isLoading && filteredLogs.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-gray-400 italic">No audit logs found.</p>
                </div>
              )}
           </div>
         )}

         {/* Pagination */}
         <div className="px-8 py-6 border-t border-black/5 flex items-center justify-between bg-gray-50">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Showing {filteredLogs.length} events</p>
            <div className="flex items-center gap-2">
               <Button variant="secondary" size="icon" className="w-8 h-8 rounded-lg"><ChevronRight className="w-4 h-4 rotate-180" /></Button>
               <Button variant="secondary" size="icon" className="w-8 h-8 rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
            </div>
         </div>
      </Card>

      {/* Security Tip */}
      <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 flex items-center gap-4">
         <Lock className="w-5 h-5 text-primary shrink-0" />
         <p className="text-xs text-primary/60 font-medium">
            Audit logs are digitally signed and cryptographically hashed. Any tampering attempt will trigger a system-wide security lockdown.
         </p>
      </div>
    </div>
  )
}
