import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
}

export const CouponService = {
  async getCoupons() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createCoupon(coupon: Omit<Coupon, 'id' | 'uses_count'>) {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert(coupon)
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('CREATE', 'coupons', data.id, {
      code: coupon.code,
      value: `${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : '$'}`
    })

    return data
  },

  async deleteCoupon(id: string) {
    const { error } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) throw error

    await AdminService.logAction('DELETE', 'coupons', id, { message: 'Coupon permanently removed' })
  },

  async toggleStatus(id: string, currentStatus: boolean) {
    const { error } = await supabaseAdmin
      .from('coupons')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) throw error

    await AdminService.logAction('UPDATE', 'coupons', id, { 
      action: 'toggle_status', 
      new_status: !currentStatus 
    })
  }
}
