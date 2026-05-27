import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'
import { Payout } from '../types'

export const PayoutService = {
  async getPayouts(): Promise<Payout[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        wallet:wallet_id (
          balance,
          user:user_id (
            id,
            first_name,
            last_name,
            email,
            drivers:drivers(
              paystack_recipient_code,
              status
            )
          )
        )
      `)
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as any as Payout[]
  },



  async releaseFunds(transactionId: string) {
    try {
      // 1. Get transaction and wallet details
      const { data: transaction, error: txError } = await supabaseAdmin
        .from('transactions')
        .select(`
          *,
          wallet:wallet_id (
            balance,
            user:user_id (
              first_name,
              last_name,
              email,
              drivers:drivers(paystack_recipient_code)
            )
          )
        `)
        .eq('id', transactionId)
        .single();

      if (txError || !transaction) throw new Error('Transaction not found');
      
      const driver = (transaction.wallet as any).user;
      const recipientCode = driver.drivers?.[0]?.paystack_recipient_code;
      
      if (!recipientCode) {
        throw new Error('Driver has no Paystack recipient code configured');
      }

      // 2. Call our internal API to initiate Paystack transfer
      const response = await fetch('/api/paystack/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.abs(Number(transaction.amount)),
          recipientCode: recipientCode,
          reference: transactionId,
          reason: `Payout for transaction ${transactionId}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate transfer');
      }

      // 3. Log action
      await AdminService.logAction('UPDATE', 'transactions', transactionId, { 
        action: 'release_funds_initiated',
        status: 'processing'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Release Funds Error:', error);
      throw error;
    }
  },

  async getAnalytics() {
    const { data: withdrawals, error } = await supabase
      .from('transactions')
      .select('amount, status')
      .eq('type', 'withdrawal')

    if (error) throw error

    const { data: drivers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'driver')

    const totalPending = withdrawals
      ?.filter(w => w.status === 'pending')
      .reduce((acc, w) => acc + Math.abs(Number(w.amount)), 0) || 0
    
    const processedMtd = withdrawals
      ?.filter(w => w.status === 'completed')
      .reduce((acc, w) => acc + Math.abs(Number(w.amount)), 0) || 0

    return {
      totalPending,
      processedMtd,
      activeDrivers: drivers?.length || 0,
      failedPayouts: withdrawals?.filter(w => w.status === 'failed').length || 0
    }
  }
}
