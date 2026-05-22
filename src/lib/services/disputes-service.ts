import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'

export const DisputeService = {
  async getDisputes() {
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        rider:rider_id (
          first_name,
          last_name
        ),
        driver:driver_id (
          users (
            first_name,
            last_name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async resolveDispute(disputeId: string, verdict: 'refunded' | 'upheld', notes: string) {
    const { error } = await supabaseAdmin
      .from('disputes')
      .update({
        status: `resolved_${verdict}`,
        verdict,
        verdict_notes: notes,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', disputeId)

    if (error) throw error

    await AdminService.logAction('UPDATE', 'disputes', disputeId, { 
      action: 'resolve_dispute', 
      verdict,
      notes 
    })
  },

  async getAnalytics() {
    const { data, error } = await supabase
      .from('disputes')
      .select('status, disputed_amount')

    if (error) throw error

    const stats = {
      pending: data.filter(d => d.status === 'under_review').length,
      resolvedMtd: data.filter(d => d.status.startsWith('resolved')).length,
      totalAmount: data.reduce((acc, d) => acc + Number(d.disputed_amount), 0)
    }

    return stats
  }
}
