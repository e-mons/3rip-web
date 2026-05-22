'use client'

import React, { useState } from 'react'
import { Map as MapIcon, Navigation, Compass, Shield, Users, Activity, Eye, Phone, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Modal, ConfirmModal } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useLiveTrips, useLiveRideTracking } from '@/hooks/use-realtime'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Booking, Driver } from '@/lib/types'
import { BookingService } from '@/lib/services/booking-service'
import MapboxMap from '@/components/shared/MapboxMap'

// Dubai Center for relative positioning
const MAP_CENTER = { lat: 25.2048, lng: 55.2708 }

export default function TrackingPage() {
  const queryClient = useQueryClient()
  const { trips, isLoading: isLoadingTrips } = useLiveTrips()
  const { drivers } = useLiveRideTracking()
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false)
  const [tripToTerminate, setTripToTerminate] = useState<string | null>(null)

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser()
      return BookingService.cancelRide(id, 'admin_intervention', user?.id || 'admin')
    },
    onSuccess: () => {
      toast.success('Trip terminated successfully')
      setIsTerminateModalOpen(false)
      setTripToTerminate(null)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to terminate trip')
    }
  })

  const handleCancelTripRequest = (id: string) => {
    setTripToTerminate(id)
    setIsTerminateModalOpen(true)
  }

  const confirmTermination = () => {
    if (tripToTerminate) {
      cancelMutation.mutate(tripToTerminate)
    }
  }

  const handleCloseModal = () => {
    setIsTerminateModalOpen(false)
    setTripToTerminate(null)
  }
  
  const selectedTrip = trips.find(t => t.id === selectedTripId)

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Map Area */}
      <div className="flex-1 relative rounded-[40px] overflow-hidden border border-black/5 bg-gray-50">
        <MapboxMap 
          center={MAP_CENTER}
          trips={trips}
          selectedTripId={selectedTripId}
          onTripSelect={setSelectedTripId}
        />
        
        {/* Map UI Overlays */}
        <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
          <Card className="p-3 bg-white/80 backdrop-blur-xl border-black/5 flex items-center gap-4 shadow-lg shadow-black/5">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{drivers.length} Drivers Online</span>
             </div>
             <div className="w-[1px] h-4 bg-black/10" />
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{trips.length} Trips Active</span>
             </div>
          </Card>

          <div className="flex gap-2">
             <Button variant="secondary" size="icon" className="bg-white/80 backdrop-blur-xl border-black/5 rounded-2xl w-10 h-10 shadow-lg shadow-black/5">
                <Compass className="w-4 h-4 text-gray-900" />
             </Button>
             <Button variant="secondary" size="icon" className="bg-white/80 backdrop-blur-xl border-black/5 rounded-2xl w-10 h-10 shadow-lg shadow-black/5">
                <Shield className="w-4 h-4 text-gray-900" />
             </Button>
          </div>
        </div>

        {/* Map Bottom Stats */}
        <AnimatePresence>
          {selectedTrip && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-6 right-6 flex justify-center z-30 pointer-events-none"
            >
              <Card className="p-4 bg-white/90 backdrop-blur-xl border-black/5 w-full max-w-md shadow-2xl shadow-black/20 rounded-[32px] pointer-events-auto">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tighter italic">
                       Trip #{selectedTrip.id.split('-')[0].toUpperCase()}
                    </h4>
                    <Badge className="font-black uppercase tracking-widest text-[9px]">
                       {selectedTrip.status.replace('_', ' ')}
                    </Badge>
                 </div>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold italic">
                       {selectedTrip.driver?.users?.first_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                       <p className="text-xs font-bold text-gray-900">{selectedTrip.driver?.users?.first_name} {selectedTrip.driver?.users?.last_name}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Driver</p>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="secondary" size="icon" className="w-8 h-8 rounded-lg"><Phone className="w-3.5 h-3.5 text-gray-900" /></Button>
                       <Button variant="secondary" size="icon" className="w-8 h-8 rounded-lg"><MessageSquare className="w-3.5 h-3.5 text-gray-900" /></Button>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       <span>Progress</span>
                       <span>{selectedTrip.status === 'in_progress' ? '65%' : 'Arriving'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: selectedTrip.status === 'in_progress' ? '65%' : '15%' }}
                          className="h-full bg-primary" 
                       />
                    </div>
                 </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar List */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Active Trips ({trips.length})</h3>
           
           {isLoadingTrips ? (
             <div className="flex flex-col items-center justify-center py-12 gap-4">
               <Loader2 className="w-6 h-6 text-primary animate-spin" />
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scanning Grid...</p>
             </div>
           ) : (
             <AnimatePresence>
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedTripId(trip.id)}
                  >
                    <Card className={cn(
                      "p-4 hover:border-black/10 transition-all cursor-pointer group relative overflow-hidden",
                      selectedTripId === trip.id && "border-primary bg-primary/5"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold text-primary italic uppercase">
                           #{trip.id.split('-')[0].toUpperCase()}
                        </span>
                        <Badge>
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-400" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-900">{trip.rider?.first_name} {trip.rider?.last_name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                with {trip.driver?.users?.first_name}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Tracking</span>
                         </div>
                         <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-[10px] font-bold text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleCancelTripRequest(trip.id);
                              }}
                            >
                              Terminate
                            </Button>
                         </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
             </AnimatePresence>
           )}

           {!isLoadingTrips && trips.length === 0 && (
             <div className="py-20 text-center">
               <p className="text-gray-400 text-xs italic">No active trips currently in grid.</p>
             </div>
           )}
        </div>

        <Card className="p-6 bg-red-50 border-red-100">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                 <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-red-600">SOS Alerts</h4>
                 <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">0 Active Emergencies</p>
              </div>
           </div>
           <Button 
              variant="danger" 
              className="w-full text-xs h-10 font-black italic tracking-widest shadow-lg shadow-red-200"
              onClick={() => {
                toast.error("EMERGENCY CONSOLE ACTIVATED", {
                  description: "Global monitoring priority set to MAXIMUM. Security teams notified.",
                  duration: 10000
                })
              }}
            >
              OPEN EMERGENCY CONSOLE
            </Button>
        </Card>
      </div>

      <ConfirmModal
        isOpen={isTerminateModalOpen}
        onClose={handleCloseModal}
        onConfirm={confirmTermination}
        title="Emergency Termination"
        description={`WARNING: You are about to manually terminate an active trip (#${tripToTerminate?.split('-')[0].toUpperCase()}). This will notify both the rider and driver immediately and stop all distance calculations. Are you sure you want to proceed?`}
        confirmText={cancelMutation.isPending ? 'Terminating...' : 'Confirm Termination'}
        variant="danger"
      />
    </div>
  )
}
