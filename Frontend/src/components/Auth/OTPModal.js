import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_URL } from '../../config/api';

const OTPModal = ({ 
  isOpen, 
  onClose, 
  email, 
  userId, 
  sessionId,
  userData,
  tempToken, 
  onVerificationSuccess, 
  type = 'registration' // 'registration', 'signup', or 'login'
}) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, isOpen]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0].focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(new Array(6).fill(''));
      setError('');
      setSuccess('');
      setTimeLeft(300);
      setCanResend(false);
    }
  }, [isOpen]);

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
      let response;
      
      if (type === 'signup') {
        // For signup, verify OTP and create account
        response = await axios.post(`${API_URL}/auth/verify-signup-otp`, {
          sessionId,
          otp: otpCode,
          userData
        });
      } else {
        // For login/registration, use regular OTP verification
        response = await axios.post(`${API_URL}/auth/verify-otp`, {
          userId,
          otp: otpCode
        });
      }

      setSuccess(type === 'signup' ? 'Account created successfully!' : 'Email verified successfully!');
      
      setTimeout(() => {
        onVerificationSuccess(response.data);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(new Array(6).fill(''));
      otpRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint, data;
      
      if (type === 'signup') {
        endpoint = '/resend-otp';
        data = { email, type: 'signup', sessionId };
      } else if (type === 'login') {
        endpoint = '/send-login-otp';
        data = { email };
      } else {
        endpoint = '/send-otp';
        data = { email, userId };
      }

      await axios.post(`${API_URL}/auth${endpoint}`, data);

      setSuccess('New OTP sent to your email!');
      setTimeLeft(300);
      setCanResend(false);
      setOtp(new Array(6).fill(''));
      otpRefs.current[0].focus();
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
          onClick={onClose}
          disabled={isLoading}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
          <p className="text-gray-300 text-sm">
            We've sent a 6-digit code to
            <br />
            <span className="font-medium text-yellow-400">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-md text-sm mb-4">
            {success}
          </div>
        )}

        <div className="flex justify-center space-x-3 mb-6">
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
              className="w-12 h-12 text-center text-xl font-bold bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-colors"
              disabled={isLoading}
            />
          ))}
        </div>

        <div className="text-center mb-4">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-400">
              Code expires in <span className="font-medium text-yellow-400">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-400">Code has expired</p>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => handleVerifyOTP()}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          <button
            onClick={handleResendOTP}
            disabled={!canResend || isLoading}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;