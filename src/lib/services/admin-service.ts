import { supabase } from '../supabase'
import { AuditLog } from '../types'
import { logActionAction, updateStatusAction, deleteRecordAction, getAuditLogsAction } from '@/app/actions/admin'

export type AdminAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'SUSPEND' | 'RESOLVE' | 'INSERT'

export const AdminService = {
  /**
   * Centralized audit logging for admin actions
   */
  async logAction(action: AdminAction, targetTable: string, targetId: string | null, details: any) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    await logActionAction(action, targetTable, targetId, details, user.id)
  },

  /**
   * Generic status update with audit logging
   */
  async updateStatus(table: string, id: string, status: string, details?: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    return await updateStatusAction(table, id, status, details, user.id)
  },

  /**
   * Generic delete with audit logging
   */
  async deleteRecord(table: string, id: string, details?: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    await deleteRecordAction(table, id, details, user.id)
  },

  /**
   * Fetch aggregate statistics for the overview dashboard
   */
  async getStats() {
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastWeekIso = lastWeek.toISOString()

    const [
      { count: riderCount },
      { count: prevRiderCount },
      { count: driverCount },
      { count: prevDriverCount },
      { count: bookingCount },
      { count: prevBookingCount },
      { data: payments },
      { data: prevPayments },
      { data: completedBookings }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'rider'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'rider').lt('created_at', lastWeekIso),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'driver').lt('created_at', lastWeekIso),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).lt('created_at', lastWeekIso),
      supabase.from('payments').select('amount').eq('status', 'captured'),
      supabase.from('payments').select('amount').eq('status', 'captured').lt('created_at', lastWeekIso),
      supabase.from('bookings').select('distance_meters, estimated_duration_mins').eq('status', 'completed')
    ])

    const totalRevenue = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0
    const prevRevenue = prevPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0
    
    const calculateGrowth = (current: number, previous: number) => {
      if (!previous) return '+100%'
      const growth = ((current - previous) / previous) * 100
      return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
    }

    // Calculate average ride time
    const totalMins = completedBookings?.reduce((acc, b) => acc + (b.estimated_duration_mins || 0), 0) || 0
    const avgRideTime = completedBookings?.length ? (totalMins / completedBookings.length).toFixed(1) : '0'

    return {
      revenue: totalRevenue,
      revenueGrowth: calculateGrowth(totalRevenue, prevRevenue),
      riders: riderCount || 0,
      ridersGrowth: calculateGrowth(riderCount || 0, prevRiderCount || 0),
      drivers: driverCount || 0,
      driversGrowth: calculateGrowth(driverCount || 0, prevDriverCount || 0),
      bookings: bookingCount || 0,
      bookingsGrowth: calculateGrowth(bookingCount || 0, prevBookingCount || 0),
      avgRideTime: `${avgRideTime}m`
    }
  },

  /**
   * Fetch recent activity and notifications for the feed
   */
  async getRecentActivity() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data
  },

  /**
   * Fetch audit logs for security review
   */
  async getAuditLogs(): Promise<AuditLog[]> {
    const data = await getAuditLogsAction()
    return data as any as AuditLog[]
  }
}
