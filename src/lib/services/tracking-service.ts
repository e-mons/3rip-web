import { supabase } from '../supabase'
import { Booking } from '../types'

export const TrackingService = {
  /**
   * Fetch all active trips with rider and driver details
   */
  async getActiveTrips(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rider:rider_id (
          first_name,
          last_name,
          phone_number
        ),
        driver:driver_id (
          id,
          users (
            first_name,
            last_name,
            phone_number
          ),
          current_location,
          heading
        ),
        vehicle:vehicle_id (
          make,
          model,
          license_plate
        )
      `)
      .in('status', ['accepted', 'arrived', 'in_progress'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as any as Booking[]
  },

  /**
   * Subscribe to real-time location updates for all active drivers
   */
  subscribeToLiveTracking(onUpdate: (payload: any) => void) {
    return supabase
      .channel('live-tracking')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers'
        },
        (payload) => {
          onUpdate(payload.new)
        }
      )
      .subscribe()
  }
}
