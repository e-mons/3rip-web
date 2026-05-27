import { NextResponse } from 'next/server';
import { PaystackBackendService } from '@/lib/services/paystack-backend-service';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, driverId, reason, recipientCode, reference } = body;

    // Use Case B: Releasing funds for an existing transaction
    if (recipientCode && reference) {
      if (!amount) {
        return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
      }

      // Initiate Paystack transfer using existing transaction ID as reference
      const data = await PaystackBackendService.initiateTransfer(
        amount,
        recipientCode,
        reference,
        reason || `Payout for transaction ${reference}`
      );

      // Update the transaction status in the database to 'processing'
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'processing' })
        .eq('id', reference);

      return NextResponse.json({ success: true, data });
    }

    // Use Case A: Creating and initiating a new transfer request
    if (!amount || !driverId) {
      return NextResponse.json({ error: 'Missing amount or driverId' }, { status: 400 });
    }

    // 1. Fetch driver's recipient code
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('drivers')
      .select('paystack_recipient_code, users(id, wallets(id, balance))')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      throw new Error('Driver not found or error fetching details');
    }

    if (!driver.paystack_recipient_code) {
      throw new Error('Driver has no Paystack recipient code. Please set up bank details.');
    }

    const wallet = (driver.users as any).wallets?.[0];
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // 2. Create a pending transaction record
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        wallet_id: wallet.id,
        amount: -amount, // Negative for withdrawal
        type: 'withdrawal',
        status: 'processing',
        description: reason || 'Driver payout request'
      })
      .select()
      .single();

    if (txError || !transaction) {
      throw new Error('Failed to create transaction record');
    }

    // 3. Deduct from wallet immediately to prevent double spending
    await supabaseAdmin
      .from('wallets')
      .update({ balance: wallet.balance - amount })
      .eq('id', wallet.id);

    // 4. Initiate Paystack transfer using transaction ID as reference
    try {
      const data = await PaystackBackendService.initiateTransfer(
        amount, 
        driver.paystack_recipient_code, 
        transaction.id, 
        reason || 'Payout'
      );
      return NextResponse.json({ success: true, data });
    } catch (transferError: any) {
      // Rollback if transfer initialization fails
      await supabaseAdmin.from('transactions').update({ status: 'failed' }).eq('id', transaction.id);
      await supabaseAdmin.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
      throw transferError;
    }

  } catch (error: any) {
    console.error('API Paystack Transfer Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
