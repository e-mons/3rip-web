import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'
import { Announcement } from '../types'

export const NotificationService = {
  async getSystemAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('system_announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Announcement[]
  },

  async broadcast(title: string, content: string, type: string, targetAudience: 'all' | 'riders' | 'drivers') {
    // 1. Create the system announcement record
    const { data: announcement, error: annError } = await supabaseAdmin
      .from('system_announcements')
      .insert({
        title,
        content,
        type,
        target_audience: targetAudience,
        status: 'sent'
      })
      .select()
      .single()

    if (annError) throw annError

    // 2. Fetch targeted users
    let query = supabase.from('users').select('id')
    if (targetAudience === 'riders') query = query.eq('role', 'rider')
    if (targetAudience === 'drivers') query = query.eq('role', 'driver')

    const { data: targetUsers, error: userError } = await query

    if (userError) throw userError

    // 3. Bulk insert notifications for real-time delivery
    if (targetUsers && targetUsers.length > 0) {
      const notifications = targetUsers.map(u => ({
        user_id: u.id,
        title,
        body: content,
        type: type.toLowerCase() === 'system' ? 'danger' : 'info',
        status: 'unread'
      }))

      const { error: notifyError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications)

      if (notifyError) throw notifyError
    }

    // 4. Log admin action
    await AdminService.logAction('CREATE', 'system_announcements', announcement.id, {
      title,
      target: targetAudience,
      reach: targetUsers?.length || 0
    })

    return announcement
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabaseAdmin
      .from('system_announcements')
      .delete()
      .eq('id', id)

    if (error) throw error

    await AdminService.logAction('DELETE', 'system_announcements', id, { action: 'delete_announcement' })
  }
}
