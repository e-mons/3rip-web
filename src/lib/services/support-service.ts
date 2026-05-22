import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'
import { SupportTicket, SupportMessage } from '../types'

export const SupportService = {
  async getTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as any as SupportTicket[]
  },

  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    const { data, error } = await supabase
      .from('ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as SupportMessage[]
  },

  async replyToTicket(ticketId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: reply, error } = await supabaseAdmin
      .from('ticket_replies')
      .insert({
        ticket_id: ticketId,
        user_id: user?.id,
        content,
        is_admin_reply: true
      })
      .select()
      .single()

    if (error) throw error

    // Update ticket status to in_progress if it was open
    await supabaseAdmin
      .from('support_tickets')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .eq('status', 'open')

    await AdminService.logAction('UPDATE', 'support_tickets', ticketId, { action: 'reply_sent' })

    return reply
  },

  async resolveTicket(ticketId: string) {
    const { error } = await supabaseAdmin
      .from('support_tickets')
      .update({ 
        status: 'closed', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', ticketId)

    if (error) throw error

    await AdminService.logAction('UPDATE', 'support_tickets', ticketId, { action: 'resolve_ticket' })
  }
}
