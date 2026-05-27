import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'

export const PaymentService = {
  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings!payments_booking_id_fkey(*),
        rider:users(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getPayouts() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        wallet:wallets(
          *,
          user:users(*)
        )
      `)
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async refundPayment(paymentId: string, amount: number, reason: string) {
    try {
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (fetchError || !payment) throw new Error('Payment not found')
      if (!payment.paystack_transaction_id) throw new Error('Payment has no associated Paystack transaction ID')

      // 1. Call our internal API to initiate Paystack refund
      const response = await fetch('/api/paystack/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: payment.paystack_transaction_id,
          amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate refund');
      }

      // 2. Update status in database
      const { data, error } = await supabaseAdmin
        .from('payments')
        .update({ 
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single()

      if (error) throw error

      await AdminService.logAction('RESOLVE', 'payments', paymentId, { amount, reason, action: 'refunded' })
      return data
    } catch (error: any) {
      console.error('Refund Payment Error:', error);
      throw error;
    }
  }
}
