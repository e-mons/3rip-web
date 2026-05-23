'use client'

import React, { useEffect, useState } from 'react'
import { Languages, Globe, Coins, DollarSign, Save, RefreshCw, CheckCircle2, ChevronRight, HelpCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input, Modal } from '@/components/ui'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SettingsService } from '@/lib/services/settings-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function SystemSettingsPage() {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    default_language: 'en-US',
    primary_currency: 'USD',
    system_timezone: '(UTC+04:00) Abu Dhabi, Muscat'
  })
  const [languages, setLanguages] = useState<any[]>([])
  const [currencies, setCurrencies] = useState<any[]>([])
  const [isLangModalOpen, setIsLangModalOpen] = useState(false)
  const [isCurrModalOpen, setIsCurrModalOpen] = useState(false)
  const [newLang, setNewLang] = useState({ name: '', code: '', status: 'Draft', progress: 0 })
  const [newCurr, setNewCurr] = useState({ code: '', name: '', rate: 1, enabled: true })

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await SettingsService.getSettings()
      
      const supportedLangsObj = data.find((s: any) => s.key === 'supported_languages')?.value
      const langsList = supportedLangsObj?.languages || [
        { id: '1', name: 'English (US)', code: 'en-US', status: 'Primary', progress: 100 },
        { id: '2', name: 'Arabic (UAE)', code: 'ar-AE', status: 'Published', progress: 98 }
      ]
      
      const primaryLang = langsList.find((l: any) => l.status?.toLowerCase() === 'primary')?.code || 'en-US'
      
      const supportedCurrsObj = data.find((s: any) => s.key === 'supported_currencies')?.value
      const primaryCurr = supportedCurrsObj?.primary || 'USD'
      const currsList = supportedCurrsObj?.currencies || [
        { id: '1', code: 'AED', name: 'Dirham', rate: 3.67, enabled: true },
        { id: '2', code: 'EUR', name: 'Euro', rate: 0.92, enabled: true }
      ]

      const defaultTimezoneObj = data.find((s: any) => s.key === 'default_timezone')?.value
      const timezone = defaultTimezoneObj?.timezone || 'Asia/Dubai'
      
      let systemTimezone = '(UTC+04:00) Abu Dhabi, Muscat'
      if (timezone === 'Europe/London') systemTimezone = '(UTC+00:00) London, Lisbon'
      else if (timezone === 'America/New_York') systemTimezone = '(UTC-05:00) Eastern Time (US & Canada)'

      setFormData({
        default_language: primaryLang,
        primary_currency: primaryCurr,
        system_timezone: systemTimezone
      })

      setLanguages(langsList)
      setCurrencies(currsList)
    } catch (error) {
      console.error('Failed to load system settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const updatedLangs = languages.map(lang => ({
        ...lang,
        status: lang.code === data.default_language ? 'Primary' : (lang.status === 'Primary' ? 'Published' : lang.status)
      }))

      const updatedCurrs = {
        primary: data.primary_currency,
        currencies: currencies
      }

      let offset = '+04:00'
      let timezone = 'Asia/Dubai'
      if (data.system_timezone.includes('London')) {
        offset = '+00:00'
        timezone = 'Europe/London'
      } else if (data.system_timezone.includes('Eastern Time')) {
        offset = '-05:00'
        timezone = 'America/New_York'
      } else if (data.system_timezone.includes('West Africa Time')) {
        offset = '+01:00'
        timezone = 'Africa/Lagos'
      } else if (data.system_timezone.includes('Central Africa Time')) {
        offset = '+02:00'
        timezone = 'Africa/Cairo'
      }

      await Promise.all([
        SettingsService.updateSetting('supported_languages', { languages: updatedLangs }),
        SettingsService.updateSetting('supported_currencies', updatedCurrs),
        SettingsService.updateSetting('default_timezone', { offset, timezone })
      ])
    },
    onSuccess: () => {
      toast.success('System configuration saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (error: any) => {
      console.error('Failed to save system settings:', error)
      toast.error('Failed to save system settings.')
    }
  })

  const handleSave = () => {
    saveMutation.mutate(formData)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Localization & Currency</h1>
          <p className="text-gray-500 mt-1">Configure global accessibility, multi-language support and regional currencies.</p>
        </div>
        <Button 
          size="sm" 
          className="px-6 italic font-black tracking-widest shadow-xl shadow-primary/40"
          onClick={handleSave}
          disabled={saveMutation.isPending || isLoading}
        >
          <Save className="w-4 h-4 mr-2" /> {saveMutation.isPending ? 'SAVING...' : 'SAVE SYSTEM CONFIG'}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {/* Language Support */}
         <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <Languages className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Language Management</h3>
               </div>
               <Button variant="secondary" size="sm" onClick={() => setIsLangModalOpen(true)}>+ Add Language</Button>
            </div>

            <div className="space-y-4">
                {languages.map((lang, i) => (
                   <div key={lang.id || i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-black/5 group hover:border-black/10 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-400">
                            {lang.code.split('-')[0].toUpperCase()}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <span className="text-sm font-bold text-gray-900">{lang.name}</span>
                               <Badge variant={lang.status === 'Primary' ? 'success' : lang.status === 'Draft' ? 'warning' : 'info'}>
                                  {lang.status}
                               </Badge>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Localization Progress: {lang.progress}%</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-red-500" onClick={() => setLanguages(languages.filter(l => l.id !== lang.id))}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                   </div>
                ))}
            </div>
         </Card>

         {/* Currency Support */}
         <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                     <Coins className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold">Currency & Exchange</h3>
               </div>
               <Badge variant="success">Auto-Sync Active</Badge>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-white italic">
                        {formData.primary_currency === 'USD' ? '$' : formData.primary_currency}
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Primary Currency</p>
                        <select 
                          className="text-sm font-bold text-gray-900 bg-transparent outline-none cursor-pointer"
                          value={formData.primary_currency}
                          onChange={(e) => setFormData(prev => ({ ...prev, primary_currency: e.target.value }))}
                        >
                          <option value="USD">USD</option>
                          {currencies.filter(c => c.code !== 'USD').map(c => (
                            <option key={c.id || c.code} value={c.code}>{c.code}</option>
                          ))}
                        </select>
                     </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-primary" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currencies.map((curr, i) => (
                    <div key={curr.id || i} className="p-4 bg-gray-50 rounded-2xl border border-black/5 group relative">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 hover:text-red-500"
                         onClick={() => setCurrencies(currencies.filter(c => c.id !== curr.id))}
                       >
                         <Trash2 className="w-3 h-3" />
                       </Button>
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{curr.code} ({curr.name})</span>
                          <Badge variant={curr.enabled ? "info" : "warning"}>{curr.enabled ? 'Enabled' : 'Disabled'}</Badge>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Ex. Rate</span>
                          <span className="text-sm font-black italic text-gray-900">{curr.rate}</span>
                       </div>
                    </div>
                  ))}
               </div>

               <Button variant="secondary" className="w-full h-11 border-dashed border-black/10 text-gray-400" onClick={() => setIsCurrModalOpen(true)}>+ Configure Global Exchange Rates</Button>
            </div>
         </Card>

         {/* Timezone & Date */}
         <Card className="p-8 xl:col-span-2">
            <div className="flex flex-col md:flex-row gap-12 items-center">
               <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-3 text-gray-900">
                     <Globe className="w-5 h-5 text-blue-500" />
                     Default System Timezone
                  </h3>
                  <p className="text-sm text-gray-500">
                     Sets the default reporting timezone for admin dashboard and automated financial statements.
                  </p>
               </div>
               <div className="w-full md:w-auto flex items-center gap-4">
                  <select 
                    className="bg-gray-50 border border-black/5 rounded-2xl px-6 py-3 text-sm font-bold text-gray-900 outline-none w-full md:w-80"
                    value={formData.system_timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_timezone: e.target.value }))}
                  >
                     <option>(UTC+04:00) Abu Dhabi, Muscat</option>
                     <option>(UTC+00:00) London, Lisbon</option>
                     <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                     <option>(UTC+01:00) West Africa Time (Lagos)</option>
                     <option>(UTC+02:00) Central Africa Time</option>
                  </select>
                  <Button variant="secondary" size="icon" className="shrink-0 h-11 w-11"><HelpCircle className="w-5 h-5 text-gray-400" /></Button>
               </div>
            </div>
         </Card>
      </div>

      <Modal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} title="Add Language">
        <div className="space-y-4">
          <Input placeholder="Language Name (e.g. French)" value={newLang.name} onChange={e => setNewLang({...newLang, name: e.target.value})} />
          <Input placeholder="Code (e.g. fr-FR)" value={newLang.code} onChange={e => setNewLang({...newLang, code: e.target.value})} />
          <Button className="w-full" onClick={() => {
            setLanguages([...languages, { ...newLang, id: Date.now().toString() }])
            setIsLangModalOpen(false)
            setNewLang({ name: '', code: '', status: 'Draft', progress: 0 })
          }}>Add Language</Button>
        </div>
      </Modal>

      <Modal isOpen={isCurrModalOpen} onClose={() => setIsCurrModalOpen(false)} title="Add Currency Rate">
        <div className="space-y-4">
          <Input placeholder="Code (e.g. GBP)" value={newCurr.code} onChange={e => setNewCurr({...newCurr, code: e.target.value})} />
          <Input placeholder="Name (e.g. British Pound)" value={newCurr.name} onChange={e => setNewCurr({...newCurr, name: e.target.value})} />
          <Input type="number" step="0.01" placeholder="Exchange Rate" value={newCurr.rate} onChange={e => setNewCurr({...newCurr, rate: Number(e.target.value)})} />
          <Button className="w-full" onClick={() => {
            setCurrencies([...currencies, { ...newCurr, id: Date.now().toString() }])
            setIsCurrModalOpen(false)
            setNewCurr({ code: '', name: '', rate: 1, enabled: true })
          }}>Add Currency</Button>
        </div>
      </Modal>
    </div>
  )
}
