import { z } from 'zod'

export const userSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters').optional().or(z.literal('')),
  role: z.enum(['rider', 'driver', 'admin', 'support']),
  is_active: z.boolean(),
  verification_status: z.enum(['unverified', 'verified', 'rejected', 'suspended']),
  image_url: z.string().url().optional().or(z.literal(''))
})

export type UserFormData = z.infer<typeof userSchema>

export const driverSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters'),
  license_number: z.string().min(5, 'License number is required'),
  vehicle_details: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    plate: z.string().optional()
  }).optional(),
  image_url: z.string().url().optional().or(z.literal(''))
})

export type DriverFormData = z.infer<typeof driverSchema>

export const vehicleSchema = z.object({
  driver_id: z.string().uuid().optional().or(z.literal('')),
  make: z.string().min(2, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().min(2, 'Color is required'),
  plate_number: z.string().min(2, 'License plate is required'),
  type: z.string().min(2, 'Vehicle type is required'),
  capacity: z.coerce.number().min(1).max(20),
  status: z.enum(['active', 'maintenance', 'retired']),
  approval_status: z.enum(['pending', 'approved', 'rejected']),
  image_url: z.string().url().optional().or(z.literal(''))
})

export type VehicleFormData = z.infer<typeof vehicleSchema>

export const bookingSchema = z.object({
  rider_id: z.string().uuid('Please select a rider'),
  driver_id: z.string().uuid().optional().or(z.literal('')),
  type: z.enum(['ride', 'parcel', 'freight', 'rental']),
  status: z.enum(['searching', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled', 'scheduled']),
  pickup_address: z.string().min(5, 'Pickup address is required'),
  dropoff_address: z.string().min(5, 'Dropoff address is required'),
  estimated_fare: z.coerce.number().min(0, 'Estimated fare must be a positive number'),
  notes: z.string().optional()
})

export type BookingFormData = z.infer<typeof bookingSchema>

export const supportTicketReplySchema = z.object({
  content: z.string().min(1, 'Reply message cannot be empty').max(2000, 'Reply is too long')
})

export type SupportTicketReplyFormData = z.infer<typeof supportTicketReplySchema>

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().min(0.01, 'Discount value must be greater than 0'),
  max_uses: z.coerce.number().min(1).nullable().optional().transform(v => v ?? null),
  valid_until: z.string().nullable().optional().transform(v => v ?? null),
  is_active: z.boolean()
})

export type CouponFormData = z.infer<typeof couponSchema>

export const referralRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Rule name is required'),
  referrer_reward: z.coerce.number().min(0).max(100),
  friend_reward: z.coerce.number().min(0)
})

export const referralSettingsSchema = z.object({
  rules: z.array(referralRuleSchema)
})

export type ReferralRuleFormData = z.infer<typeof referralRuleSchema>
export type ReferralSettingsFormData = z.infer<typeof referralSettingsSchema>

/**
 * Location Permission Checker (Mock for Node/Next env)
 * In a real app, this would be client-side navigator.permissions.query
 */
export const checkLocationPermissions = async () => {
  if (typeof window === 'undefined') return { status: 'denied' }
  
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as any })
    return { status: result.state }
  } catch (e) {
    return { status: 'unsupported' }
  }
}
