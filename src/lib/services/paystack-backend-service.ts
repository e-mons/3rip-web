const Paystack = require('paystack-node');

const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
const paystack = new Paystack(secretKey);

export const PaystackBackendService = {
  /**
   * Initialize a transaction
   */
  async initializeTransaction(email: string, amount: number, metadata: any, reference?: string) {
    try {
      const response = await paystack.transaction.initialize({
        email,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        metadata,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify`,
        currency: 'AED' // Assuming AED as per the UI
      });
      return response.data;
    } catch (error: any) {
      console.error('Paystack Initialize Error:', error);
      throw new Error(error.message || 'Failed to initialize Paystack transaction');
    }
  },

  /**
   * Verify a transaction
   */
  async verifyTransaction(reference: string) {
    try {
      const response = await paystack.transaction.verify(reference);
      return response.data;
    } catch (error: any) {
      console.error('Paystack Verify Error:', error);
      throw new Error(error.message || 'Failed to verify Paystack transaction');
    }
  },

  /**
   * Create a transfer recipient (for payouts)
   */
  async createTransferRecipient(name: string, accountNumber: string, bankCode: string) {
    try {
      const response = await paystack.transferRecipient.create({
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'AED'
      });
      return response.data;
    } catch (error: any) {
      console.error('Paystack Recipient Error:', error);
      throw new Error(error.message || 'Failed to create Paystack recipient');
    }
  },

  /**
   * Initiate a transfer (payout)
   */
  async initiateTransfer(amount: number, recipientCode: string, reference: string, reason: string) {
    try {
      const response = await paystack.transfer.initiate({
        source: 'balance',
        amount: Math.round(amount * 100),
        recipient: recipientCode,
        reason,
        reference
      });
      return response.data;
    } catch (error: any) {
      console.error('Paystack Transfer Error:', error);
      throw new Error(error.message || 'Failed to initiate Paystack transfer');
    }
  },

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionId: string, amount?: number) {
    try {
      const response = await paystack.refund.create({
        transaction: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined
      });
      return response.data;
    } catch (error: any) {
      console.error('Paystack Refund Error:', error);
      throw new Error(error.message || 'Failed to refund Paystack transaction');
    }
  }
};
