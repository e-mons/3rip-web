'use client'

import React, { useState } from 'react'
import { Search, Filter, Map, List, Navigation, Clock, User, CheckCircle2, XCircle, ArrowUpRight, DollarSign, Car, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input, Modal, ConfirmModal } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBookingUpdates } from '@/hooks/use-realtime'
import { BookingService, CancellationReason } from '@/lib/services/booking-service'
import { UserService } from '@/lib/services/user-service'
import { DriverService } from '@/lib/services/driver-service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema, BookingFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { Booking, User as UserType, Driver } from '@/lib/types'
import MapboxMap from '@/components/shared/MapboxMap'

export default function BookingsPage() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<'list' | 'map'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null)
  
  const { bookings: realtimeBookings } = useBookingUpdates()

  const { data: initialBookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => BookingService.getBookings()
  })

  // Fetch riders and active drivers for manual dispatch modal
  const { data: riders = [] } = useQuery<UserType[]>({
    queryKey: ['users', 'rider'],
    queryFn: () => UserService.getUsers('rider'),
    enabled: isAddModalOpen
  })

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ['drivers', 'active'],
    queryFn: () => DriverService.getDrivers('active'),
    enabled: isAddModalOpen
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      type: 'ride',
      status: 'searching',
      estimated_fare: 0
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: BookingFormData) => BookingService.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking dispatched successfully')
      setIsAddModalOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to dispatch booking')
    }
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason, initiatedBy }: { id: string, reason: CancellationReason, initiatedBy: string }) => 
      BookingService.cancelRide(id, reason, initiatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Ride cancelled successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel ride')
    }
  })

  // Merge initial and realtime bookings
  const allBookings = [...realtimeBookings, ...initialBookings.filter(b => !realtimeBookings.find(rb => rb.id === b.id))]

  const filteredBookings = allBookings.filter(booking => {
    const riderName = `${booking.rider?.first_name || ''} ${booking.rider?.last_name || ''}`.toLowerCase()
    const driverName = booking.driver?.user ? `${booking.driver.user.first_name} ${booking.driver.user.last_name}`.toLowerCase() : 'pending'
    const id = booking.id.toLowerCase()
    
    const matchesSearch = 
      riderName.includes(searchTerm.toLowerCase()) ||
      driverName.includes(searchTerm.toLowerCase()) ||
      id.includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    active: allBookings.filter(b => ['accepted', 'arrived', 'in_progress'].includes(b.status)).length,
    searching: allBookings.filter(b => b.status === 'searching').length,
    completed: allBookings.filter(b => b.status === 'completed').length,
    cancelled: allBookings.filter(b => b.status === 'cancelled').length
  }

  const handleCancel = (id: string) => {
    setCancelConfirmId(id)
  }

  const onSubmit = (data: BookingFormData) => {
    createMutation.mutate(data)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Booking Operations</h1>
          <p className="text-gray-500 mt-1">Monitor live dispatch, ride history and fulfillment metrics.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Manual Dispatch
          </Button>
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-black/5 shadow-inner shadow-black/5">
            <button 
              onClick={() => setView('list')}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all", view === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400")}
            >
              <List className="w-4 h-4" /> List View
            </button>
            <button 
              onClick={() => setView('map')}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all", view === 'map' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400")}
            >
              <Map className="w-4 h-4" /> Live Map
            </button>
          </div>
        </div>
      </div>

      {/* Global Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Rides', value: stats.active, icon: Navigation, color: 'text-primary' },
          { label: 'Searching', value: stats.searching, icon: Clock, color: 'text-amber-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-red-500' },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-200" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {view === 'list' ? (
        <>
          {/* Filters Bar */}
          <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by Booking ID, Rider or Driver..." 
                className="pl-12 bg-gray-50 border-black/5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <select 
                className="bg-gray-50 border border-black/5 rounded-2xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary/50 transition-all appearance-none pr-10 relative cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Searching</option>
                <option>Accepted</option>
                <option>Arrived</option>
                <option>In_Progress</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <Button variant="secondary"><Filter className="w-4 h-4 mr-2" /> More Filters</Button>
            </div>
          </Card>

          {/* Bookings Table */}
          <Card className="overflow-hidden min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">Booking ID</th>
                      <th className="px-8 py-5">Participants</th>
                      <th className="px-8 py-5">Route</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Est. Fare</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    <AnimatePresence>
                      {filteredBookings.map((booking, i) => (
                        <motion.tr 
                          key={booking.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.05 }}
                          className="group hover:bg-gray-100/50 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <span className="text-xs font-mono font-bold text-primary italic uppercase">{booking.id.split('-')[0]}</span>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(booking.created_at).toLocaleTimeString()}</p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-xs font-bold text-gray-900">{booking.rider?.first_name} {booking.rider?.last_name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Car className="w-3 h-3 text-gray-400" />
                                <span className={cn("text-xs font-medium", !booking.driver ? "text-amber-500 italic" : "text-gray-500")}>
                                  {booking.driver?.user ? `${booking.driver.user.first_name} ${booking.driver.user.last_name}` : 'Searching...'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 max-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <p className="text-[10px] text-gray-900 font-bold truncate">{booking.pickup_address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              <p className="text-[10px] text-gray-900 font-bold truncate">{booking.dropoff_address}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <Badge variant={
                              booking.status === 'completed' ? 'success' : 
                              booking.status === 'searching' ? 'warning' :
                              booking.status === 'cancelled' ? 'danger' : 'info'
                            }>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-1 text-emerald-600">
                              <DollarSign className="w-3 h-3" />
                              <span className="text-sm font-black italic">{booking.estimated_fare?.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 text-xs"
                                  onClick={() => {
                                    toast.info(`Booking Audit`, {
                                      description: `Trip ${booking.id.split('-')[0].toUpperCase()} is currently in state: ${booking.status.toUpperCase()}.`
                                    })
                                  }}
                                >
                                  Details
                                </Button>
                               {['searching', 'accepted', 'arrived', 'in_progress'].includes(booking.status) && (
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-8 text-xs text-red-500 hover:bg-red-50"
                                   onClick={() => handleCancel(booking.id)}
                                   disabled={cancelMutation.isPending}
                                 >
                                   Cancel
                                 </Button>
                               )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {!isLoading && filteredBookings.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-gray-400 italic">No bookings found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card className="h-[600px] bg-gray-50 flex items-center justify-center border-black/5 relative overflow-hidden p-0">
          <MapboxMap 
            center={{ lat: 25.2048, lng: 55.2708 }}
            trips={allBookings.filter(b => ['searching', 'accepted', 'arrived', 'in_progress'].includes(b.status))}
            onTripSelect={() => {}}
          />
        </Card>
      )}

      {/* Manual Dispatch Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          reset()
        }}
        title="Manual Dispatch"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Rider</label>
            <select 
              {...register('rider_id')}
              className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-2 text-sm outline-none focus:border-primary/50"
            >
              <option value="">-- Choose Rider --</option>
              {riders.map((r: UserType) => (
                <option key={r.id} value={r.id}>{r.full_name || r.first_name || r.email}</option>
              ))}
            </select>
            {errors.rider_id && <p className="text-red-500 text-xs">{errors.rider_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Driver (Optional)</label>
            <select 
              {...register('driver_id')}
              className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-2 text-sm outline-none focus:border-primary/50"
            >
              <option value="">-- Auto-Assign --</option>
              {drivers.map((d: Driver) => (
                <option key={d.id} value={d.id}>{d.user?.first_name || d.user?.email} ({d.status})</option>
              ))}
            </select>
            {errors.driver_id && <p className="text-red-500 text-xs">{errors.driver_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</label>
              <select 
                {...register('type')}
                className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-2 text-sm outline-none focus:border-primary/50"
              >
                <option value="ride">Ride</option>
                <option value="parcel">Parcel</option>
                <option value="freight">Freight</option>
                <option value="rental">Rental</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Fare ($)</label>
              <Input 
                {...register('estimated_fare', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
              />
              {errors.estimated_fare && <p className="text-red-500 text-xs">{errors.estimated_fare.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup Address</label>
            <Input 
              {...register('pickup_address')}
              placeholder="123 Pickup St" 
            />
            {errors.pickup_address && <p className="text-red-500 text-xs">{errors.pickup_address.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dropoff Address</label>
            <Input 
              {...register('dropoff_address')}
              placeholder="456 Dropoff Ave" 
            />
            {errors.dropoff_address && <p className="text-red-500 text-xs">{errors.dropoff_address.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</label>
            <Input 
              {...register('notes')}
              placeholder="Optional notes for driver..." 
            />
            {errors.notes && <p className="text-red-500 text-xs">{errors.notes.message}</p>}
          </div>

          <div className="pt-4 border-t border-black/5">
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Dispatching...' : 'Dispatch Booking'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!cancelConfirmId}
        onClose={() => setCancelConfirmId(null)}
        onConfirm={() => {
          if (cancelConfirmId) {
            cancelMutation.mutate({ id: cancelConfirmId, reason: 'admin_intervention', initiatedBy: 'Administrator' })
          }
          setCancelConfirmId(null)
        }}
        title="Cancel Ride"
        description="Are you sure you want to cancel this ride? This action cannot be undone and will notify both rider and driver."
        confirmText="Cancel Ride"
        variant="danger"
      />
    </div>
  )
}
