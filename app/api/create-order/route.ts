import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSessionUser } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials missing in environment variables');
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawAmount = body.amount !== undefined ? Number(body.amount) : 49900; // default ₹499 (in paise)
    const currency = body.currency || 'INR';
    const receipt = body.receipt || `rcpt_${Date.now()}`;

    // Validate minimum amount (>= 100 paise = ₹1)
    if (isNaN(rawAmount) || rawAmount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise (₹1)' },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(rawAmount),
      currency,
      receipt,
      notes: {
        userId: session.userId,
        userEmail: session.email,
        userName: session.name,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
