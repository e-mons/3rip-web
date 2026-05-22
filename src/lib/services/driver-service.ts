import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'
import { Driver } from '../types'

export type DriverStatus = 'active' | 'suspended' | 'pending_verification'

export const DriverService = {
  async getDrivers(status?: string): Promise<Driver[]> {
    let query = supabase
      .from('drivers')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'All') {
      query = query.eq('status', status.toLowerCase().replace(' ', '_'))
    }

    const { data, error } = await query
    if (error) throw error
    return data as any as Driver[]
  },

  async updateDriverStatus(driverId: string, status: DriverStatus) {
    const { data, error } = await supabaseAdmin
      .from('drivers')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', driverId)
      .select()
      .single()

    if (error) throw error

    // Audit Log
    await AdminService.logAction('UPDATE', 'drivers', driverId, { status })

    // Create a system notification for the driver
    await supabaseAdmin.from('notifications').insert({
      user_id: driverId,
      title: `Account Status Updated`,
      body: `Your driver account status has been changed to ${status.replace('_', ' ')}.`,
      type: status === 'active' ? 'success' : status === 'suspended' ? 'danger' : 'info'
    })

    return data
  },

  async deleteDriver(driverId: string) {
    const { error } = await supabaseAdmin
      .from('drivers')
      .delete()
      .eq('id', driverId)

    if (error) throw error

    await AdminService.logAction('DELETE', 'drivers', driverId, {})
  },

  async onboardDriver(driverData: any) {
    // First ensure the user exists or create them
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        email: driverData.email,
        first_name: driverData.first_name,
        last_name: driverData.last_name,
        role: 'driver',
        phone_number: driverData.phone_number
      }])
      .select()
      .single()

    if (userError) throw userError

    const { data, error } = await supabaseAdmin
      .from('drivers')
      .insert([{
        id: userData.id,
        license_number: driverData.license_number,
        vehicle_details: driverData.vehicle_details,
        status: 'verified',
        rating: 5.0,
        total_trips: 0
      }])
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('CREATE', 'drivers', data.id, driverData)
    return data
  }
}
