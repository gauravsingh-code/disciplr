import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSessionUser } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is missing');
      return NextResponse.json(
        { success: false, error: 'Payment gateway configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate presence of required verification parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature',
        },
        { status: 400 }
      );
    }

    // Generate expected HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Constant-time signature comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8');

    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      console.warn('Razorpay signature mismatch:', {
        razorpay_order_id,
        razorpay_payment_id,
      });
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Payment could not be verified.' },
        { status: 400 }
      );
    }

    // Optional: Log verified payment with authenticated user
    const session = await getSessionUser();
    console.log(`Payment successfully verified for order ${razorpay_order_id}:`, {
      paymentId: razorpay_payment_id,
      user: session ? session.userId : 'anonymous',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
  } catch (error: any) {
    console.error('Razorpay verify-payment error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
