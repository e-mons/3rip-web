'use client'

import React, { useState } from 'react'
import { Car, Search, Plus, Trash2, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input, Modal, ConfirmModal, ImageUpload } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { VehicleService } from '@/lib/services/vehicle-service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vehicleSchema, VehicleFormData } from '@/lib/validations'
import { toast } from 'sonner'

export default function VehiclesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => VehicleService.getVehicles()
  })
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      year: new Date().getFullYear(),
      type: 'economy',
      capacity: 4,
      status: 'active',
      approval_status: 'approved',
      image_url: ''
    }
  })

  const vehicleImage = watch('image_url')

  const createMutation = useMutation({
    mutationFn: (data: VehicleFormData) => VehicleService.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Vehicle registered successfully')
      setIsAddModalOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register vehicle')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Vehicle deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete vehicle')
    }
  })

  const onSubmit = (data: VehicleFormData) => {
    createMutation.mutate(data)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleExportCSV = () => {
    const headers = ['Vehicle', 'Plate Number', 'Category', 'Status', 'Year', 'Color']
    const data = vehicles.map(v => [
      `${v.make} ${v.model}`,
      v.plate_number,
      v.type,
      v.status,
      v.year,
      v.color
    ])

    const csvContent = [headers, ...data].map(e => `"${e.join('","')}"`).join("\n")
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

  const categories = {
    economy: vehicles.filter(v => v.type === 'economy').length,
    comfort: vehicles.filter(v => v.type === 'comfort').length,
    luxury: vehicles.filter(v => v.type === 'luxury').length
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'All' || vehicle.type === typeFilter.toLowerCase()
    
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-black italic">Fleet Control</h1>
          <p className="text-gray-500 mt-1">Manage global vehicle registry, categories and compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export Fleet
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Register Vehicle
          </Button>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: '3rip Economy', count: categories.economy, type: 'economy', icon: Car, color: 'text-emerald-500' },
          { label: '3rip Comfort', count: categories.comfort, type: 'comfort', icon: Car, color: 'text-blue-500' },
          { label: '3rip Luxury', count: categories.luxury, type: 'luxury', icon: Car, color: 'text-primary' },
        ].map((cat, i) => (
          <Card 
            key={i} 
            className={cn(
              "p-6 group hover:border-black/10 transition-all cursor-pointer",
              typeFilter.toLowerCase() === cat.type && "border-primary/50 bg-primary/[0.02]"
            )}
            onClick={() => setTypeFilter(cat.label.split(' ')[1])}
          >
            <div className="flex items-center justify-between">
              <div className={cn("w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center", cat.color)}>
                <cat.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-black italic text-gray-900 group-hover:text-primary transition-colors">{cat.count}</p>
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{cat.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by plate, make or model..." 
            className="pl-12 bg-transparent border-black/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-gray-50 border border-black/5 rounded-2xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary/50 transition-all appearance-none pr-10 relative cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All</option>
            <option>Economy</option>
            <option>Comfort</option>
            <option>Luxury</option>
          </select>
          <Button variant="secondary" onClick={() => { setSearchTerm(''); setTypeFilter('All'); }}>Reset</Button>
        </div>
      </Card>

      {/* Vehicles Table */}
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
                  <th className="px-8 py-5">Vehicle</th>
                  <th className="px-8 py-5">Plate</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Assigned Driver</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <AnimatePresence>
                  {filteredVehicles.map((vehicle, i) => (
                    <motion.tr 
                      key={vehicle.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-10 rounded-xl bg-gray-100 overflow-hidden border border-black/5 shrink-0">
                            {vehicle.image_url ? (
                              <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Car className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{vehicle.make} {vehicle.model}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{vehicle.color} • {vehicle.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-mono font-bold bg-gray-100 px-3 py-1 rounded-lg border border-black/5 text-primary">
                          {vehicle.plate_number}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-bold text-gray-600 capitalize">{vehicle.type}</p>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant={
                          vehicle.status === 'active' ? 'success' : 
                          vehicle.status === 'maintenance' ? 'warning' : 'danger'
                        }>
                          {vehicle.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary italic uppercase">
                            {vehicle.driver?.user?.first_name?.[0] || 'D'}
                          </div>
                          <p className="text-xs font-medium text-gray-500">
                            {vehicle.driver?.user ? `${vehicle.driver.user.first_name} ${vehicle.driver.user.last_name}` : 'Unassigned'}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-xl"
                            onClick={() => {
                              setSelectedVehicle(vehicle)
                              setIsModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-xl hover:text-red-500" 
                            onClick={() => handleDelete(vehicle.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredVehicles.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-400 italic">No vehicles found in this category.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          reset()
        }}
        title="Register New Vehicle"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ImageUpload
            label="Vehicle Photo"
            bucket="vehicles"
            value={vehicleImage}
            onChange={(url) => setValue('image_url', url)}
            className="mb-6"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Make</label>
              <Input 
                {...register('make')}
                placeholder="e.g. Toyota" 
              />
              {errors.make && <p className="text-red-500 text-xs">{errors.make.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model</label>
              <Input 
                {...register('model')}
                placeholder="e.g. Camry" 
              />
              {errors.model && <p className="text-red-500 text-xs">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Year</label>
              <Input 
                {...register('year', { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 2023" 
              />
              {errors.year && <p className="text-red-500 text-xs">{errors.year.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color</label>
              <Input 
                {...register('color')}
                placeholder="e.g. Black" 
              />
              {errors.color && <p className="text-red-500 text-xs">{errors.color.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plate Number</label>
              <Input 
                {...register('plate_number')}
                placeholder="e.g. ABC-1234" 
              />
              {errors.plate_number && <p className="text-red-500 text-xs">{errors.plate_number.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
              <select 
                {...register('type')}
                className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-2 text-sm outline-none focus:border-primary/50"
              >
                <option value="economy">Economy</option>
                <option value="comfort">Comfort</option>
                <option value="luxury">Luxury</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-black/5">
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Registering...' : 'Register Vehicle'}
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
        title="Delete Vehicle"
        description="Are you sure you want to permanently remove this vehicle from the fleet? This action cannot be undone."
      />
      {/* Vehicle Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Vehicle Details"
      >
        {selectedVehicle && (
          <div className="space-y-6">
            {selectedVehicle.image_url && (
              <div className="w-full h-44 rounded-3xl overflow-hidden border border-black/5">
                <img src={selectedVehicle.image_url} alt="Vehicle" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-3xl border border-black/5">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedVehicle.make} {selectedVehicle.model}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{selectedVehicle.color} • {selectedVehicle.year}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedVehicle.status === 'active' ? 'success' : selectedVehicle.status === 'maintenance' ? 'warning' : 'danger'}>
                    {selectedVehicle.status}
                  </Badge>
                  <Badge variant="default" className="capitalize">{selectedVehicle.type}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Plate Number</p>
                <p className="font-bold text-gray-900 font-mono text-sm">{selectedVehicle.plate_number}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Passenger Capacity</p>
                <p className="font-bold text-gray-900">{selectedVehicle.capacity || 4} Seats</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/5 col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Assigned Driver</p>
                {selectedVehicle.driver?.user ? (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary italic uppercase">
                      {selectedVehicle.driver.user.first_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedVehicle.driver.user.first_name} {selectedVehicle.driver.user.last_name}
                      </p>
                      <p className="text-[10px] text-gray-400">{selectedVehicle.driver.user.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="font-bold text-gray-500 italic mt-0.5">No driver currently assigned</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-black/5">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
              >
                Close Details
              </Button>
              <Button 
                variant="secondary" 
                className="text-red-500 hover:bg-red-50"
                onClick={() => {
                  setDeleteConfirmId(selectedVehicle.id)
                  setIsModalOpen(false)
                }}
                disabled={deleteMutation.isPending}
              >
                Delete Vehicle
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
