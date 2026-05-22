import crypto from 'crypto'

/**
 * Script to simulate a Paystack transfer.success webhook event.
 * This helps verify the financial reconciliation logic without a real Paystack environment.
 */

const PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key' // Should match what's in .env.local for testing
const WEBHOOK_URL = 'http://localhost:3000/api/paystack/webhook'

// 1. Define the mock event data
const mockEvent = {
  event: 'transfer.success',
  data: {
    id: 123456,
    domain: 'test',
    amount: 500000, // 5000 units (e.g. NGN) in kobo
    currency: 'NGN',
    reference: 'TRANSACTION_ID_HERE', // Replace this with a real transaction ID from your DB
    status: 'success',
    transfer_code: 'TRF_123456789',
    recipient: {
      domain: 'test',
      type: 'nuban',
      recipient_code: 'RCP_123456789',
      name: 'Mock Driver',
      details: {
        account_number: '0123456789',
        bank_code: '011',
        bank_name: 'First Bank of Nigeria'
      }
    }
  }
}

async function simulateWebhook(txId: string) {
  mockEvent.data.reference = txId
  const body = JSON.stringify(mockEvent)
  
  // 2. Generate the signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex')

  console.log(`🚀 Simulating transfer.success for Transaction: ${txId}`)
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': hash
      },
      body: body
    })

    const result = await response.json()
    console.log('✅ Response:', result)
  } catch (error) {
    console.error('❌ Failed to simulate webhook:', error)
  }
}

// Usage: node simulate-payout.js <TRANSACTION_ID>
const txId = process.argv[2]
if (!txId) {
  console.error('Please provide a Transaction ID: ts-node simulate-payout.ts <ID>')
} else {
  simulateWebhook(txId)
}
