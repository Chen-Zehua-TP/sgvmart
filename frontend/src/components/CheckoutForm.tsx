import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  disabled?: boolean;
}

export default function CheckoutForm({ onSuccess, disabled }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || disabled) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onSuccess(paymentIntent.id);
      } else {
        setErrorMessage('Payment was not successful. Please try again.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || disabled}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
          !stripe || isProcessing || disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay Now`
        )}
      </button>

      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Your payment information is encrypted and secure</p>
      </div>
    </form>
  );
}
