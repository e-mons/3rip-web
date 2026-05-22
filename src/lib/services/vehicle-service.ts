import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'
import { Vehicle } from '../types'

export const VehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        driver:drivers(
          *,
          user:users(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as any as Vehicle[]
  },

  async createVehicle(vehicleData: any) {
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .insert([{
        ...vehicleData,
        status: 'active'
      }])
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('INSERT', 'vehicles', data.id, vehicleData)
    return data
  },

  async updateVehicle(vehicleId: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', vehicleId)
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('UPDATE', 'vehicles', vehicleId, updates)
    return data
  },

  async deleteVehicle(vehicleId: string) {
    const { error } = await supabaseAdmin
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)

    if (error) throw error

    await AdminService.logAction('DELETE', 'vehicles', vehicleId, {})
  }
}
