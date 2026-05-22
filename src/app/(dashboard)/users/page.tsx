'use client'

import React, { useState } from 'react'
import { Search, Filter, Download, UserCheck, UserX, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Card, Badge, ConfirmModal, ImageUpload } from '@/components/ui'
import { Modal } from '@/components/ui/modal'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { UserService } from '@/lib/services/user-service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, UserFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { User as UserType } from '@/lib/types'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['users', 'rider'],
    queryFn: () => UserService.getUsers('rider')
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      role: 'rider',
      is_active: true,
      verification_status: 'unverified',
      image_url: ''
    }
  })

  const userImage = watch('image_url')

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => UserService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Rider created successfully')
      setIsAddModalOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create rider')
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      UserService.toggleUserActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Status updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Rider deleted')
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete rider')
    }
  })

  const onSubmit = (data: UserFormData) => {
    createMutation.mutate(data)
  }

  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Status', 'Joined']
    const data = users.map(user => [
      user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      user.email,
      user.phone_number,
      user.is_active ? 'active' : 'blocked',
      new Date(user.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...data].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `3rip_riders_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredUsers = users.filter(user => {
    const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.includes(searchTerm)
    
    const status = user.is_active ? 'active' : 'blocked'
    const matchesStatus = statusFilter === 'All' || status === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Rider Management</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all 3rip platform riders.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            + Add New User
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name, email or phone..." 
            className="pl-12 bg-transparent border-black/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="secondary" className="flex-1 md:flex-none">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <select 
            className="bg-gray-50 border border-black/5 rounded-2xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary/50 transition-all appearance-none pr-10 relative cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Blocked</option>
            <option>Pending</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
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
                  <th className="px-8 py-5">Rider</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Phone</th>
                  <th className="px-8 py-5">Joined</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <AnimatePresence>
                  {filteredUsers.map((user, i) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center font-bold text-primary italic uppercase overflow-hidden">
                            {user.image_url ? (
                              <img src={user.image_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              (user.full_name?.charAt(0) || user.first_name?.charAt(0) || user.email?.charAt(0))
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">
                              {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant={user.is_active ? 'success' : 'danger'}>
                          {user.is_active ? 'Active' : 'Blocked'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-mono text-gray-600">{user.phone_number || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-xl"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "w-8 h-8 rounded-xl transition-colors",
                              user.is_active ? "hover:text-amber-500" : "hover:text-emerald-500"
                            )}
                            onClick={() => updateStatusMutation.mutate({ id: user.id, isActive: !user.is_active })}
                            title={user.is_active ? 'Block User' : 'Unblock User'}
                            disabled={updateStatusMutation.isPending}
                          >
                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-xl hover:text-red-500"
                            onClick={() => setDeleteConfirmId(user.id)}
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
            {filteredUsers.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-400 italic">No riders found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rider Details"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-3xl border border-black/5">
              <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-3xl font-black text-primary italic overflow-hidden">
                {selectedUser.image_url ? (
                  <img src={selectedUser.image_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (selectedUser.full_name?.charAt(0) || selectedUser.first_name?.charAt(0) || selectedUser.email?.charAt(0))
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.full_name || `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim()}</h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedUser.is_active ? 'success' : 'danger'}>{selectedUser.is_active ? 'Active' : 'Blocked'}</Badge>
                  <Badge variant="default">Rider</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phone Number</p>
                <p className="font-bold text-gray-900">{selectedUser.phone_number || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Member Since</p>
                <p className="font-bold text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => {
                  updateStatusMutation.mutate({ id: selectedUser.id, isActive: !selectedUser.is_active })
                  setIsModalOpen(false)
                }}
                disabled={updateStatusMutation.isPending}
              >
                {selectedUser.is_active ? 'Block Rider' : 'Unblock Rider'}
              </Button>
              <Button 
                variant="secondary" 
                className="text-red-500 hover:bg-red-50"
                onClick={() => setDeleteConfirmId(selectedUser.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add New User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          reset()
        }}
        title="Add New Rider"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ImageUpload
            label="Profile Picture"
            bucket="avatars"
            value={userImage}
            onChange={(url) => setValue('image_url', url)}
            className="mb-4"
          />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
            <Input 
              {...register('full_name')}
              placeholder="John Doe"
            />
            {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name.message}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
            <Input 
              {...register('email')}
              type="email"
              placeholder="john@example.com"
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
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Account'}
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
        title="Delete User"
        description="Are you sure you want to permanently delete this user? This action cannot be undone."
      />
    </div>
  )
}
