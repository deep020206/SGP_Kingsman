import React, { useState } from 'react';
import axios from 'axios';
import OTPModal from './OTPModal';

const OTPTest = () => {
  const [email, setEmail] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [message, setMessage] = useState('');

  const testOTPSend = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      setMessage('Sending OTP...');
      
      // Test login OTP (doesn't require user creation)
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/send-login-otp`, {
        email: email
      });

      console.log('OTP Response:', response.data);
      
      if (response.data.userId) {
        setPendingUserId(response.data.userId);
        setShowOTPModal(true);
        setMessage('OTP sent! Check your email.');
      } else {
        setMessage('Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP Test Error:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleOTPSuccess = (data) => {
    setMessage('OTP Verified Successfully!');
    setShowOTPModal(false);
    console.log('Verification success:', data);
  };

  return (
    <div style={{ 
      padding: '50px', 
      maxWidth: '500px', 
      margin: '0 auto',
      backgroundColor: '#1f2937',
      color: 'white',
      borderRadius: '10px',
      marginTop: '50px'
    }}>
      <h2>OTP Test Page</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Email Address:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '5px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            backgroundColor: '#374151',
            color: 'white'
          }}
        />
      </div>

      <button
        onClick={testOTPSend}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Test Send OTP
      </button>

      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#065f46', 
          borderRadius: '5px' 
        }}>
          {message}
        </div>
      )}

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={email}
        userId={pendingUserId}
        onVerificationSuccess={handleOTPSuccess}
        type="login"
      />
    </div>
  );
};

export default OTPTest;