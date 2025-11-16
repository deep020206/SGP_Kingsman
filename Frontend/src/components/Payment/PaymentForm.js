import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Box, Button, Typography, Alert } from '@mui/material';
import api from '../../api/axios';
import logger from '../../utils/logger';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ orderId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await api.post(`/payments/create-payment-intent/${orderId}`);
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        logger.error('Failed to create payment intent', {
          orderId,
          error: err.message
        });
        setError('Failed to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, [orderId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        onError(stripeError.message);
        logger.error('Payment confirmation failed', {
          orderId,
          error: stripeError.message
        });
      } else if (paymentIntent.status === 'succeeded') {
        logger.info('Payment successful', {
          orderId,
          paymentIntentId: paymentIntent.id
        });
        onSuccess(paymentIntent);
      }
    } catch (err) {
      logger.error('Payment processing failed', {
        orderId,
        error: err.message
      });
      setError('An unexpected error occurred. Please try again.');
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Amount to pay: ${amount.toFixed(2)}
        </Typography>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mt: 2 }}
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

const PaymentWrapper = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
);

export default PaymentWrapper;