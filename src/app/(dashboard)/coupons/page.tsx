'use client'

import React, { useEffect, useState } from 'react'
import { Ticket, Plus, Search, Filter, Calendar, Users, Percent, DollarSign, Clock, MoreVertical, Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input, Modal, ConfirmModal } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CouponService } from '@/lib/services/coupon-service'
import { SettingsService } from '@/lib/services/settings-service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { couponSchema, CouponFormData, referralSettingsSchema, ReferralSettingsFormData } from '@/lib/validations'
import { toast } from 'sonner'
import CampaignWizard from '@/components/coupons/CampaignWizard'

export default function CouponsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false)

  const { data: coupons = [], isLoading: isLoadingCoupons } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => CouponService.getCoupons()
  })

  const { data: settings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => SettingsService.getSettings()
  })

  const isLoading = isLoadingCoupons || isLoadingSettings

  // React Hook Form for new coupon
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      max_uses: null,
      valid_until: null,
      is_active: true
    }
  })

  // React Hook Form for referral settings
  const { register: registerRef, control, handleSubmit: handleRefSubmit, setValue: setRefValue, formState: { errors: refErrors } } = useForm<ReferralSettingsFormData>({
    resolver: zodResolver(referralSettingsSchema) as any,
    defaultValues: {
      rules: [{ name: 'Default Rule', referrer_reward: 10, friend_reward: 5 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules"
  })

  // Populate referral form values once settings are loaded
  useEffect(() => {
    if (settings.length > 0 && !hasLoadedSettings) {
      const referralConfig = settings.find((s: any) => s.key === 'referral_program')?.value || { rules: [{ name: 'Default Rule', referrer_reward: 10, friend_reward: 5 }] }
      if (referralConfig.rules) {
        setRefValue('rules', referralConfig.rules)
      } else {
        setRefValue('rules', [{ name: 'Legacy Rule', referrer_reward: referralConfig.referrer_discount || 10, friend_reward: referralConfig.friend_reward || 5 }])
      }
      setHasLoadedSettings(true)
    }
  }, [settings, setRefValue, hasLoadedSettings])

  const createCouponMutation = useMutation({
    mutationFn: (data: CouponFormData) => CouponService.createCoupon({
      ...data,
      valid_from: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      toast.success('Coupon created successfully')
      setIsModalOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create coupon')
    }
  })

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) => CouponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      toast.success('Coupon deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete coupon')
    }
  })

  const toggleCouponMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string, currentStatus: boolean }) => CouponService.toggleStatus(id, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      toast.success('Coupon status updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update coupon status')
    }
  })

  const updateReferralMutation = useMutation({
    mutationFn: (data: ReferralSettingsFormData) => SettingsService.updateSetting('referral_program', {
      rules: data.rules
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Referral settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update referral settings')
    }
  })

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleCouponMutation.mutate({ id, currentStatus })
  }

  const onSubmitCoupon = (data: CouponFormData) => {
    createCouponMutation.mutate(data)
  }

  const onSubmitReferral = (data: ReferralSettingsFormData) => {
    updateReferralMutation.mutate(data)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase italic">Growth Hub</h1>
          <p className="text-gray-500 mt-1">Manage promotional campaigns, referral incentives and platform expansion.</p>
        </div>
        <Button 
          size="sm" 
          className="font-black italic tracking-widest shadow-xl shadow-primary/20"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> CREATE NEW PROMO
        </Button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-[300px]">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence>
            {coupons.map((coupon: any, i: number) => {
              const usagePercent = coupon.max_uses ? (coupon.uses_count / coupon.max_uses) * 100 : 0
              const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date()
              
              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all" />
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          {coupon.discount_type === 'percentage' ? <Percent className="w-5 h-5 text-primary" /> : <DollarSign className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <Badge variant={isExpired ? 'danger' : coupon.is_active ? 'success' : 'warning'}>
                          {isExpired ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-xl font-black italic tracking-wider text-gray-900 mb-1">{coupon.code}</h3>
                        <p className="text-sm font-bold text-primary italic">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`} OFF
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-black/5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Redemptions
                          </div>
                          <span className="text-gray-600">{coupon.uses_count} / {coupon.max_uses || '∞'}</span>
                        </div>
                        {coupon.max_uses && (
                          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div 
                               className="bg-primary h-full rounded-full" 
                               style={{ width: `${Math.min(usagePercent, 100)}%` }} 
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Ends On
                          </div>
                          <span className="text-gray-500">{coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-2">
                         <Button 
                           variant="secondary" 
                           className="flex-1 text-[10px] h-9 font-black italic tracking-widest uppercase"
                           onClick={() => handleToggle(coupon.id, coupon.is_active)}
                           disabled={toggleCouponMutation.isPending}
                         >
                           {coupon.is_active ? 'Disable' : 'Enable'}
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-9 w-9 hover:text-red-500" 
                           onClick={() => handleDelete(coupon.id)}
                           disabled={deleteCouponMutation.isPending}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}

        {!isLoading && coupons.length === 0 && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-black/5 rounded-[40px]">
              <p className="text-gray-400 font-medium italic">No active promotional campaigns found.</p>
           </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-8">
            <form onSubmit={handleRefSubmit(onSubmitReferral)}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900 uppercase italic">
                   <Users className="w-5 h-5 text-primary" />
                   Referral Architecture
                </h3>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => append({ name: 'New Rule', referrer_reward: 0, friend_reward: 0 })}
                >
                  + Add Rule
                </Button>
              </div>
              <div className="space-y-6">
                 {fields.map((field, index) => (
                   <div key={field.id} className="p-4 bg-gray-50 rounded-2xl border border-black/5 relative group">
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 hover:text-red-500"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="mb-4 pr-8">
                        <p className="text-sm font-bold text-gray-900 mb-2">Rule Name</p>
                        <Input 
                           {...registerRef(`rules.${index}.name` as const)}
                           className={cn("bg-white border-black/5", refErrors.rules?.[index]?.name ? "border-red-500" : "")} 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-xs font-bold text-gray-900 mb-1">Referrer Reward (%)</p>
                           <Input 
                              type="number"
                              {...registerRef(`rules.${index}.referrer_reward` as const)}
                              className={cn("bg-white font-black italic", refErrors.rules?.[index]?.referrer_reward ? "border-red-500" : "border-black/5")} 
                           />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-900 mb-1">Friend Reward ($)</p>
                           <Input 
                              type="number"
                              {...registerRef(`rules.${index}.friend_reward` as const)}
                              className={cn("bg-white font-black italic", refErrors.rules?.[index]?.friend_reward ? "border-red-500" : "border-black/5")} 
                           />
                        </div>
                      </div>
                   </div>
                 ))}
                 
                 <Button 
                   type="submit"
                   className="w-full h-12 font-black italic tracking-widest uppercase mt-4" 
                   disabled={updateReferralMutation.isPending}
                 >
                   {updateReferralMutation.isPending ? 'PUBLISHING...' : 'PUBLISH REFERRAL RULES'}
                 </Button>
              </div>
            </form>
          </Card>

          <Card className="p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00A9A4_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="w-16 h-16 rounded-[24px] bg-primary/20 flex items-center justify-center mb-4 relative z-10 transition-transform group-hover:scale-110">
               <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 relative z-10 uppercase italic">Automated Campaigns</h3>
            <p className="text-gray-500 text-sm max-w-xs mb-6 relative z-10 font-medium italic">
               Deploy rule-based discount triggers for user re-engagement or high-demand holiday seasons.
            </p>
            <Button 
              variant="secondary" 
              className="border-primary/50 text-primary relative z-10 font-black italic uppercase tracking-widest"
              onClick={() => setIsWizardOpen(true)}
            >
              LAUNCH CAMPAIGN WIZARD
            </Button>
          </Card>
      </div>

      <CampaignWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          reset()
        }}
        title="Create New Promotional Campaign"
      >
        <form onSubmit={handleSubmit(onSubmitCoupon)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Promo Code</label>
            <Input 
              {...register('code')}
              placeholder="e.g. DUBAI2024" 
              className={cn("bg-gray-50 font-black tracking-widest uppercase italic", errors.code ? "border-red-500" : "border-black/5")}
            />
            {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Discount Type</label>
              <select 
                {...register('discount_type')}
                className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary/50"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value</label>
              <Input 
                {...register('discount_value')}
                type="number" 
                step="0.01"
                className={cn("bg-gray-50 font-bold", errors.discount_value ? "border-red-500" : "border-black/5")}
              />
              {errors.discount_value && <p className="text-red-500 text-xs">{errors.discount_value.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Max Uses (Optional)</label>
              <Input 
                {...register('max_uses', { setValueAs: v => v === '' ? null : parseInt(v) })}
                type="number" 
                placeholder="Unlimited"
                className={cn("bg-gray-50 font-bold", errors.max_uses ? "border-red-500" : "border-black/5")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expiry Date</label>
              <Input 
                {...register('valid_until', { setValueAs: v => v === '' ? null : v })}
                type="date" 
                className={cn("bg-gray-50 font-bold", errors.valid_until ? "border-red-500" : "border-black/5")}
              />
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full h-12 italic font-black tracking-widest uppercase mt-4"
            disabled={createCouponMutation.isPending || !isValid}
          >
            {createCouponMutation.isPending ? 'PUBLISHING...' : 'PUBLISH CAMPAIGN'}
          </Button>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteCouponMutation.mutate(deleteConfirmId)
            setDeleteConfirmId(null)
          }
        }}
        isLoading={deleteCouponMutation.isPending}
        title="Delete Coupon"
        description="Are you sure you want to permanently delete this coupon? This action cannot be undone and will prevent any new riders from using it."
      />
    </div>
  )
}
