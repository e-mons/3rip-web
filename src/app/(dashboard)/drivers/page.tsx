'use client'

import React, { useState } from 'react'
import { Search, Filter, Download, ShieldCheck, ShieldAlert, Star, CheckCircle2, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Card, Badge, Modal, ConfirmModal, ImageUpload } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DriverService, DriverStatus } from '@/lib/services/driver-service'
import { useLiveRideTracking } from '@/hooks/use-realtime'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { driverSchema, DriverFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { Driver } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function DriversPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  
  const { drivers: onlineDrivers } = useLiveRideTracking()

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ['drivers', activeTab],
    queryFn: () => DriverService.getDrivers(activeTab === 'All' ? undefined : activeTab.toLowerCase())
  })

  // We fetch all drivers for stats to avoid stats changing when changing tabs
  const { data: allDrivers = [] } = useQuery<Driver[]>({
    queryKey: ['drivers', 'all'],
    queryFn: () => DriverService.getDrivers()
  })

  const stats = {
    active: allDrivers.filter((d: Driver) => d.status === 'verified').length,
    pending: allDrivers.filter((d: Driver) => d.status === 'pending_verification').length,
    alerts: allDrivers.filter((d: Driver) => d.status === 'suspended').length
  }

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema) as any,
    defaultValues: {
      image_url: '',
      vehicle_details: {
        make: '',
        model: '',
        color: '',
        plate: ''
      }
    }
  })
  const driverImage = watch('image_url')

  const onboardMutation = useMutation({
    mutationFn: (data: DriverFormData) => DriverService.onboardDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      toast.success('Driver onboarded successfully')
      setIsAddModalOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to onboard driver')
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: DriverStatus }) => 
      DriverService.updateDriverStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      toast.success('Driver status updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => DriverService.deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      toast.success('Driver deleted')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete driver')
    }
  })

  const onSubmit = (data: DriverFormData) => {
    onboardMutation.mutate(data)
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'License', 'Status', 'Rating', 'Trips']
    const csvData = drivers.map(d => [
      `${d.user?.first_name || ''} ${d.user?.last_name || ''}`.trim(),
      d.user?.email,
      d.user?.phone_number,
      d.license_number,
      d.status,
      d.rating,
      d.total_trips
    ])

    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `3rip_fleet_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredDrivers = drivers.filter(driver => {
    const name = `${driver.user?.first_name || ''} ${driver.user?.last_name || ''}`.toLowerCase()
    return name.includes(searchTerm.toLowerCase()) || 
           driver.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Driver Fleet</h1>
          <p className="text-gray-500 mt-1">Monitor driver applications, performance and safety compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export Fleet Data
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            + Onboard Driver
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Verified Drivers', value: stats.active.toLocaleString(), icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Pending Apps', value: stats.pending.toLocaleString(), icon: Clock, color: 'text-amber-500' },
          { label: 'Suspended', value: stats.alerts.toLocaleString(), icon: ShieldAlert, color: 'text-red-500' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="bg-gray-100 p-1 rounded-2xl flex items-center w-full md:w-auto border border-black/5">
          {['All', 'Active', 'Pending_Verification', 'Suspended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none",
                activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name, email or license..." 
            className="pl-12 bg-white border-black/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[400px]">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence>
            {filteredDrivers.map((driver, i) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-6 hover:border-black/10 transition-all group overflow-hidden relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center border border-black/5 overflow-hidden">
                        {driver.user?.image_url ? (
                          <img src={driver.user.image_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-primary italic uppercase">
                            {driver.user?.first_name?.[0] || 'D'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors text-gray-900">
                            {driver.user?.first_name} {driver.user?.last_name}
                          </h3>
                          {driver.status === 'verified' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {driver.status === 'suspended' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={driver.status === 'active' || driver.status === 'verified' ? 'success' : driver.status === 'suspended' ? 'danger' : 'warning'}>
                            {driver.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {onlineDrivers.some((d: Driver) => d.id === driver.id) ? '🟢 ONLINE' : '⚪ OFFLINE'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setDeleteConfirmId(driver.id)} 
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-2xl border border-black/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-gray-900">{driver.rating || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl border border-black/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-xs font-bold text-gray-900 capitalize">{driver.status.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl border border-black/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Rides</p>
                      <p className="text-xs font-bold text-gray-900">{(driver.total_trips || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-black/5">
                    <div className="text-[10px] text-gray-400 font-medium">
                      Joined {new Date(driver.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      {driver.status === 'pending_verification' && (
                        <Button 
                          size="sm" 
                          className="h-9 bg-emerald-600 hover:bg-emerald-500"
                          onClick={() => updateStatusMutation.mutate({ id: driver.id, status: 'active' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Approve
                        </Button>
                      )}
                      {(driver.status === 'active' || driver.status === 'verified') && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-9 text-red-500 hover:bg-red-50"
                          onClick={() => updateStatusMutation.mutate({ id: driver.id, status: 'suspended' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Suspend
                        </Button>
                      )}
                      {driver.status === 'suspended' && (
                        <Button 
                          size="sm" 
                          className="h-9 bg-primary"
                          onClick={() => updateStatusMutation.mutate({ id: driver.id, status: 'active' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Reactivate
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-9"
                        onClick={() => {
                          toast.info(`Driver Audit: ${driver.user?.first_name}`, {
                            description: "Reviewing performance logs and document validity..."
                          })
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!isLoading && filteredDrivers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-400 italic">No drivers found in this category.</p>
          </div>
        )}
      </div>

      {/* Onboard Driver Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          reset()
        }}
        title="Onboard New Driver"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <ImageUpload
            label="Driver Photo"
            bucket="avatars"
            value={driverImage}
            onChange={(url) => setValue('image_url', url)}
            className="mb-4"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">First Name</label>
              <Input 
                {...register('first_name')}
                placeholder="First Name"
              />
              {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Name</label>
              <Input 
                {...register('last_name')}
                placeholder="Last Name"
              />
              {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
            <Input 
              {...register('email')}
              type="email"
              placeholder="driver@example.org"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
            <Input 
              {...register('phone_number')}
              placeholder="+1234567890"
            />
            {errors.phone_number && <p className="text-red-500 text-xs">{errors.phone_number.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Driver License #</label>
            <Input 
              {...register('license_number')}
              placeholder="ABC-123-XYZ"
            />
            {errors.license_number && <p className="text-red-500 text-xs">{errors.license_number.message}</p>}
          </div>

          <div className="border-t border-black/5 pt-4 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Vehicle Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                {...register('vehicle_details.make')}
                placeholder="Make (e.g. Toyota)"
              />
              <Input 
                {...register('vehicle_details.model')}
                placeholder="Model (e.g. Corolla)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                {...register('vehicle_details.color')}
                placeholder="Color"
              />
              <Input 
                {...register('vehicle_details.plate')}
                placeholder="License Plate"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={onboardMutation.isPending}>
              {onboardMutation.isPending ? 'Onboarding...' : 'Onboard Driver'}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteMutation.mutate(deleteConfirmId)
            setDeleteConfirmId(null)
          }
        }}
        isLoading={deleteMutation.isPending}
        title="Delete Driver"
        description="Are you sure you want to permanently remove this driver from the platform? This will also delete their vehicle records."
      />
    </div>
  )
}
