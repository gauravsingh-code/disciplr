'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface RazorpayCheckoutButtonProps {
  amountInPaise?: number; // e.g. 49900 = ₹499
  currency?: string;
  itemName?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'glow';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onSuccess?: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

// Helper to dynamically load the Razorpay checkout script if not already loaded
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export function RazorpayCheckoutButton({
  amountInPaise = 49900,
  currency = 'INR',
  itemName = 'Disciplr Pro Membership',
  description = 'Unlock unlimited pods, streak protections, and pro analytics',
  customerName,
  customerEmail,
  buttonText,
  variant = 'glow',
  size = 'md',
  fullWidth = false,
  className = '',
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const displayAmount = (amountInPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  });

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);

      // Step 1: Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Could not load Razorpay Checkout SDK. Please check your internet connection.');
      }

      // Step 2: Create Order on Backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || 'Failed to create payment order on server');
      }

      const keyId =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        orderData.key ||
        'rzp_test_TYi8C8ZVDjQ0aH';

      // Step 3: Open Razorpay Standard Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Disciplr',
        description: description,
        image: '/favicon.ico',
        order_id: orderData.order_id,
        prefill: {
          name: customerName || '',
          email: customerEmail || '',
        },
        theme: {
          color: '#f97316', // Disciplr orange accent
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatusMessage({
              type: 'info',
              text: 'Payment cancelled by user.',
            });
            onDismiss?.();
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 4: Verify Payment Signature on Backend
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setStatusMessage({
                type: 'success',
                text: `Payment verified! ID: ${response.razorpay_payment_id}`,
              });
              onSuccess?.(response);
            } else {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }
          } catch (verifyError: any) {
            console.error('Payment verification failed:', verifyError);
            setStatusMessage({
              type: 'error',
              text: verifyError?.message || 'Payment verification failed.',
            });
            onFailure?.(verifyError);
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on('payment.failed', (response: any) => {
        setLoading(false);
        const errorDesc = response.error?.description || 'Payment was unsuccessful.';
        setStatusMessage({
          type: 'error',
          text: `Payment Failed: ${errorDesc}`,
        });
        onFailure?.(response.error);
      });

      razorpayInstance.open();
    } catch (error: any) {
      console.error('Razorpay checkout error:', error);
      setLoading(false);
      setStatusMessage({
        type: 'error',
        text: error?.message || 'Something went wrong during checkout.',
      });
      onFailure?.(error);
    }
  };

  return (
    <div className={`inline-flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        isLoading={loading}
        onClick={handleCheckout}
        className={className}
        leftIcon={loading ? undefined : <CreditCard className="w-4 h-4" />}
      >
        {buttonText || `Pay ${displayAmount}`}
      </Button>

      {statusMessage && (
        <div
          className={`flex items-start gap-2 p-2.5 rounded-xl text-xs transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : 'bg-zinc-800/80 border border-zinc-700 text-zinc-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-snug">{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
