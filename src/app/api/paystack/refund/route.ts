import { NextResponse } from 'next/server';
import { PaystackBackendService } from '@/lib/services/paystack-backend-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, amount } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    const data = await PaystackBackendService.refundTransaction(transactionId, amount);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Paystack Refund Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
