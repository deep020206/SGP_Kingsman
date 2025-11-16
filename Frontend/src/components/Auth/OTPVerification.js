import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';

const OTPVerification = ({ 
  email, 
  userId, 
  onVerificationSuccess, 
  onBack,
  type = 'registration' // 'registration' or 'login'
}) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);
  const { login } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Focus first input on mount
  useEffect(() => {
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    setError('');

    // Move to next input
    if (element.value && index < 5) {
      otpRefs.current[index + 1].focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Focus last input or trigger verification
      otpRefs.current[5].focus();
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp: otpCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully!');
        
        // Auto-login user after successful verification
        if (data.token && data.user) {
          login(data.token, data.user);
        }
        
        setTimeout(() => {
          onVerificationSuccess(data);
        }, 1000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(new Array(6).fill(''));
        otpRefs.current[0].focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = type === 'login' ? '/send-login-otp' : '/send-otp';
      const body = type === 'login' 
        ? { email }
        : { email, userId };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New OTP sent to your email!');
        setTimeLeft(300);
        setCanResend(false);
        setOtp(new Array(6).fill(''));
        otpRefs.current[0].focus();
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to
            <br />
            <span className="font-medium text-blue-600">{email}</span>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => otpRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
            ))}
          </div>

          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-600">
                Code expires in <span className="font-medium text-blue-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600">Code has expired</p>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleVerifyOTP()}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={!canResend || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
            </button>

            <button
              onClick={onBack}
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to {type === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
