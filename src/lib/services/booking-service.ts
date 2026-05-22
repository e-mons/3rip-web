import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'
import { Booking } from '../types'

export type BookingStatus = 'searching' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled'
export type CancellationReason = 'user_cancelled' | 'driver_cancelled' | 'system_timeout' | 'admin_intervention'

export const BookingService = {
  async getBookings(status?: string): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        rider:users!bookings_rider_id_fkey(*),
        driver:drivers(
          *,
          user:users(*)
        ),
        vehicle:vehicles(*)
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'All') {
      query = query.eq('status', status.toLowerCase())
    }

    const { data, error } = await query
    if (error) throw error
    return data as any as Booking[]
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ 
        status, 
        updated_at: new Date().toISOString(),
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
        ...(status === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
        ...(status === 'in_progress' ? { started_at: new Date().toISOString() } : {})
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('UPDATE', 'bookings', bookingId, { status })
    return data
  },

  async cancelRide(bookingId: string, reason: CancellationReason, initiatedBy: string) {
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, rider:users!bookings_rider_id_fkey(id), driver:drivers(id)')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) throw new Error('Booking not found')

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ 
        status: 'cancelled', 
        notes: `Cancelled by ${initiatedBy}. Reason: ${reason}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('RESOLVE', 'bookings', bookingId, { reason, action: 'cancelled' })
    return data
  },

  async createBooking(bookingData: any) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([{
        rider_id: bookingData.rider_id,
        driver_id: bookingData.driver_id || null,
        type: bookingData.type || 'ride',
        status: bookingData.status || 'searching',
        pickup_location: bookingData.pickup_location || 'POINT(55.2708 25.2048)',
        pickup_address: bookingData.pickup_address,
        dropoff_location: bookingData.dropoff_location || 'POINT(55.2797 25.2120)',
        dropoff_address: bookingData.dropoff_address,
        estimated_fare: bookingData.estimated_fare,
        notes: bookingData.notes
      }])
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('CREATE', 'bookings', data.id, bookingData)
    return data
  }
}
