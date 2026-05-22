import { supabase } from '../supabase'
import { AdminService } from './admin-service'
import { updateSettingAction } from '@/app/actions/settings'

export const SettingsService = {
  async getSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })

    if (error) throw error
    return data
  },

  async updateSetting(key: string, value: any) {
    let userId = 'system-admin'
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) userId = user.id
    } catch {
      // Proceed with fallback userId for audit logging
    }

    return await updateSettingAction(key, value, userId)
  },

  async getFinanceSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', 'finance')
    
    if (error) throw error
    return data
  },

  async getFeatureToggles() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', 'features')
    
    if (error) throw error
    return data
  }
}
