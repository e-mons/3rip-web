import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

const secretKey = process.env.PAYSTACK_SECRET_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const hash = crypto.createHmac('sha512', secretKey).update(body).digest('hex');
    const signature = request.headers.get('x-paystack-signature');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Process events
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
      case 'transfer.failed':
        await handleTransferFailed(event.data);
        break;
      // Add more event handlers as needed
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleChargeSuccess(data: any) {
  const { reference, id: transactionId, metadata, amount, customer, authorization } = data;
  
  // Update payment in database
  const { error } = await supabaseAdmin
    .from('payments')
    .update({ 
      status: 'captured',
      paystack_transaction_id: transactionId.toString(),
      authorization_code: authorization.authorization_code,
      payment_channel: authorization.channel,
      updated_at: new Date().toISOString()
    })
    .eq('paystack_reference', reference);

  if (error) {
    console.error('Error updating payment on charge.success:', error);
  }

  // Log transaction
  await supabaseAdmin.from('transaction_logs').insert({
    payment_id: (await supabaseAdmin.from('payments').select('id').eq('paystack_reference', reference).single()).data?.id,
    event_type: 'charge.success',
    payload: data
  });
}

async function handleTransferSuccess(data: any) {
  const { reference, transfer_code, amount, recipient } = data;

  // Update withdrawal transaction in database
  const { error } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'completed' })
    .eq('id', reference); // Assuming reference was our internal transaction ID

  if (error) {
    console.error('Error updating transaction on transfer.success:', error);
  }
}

async function handleTransferFailed(data: any) {
  const { reference, amount } = data;

  // 1. Mark transaction as failed
  const { data: tx, error: txError } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'failed' })
    .eq('id', reference)
    .select('wallet_id')
    .single();

  if (txError || !tx) return;

  // 2. Refund wallet balance
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('id', tx.wallet_id)
    .single();

  if (wallet) {
    await supabaseAdmin
      .from('wallets')
      .update({ balance: Number(wallet.balance) + (amount / 100) }) // Paystack amount is in kobo
      .eq('id', tx.wallet_id);
  }
}
