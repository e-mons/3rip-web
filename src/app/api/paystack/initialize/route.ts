import { NextResponse } from 'next/server';
import { PaystackBackendService } from '@/lib/services/paystack-backend-service';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, amount, metadata } = body;

    if (!email || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Generate a unique reference
    const reference = `3rip_${crypto.randomBytes(8).toString('hex')}`;

    // 2. Create a pending payment record
    // Note: We need a rider_id from metadata or session. 
    // For now, we'll try to get it from metadata.
    const riderId = metadata?.user_id;
    const bookingId = metadata?.booking_id;

    if (riderId && bookingId) {
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          booking_id: bookingId,
          rider_id: riderId,
          amount: amount,
          currency: 'NGN',
          status: 'pending',
          payment_method: 'paystack',
          paystack_reference: reference
        });

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // We continue anyway, as Paystack will still work, but reconciliation might be harder
      }
    }

    // 3. Initialize transaction with our reference
    const data = await PaystackBackendService.initializeTransaction(email, amount, {
      ...metadata,
      custom_reference: reference
    }, reference);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Paystack Initialize Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
