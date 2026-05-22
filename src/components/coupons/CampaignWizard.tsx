'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Zap, Gift, CheckCircle2, ChevronRight, ChevronLeft, Calendar, Percent, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { CouponService } from '@/lib/services/coupon-service'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface CampaignWizardProps {
  isOpen: boolean
  onClose: () => void
}

const STEPS = [
  { id: 'objective', title: 'Objective', icon: Target },
  { id: 'rules', title: 'Rule Engine', icon: Zap },
  { id: 'rewards', title: 'Rewards', icon: Gift },
  { id: 'review', title: 'Review', icon: CheckCircle2 },
]

const OBJECTIVES = [
  { id: 'new_riders', title: 'Rider Acquisition', desc: 'Target new sign-ups with first-ride discounts.', icon: Users },
  { id: 'churn', title: 'Re-engagement', desc: 'Bring back riders who haven\'t booked in 30 days.', icon: Zap },
  { id: 'peak', title: 'Peak Demand', desc: 'Manage supply/demand during high-traffic events.', icon: Target },
  { id: 'holiday', title: 'Seasonal Special', desc: 'Generic holiday or event-based promotions.', icon: Gift },
]

export default function CampaignWizard({ isOpen, onClose }: CampaignWizardProps) {
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    objective: 'new_riders',
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    max_uses: 1000,
    valid_until: '',
    target_segment: 'all'
  })

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleLaunch = async () => {
    try {
      await CouponService.createCoupon({
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        max_uses: formData.max_uses,
        valid_until: formData.valid_until || null,
        is_active: true,
        valid_from: new Date().toISOString()
      })
      
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      toast.success('Campaign launched successfully!')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to launch campaign')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[600px]"
      >
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-gray-50 p-8 border-r border-black/5 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black italic tracking-tighter text-gray-900 mb-8 uppercase">Campaign Wizard</h2>
            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <div key={step.id} className={cn(
                  "flex items-center gap-4 transition-all",
                  currentStep === i ? "text-primary translate-x-2" : i < currentStep ? "text-emerald-500" : "text-gray-300"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center border-2",
                    currentStep === i ? "border-primary bg-primary/10" : i < currentStep ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                  )}>
                    {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-gray-900">
            Cancel & Exit
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-12 flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              {React.createElement(STEPS[currentStep].icon, { className: "w-48 h-48 text-primary" })}
           </div>

           <div className="flex-1 z-10">
              <AnimatePresence mode="wait">
                 {currentStep === 0 && (
                   <motion.div 
                     key="step0"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                   >
                     <div>
                        <h3 className="text-2xl font-black italic tracking-tight text-gray-900 uppercase mb-2">Define Objective</h3>
                        <p className="text-gray-500 font-medium">Select the primary goal for this growth campaign.</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {OBJECTIVES.map((obj) => (
                          <div 
                            key={obj.id}
                            onClick={() => setFormData({...formData, objective: obj.id})}
                            className={cn(
                              "p-6 rounded-[32px] border-2 cursor-pointer transition-all group",
                              formData.objective === obj.id ? "border-primary bg-primary/5" : "border-black/5 hover:border-black/10 bg-white"
                            )}
                          >
                             <div className={cn(
                               "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                               formData.objective === obj.id ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                             )}>
                                <obj.icon className="w-5 h-5" />
                             </div>
                             <h4 className="text-sm font-bold text-gray-900 mb-1">{obj.title}</h4>
                             <p className="text-[10px] text-gray-400 leading-tight font-medium">{obj.desc}</p>
                          </div>
                        ))}
                     </div>
                   </motion.div>
                 )}

                 {currentStep === 1 && (
                   <motion.div 
                     key="step1"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                   >
                     <div>
                        <h3 className="text-2xl font-black italic tracking-tight text-gray-900 uppercase mb-2">Rule Configuration</h3>
                        <p className="text-gray-500 font-medium">Configure the triggers and identity of the promo.</p>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign Promo Code</label>
                           <Input 
                             value={formData.code}
                             onChange={(e) => setFormData({...formData, code: e.target.value})}
                             placeholder="e.g. FLASH25" 
                             className="bg-gray-50 font-black tracking-widest text-lg py-6 uppercase italic border-black/5" 
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Budget (Redemptions)</label>
                              <Input 
                                type="number"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({...formData, max_uses: parseInt(e.target.value)})}
                                className="bg-gray-50 border-black/5" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expiration</label>
                              <Input 
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                                className="bg-gray-50 border-black/5" 
                              />
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 )}

                 {currentStep === 2 && (
                   <motion.div 
                     key="step2"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                   >
                     <div>
                        <h3 className="text-2xl font-black italic tracking-tight text-gray-900 uppercase mb-2">Reward Structure</h3>
                        <p className="text-gray-500 font-medium">Define the financial incentives for this campaign.</p>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div 
                          onClick={() => setFormData({...formData, discount_type: 'percentage'})}
                          className={cn(
                            "p-8 rounded-[40px] border-2 cursor-pointer transition-all flex flex-col items-center gap-4",
                            formData.discount_type === 'percentage' ? "border-primary bg-primary/5" : "border-black/5 bg-white"
                          )}
                        >
                           <Percent className={cn("w-8 h-8", formData.discount_type === 'percentage' ? "text-primary" : "text-gray-300")} />
                           <span className="text-sm font-bold">Percentage</span>
                        </div>
                        <div 
                          onClick={() => setFormData({...formData, discount_type: 'fixed'})}
                          className={cn(
                            "p-8 rounded-[40px] border-2 cursor-pointer transition-all flex flex-col items-center gap-4",
                            formData.discount_type === 'fixed' ? "border-emerald-500 bg-emerald-50/50" : "border-black/5 bg-white"
                          )}
                        >
                           <DollarSign className={cn("w-8 h-8", formData.discount_type === 'fixed' ? "text-emerald-500" : "text-gray-300")} />
                           <span className="text-sm font-bold">Fixed Amount</span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Discount Value</label>
                        <Input 
                          type="number"
                          value={formData.discount_value}
                          onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                          className="bg-gray-100 text-center text-3xl h-20 font-black italic border-none focus:ring-0" 
                        />
                     </div>
                   </motion.div>
                 )}

                 {currentStep === 3 && (
                   <motion.div 
                     key="step3"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                   >
                     <div>
                        <h3 className="text-2xl font-black italic tracking-tight text-gray-900 uppercase mb-2">Final Review</h3>
                        <p className="text-gray-500 font-medium">Verify campaign parameters before deployment.</p>
                     </div>
                     <Card className="p-8 border-primary/20 bg-primary/[0.02] space-y-6">
                        <div className="flex justify-between items-center border-b border-black/5 pb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Promo Code</span>
                           <span className="text-xl font-black italic text-primary">{formData.code.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-black/5 pb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reward</span>
                           <span className="text-lg font-bold">
                             {formData.discount_type === 'percentage' ? `${formData.discount_value}% OFF` : `$${formData.discount_value} OFF`}
                           </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-black/5 pb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cap</span>
                           <span className="text-lg font-bold">{formData.max_uses} Users</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expiry</span>
                           <span className="text-lg font-bold">{formData.valid_until || 'No Expiry'}</span>
                        </div>
                     </Card>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Footer Controls */}
           <div className="flex items-center justify-between pt-8 border-t border-black/5 z-10">
              <Button 
                variant="secondary" 
                onClick={handleBack} 
                disabled={currentStep === 0}
                className="h-12 px-8"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              
              {currentStep === STEPS.length - 1 ? (
                <Button 
                  onClick={handleLaunch}
                  className="h-12 px-12 font-black italic tracking-widest shadow-xl shadow-primary/20"
                >
                  DEPLOY CAMPAIGN <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  disabled={!formData.code && currentStep === 1}
                  className="h-12 px-12"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
           </div>
        </div>
      </motion.div>
    </div>
  )
}
