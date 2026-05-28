import { NextResponse } from 'next/server';
import { PaystackBackendService } from '@/lib/services/paystack-backend-service';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, accountNumber, bankCode, userId } = body;

    if (!name || !accountNumber || !bankCode || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = await PaystackBackendService.createTransferRecipient(name, accountNumber, bankCode);
    
    // Save the recipient code to the driver's profile
    const { error } = await supabaseAdmin
      .from('drivers')
      .update({ paystack_recipient_code: data.recipient_code })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Paystack Recipient Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
