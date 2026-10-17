import crypto from 'crypto';

interface PaystackInitParams {
  email: string;
  amountInKobo: number; // Paystack requires amount in Kobo (Naira * 100)
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  isSandboxMode?: boolean;
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id?: number;
    status: 'success' | 'failed' | 'abandoned' | 'pending';
    reference: string;
    amount: number; // in kobo
    gateway_response?: string;
    paid_at?: string;
    channel?: string;
    currency: string;
    ip_address?: string;
    customer?: {
      email?: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
  };
  isSandboxMode?: boolean;
}

export class PaystackService {
  private secretKey: string;
  private publicKey: string;
  private isConfigured: boolean;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
    // Check if real key is configured (i.e. starts with sk_test_ or sk_live_ and not placeholder)
    this.isConfigured =
      Boolean(this.secretKey) &&
      !this.secretKey.includes('example_secret_key') &&
      (this.secretKey.startsWith('sk_test_') || this.secretKey.startsWith('sk_live_'));
  }

  getPublicKey(): string {
    return this.publicKey || 'pk_test_demo_public_key_naijavibe';
  }

  getMode(): 'live' | 'test' | 'sandbox' {
    if (this.secretKey.startsWith('sk_live_')) return 'live';
    if (this.isConfigured) return 'test';
    return 'sandbox';
  }

  /**
   * Initializes a transaction with Paystack API.
   * If valid Paystack secret key is configured, calls the official Paystack endpoint.
   * If in development/sandbox mode, returns a seamless checkout configuration.
   */
  async initializeTransaction(params: PaystackInitParams): Promise<PaystackInitResponse> {
    if (this.isConfigured) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: params.email,
            amount: params.amountInKobo,
            reference: params.reference,
            callback_url: params.callbackUrl,
            metadata: params.metadata,
            channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
          }),
        });

        const data = (await response.json()) as PaystackInitResponse;
        if (!response.ok || !data.status) {
          throw new Error(data.message || 'Failed to initialize Paystack transaction');
        }
        return { ...data, isSandboxMode: false };
      } catch (err: any) {
        console.warn('[Paystack] API initialize error:', err?.message || err);
        throw new Error(err?.message || 'Paystack initialization failed');
      }
    }

    // High-fidelity Built-in Sandbox Mode:
    // Enables testing all flows (card, bank transfer, USSD, success, simulated failure)
    // without requiring users to input their real credit cards or external credentials.
    return {
      status: true,
      message: 'Sandbox transaction initialized successfully',
      isSandboxMode: true,
      data: {
        authorization_url: `/checkout/sandbox?reference=${encodeURIComponent(
          params.reference
        )}&amount=${params.amountInKobo}&email=${encodeURIComponent(params.email)}`,
        access_code: `demo_acc_${Math.floor(100000 + Math.random() * 900000)}`,
        reference: params.reference,
      },
    };
  }

  /**
   * Verifies transaction with Paystack using secret key.
   * STRICT SERVER-SIDE VALIDATION: Verifies amount in Kobo, status 'success', and reference.
   */
  async verifyTransaction(
    reference: string,
    expectedAmountInNaira: number,
    sandboxAction: 'success' | 'failed' = 'success'
  ): Promise<PaystackVerifyResponse> {
    if (this.isConfigured) {
      try {
        const response = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.secretKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = (await response.json()) as PaystackVerifyResponse;
        if (!response.ok || !data.status) {
          throw new Error(data.message || 'Paystack verification request failed');
        }

        // Enforce strict security validations:
        const expectedKobo = expectedAmountInNaira * 100;
        if (data.data.amount !== expectedKobo) {
          throw new Error(
            `Payment amount mismatch! Expected ${expectedKobo} kobo, received ${data.data.amount} kobo.`
          );
        }
        if (data.data.currency !== 'NGN') {
          throw new Error(`Invalid currency! Expected NGN, received ${data.data.currency}.`);
        }
        if (data.data.status !== 'success') {
          throw new Error(`Payment verification status is not successful: ${data.data.status}`);
        }

        return { ...data, isSandboxMode: false };
      } catch (err: any) {
        console.error('[Paystack] Verification failed:', err?.message || err);
        throw err;
      }
    }

    // Sandbox Verification:
    if (sandboxAction === 'failed') {
      return {
        status: false,
        message: 'Transaction failed (Simulated Sandbox Rejection)',
        isSandboxMode: true,
        data: {
          status: 'failed',
          reference,
          amount: expectedAmountInNaira * 100,
          currency: 'NGN',
          gateway_response: 'The customer bank declined the transaction in sandbox mode',
        },
      };
    }

    return {
      status: true,
      message: 'Transaction successfully verified (Paystack Sandbox)',
      isSandboxMode: true,
      data: {
        id: Math.floor(10000000 + Math.random() * 90000000),
        status: 'success',
        reference,
        amount: expectedAmountInNaira * 100,
        currency: 'NGN',
        gateway_response: 'Successful approval (Paystack Test Verification)',
        channel: 'card',
        paid_at: new Date().toISOString(),
        ip_address: '102.89.23.14',
      },
    };
  }

  /**
   * Validates Paystack webhook HMAC SHA-512 signature.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.secretKey) return true; // in sandbox accept
    try {
      const hash = crypto
        .createHmac('sha512', this.secretKey)
        .update(rawBody)
        .digest('hex');
      return hash === signature;
    } catch {
      return false;
    }
  }
}

export const paystack = new PaystackService();
