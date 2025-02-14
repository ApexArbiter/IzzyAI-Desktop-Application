import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BaseURL from '../components/ApiCreds';
import { getToken, resendOtp, verifySignupOtp } from '../utils/functions';
import Loader from '../components/Loader';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';

const OtpScreen = () => {
  const location = useLocation();
  const { email, isSignup } = location.state || {};
  const otpInputs = useRef([]);
  const history = useNavigate();


  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState('');



  // Handle paste functionality
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOTP = [...otp];
      pastedData.split('').forEach((digit, index) => {
        if (index < 6) newOTP[index] = digit;
      });
      setOTP(newOTP);
      focusInput(Math.min(pastedData.length, 5));
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join('');
    if (enteredOTP.length !== 6) {
      alert('Please enter a 6-digit OTP');
      return;
    }

    setLoader(true);
    try {
      const token = await getToken();
      if (isSignup) {
        const response = await verifySignupOtp({
          email: email?.trim()?.toLowerCase(),
          otp: enteredOTP
        });
        if (response?.data?.message === 'OTP verified successfully.') {
          history('/SignIn');
        }
      } else {
        const formData = new FormData();
        formData.append('Email', email);
        formData.append('otp', enteredOTP);

        const response = await fetch(`${BaseURL}/verify_otp`, {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
          const data = await response.json();
          history('/newPassword', { state: { email: email } });
        } else {
          alert('Invalid OTP. Please try again.');
        }
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoader(false);
    }
  };

  const handleInputChange = (value, index) => {
    if (/^\d?$/.test(value)) { // Allow only single digits or empty
      const newOTP = [...otp];
      newOTP[index] = value;
      setOTP(newOTP);
      if (value && index < 5) {
        focusInput(index + 1);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
      const newOTP = [...otp];
      newOTP[index - 1] = '';
      setOTP(newOTP);
    }
  };

  const handleResendOTP = async () => {
    setLoader(true);
    try {
      const response = await resendOtp({ email: email?.trim()?.toLowerCase() });
      alert(response?.data?.message); // Show alert like React Native version
    } catch (error) {
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f1f1] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#111920]" />
          </div>
          <h2 className="text-2xl font-bold text-[#111920] mb-2">Verify OTP</h2>
          <p className="text-gray-600 text-sm">
            Enter the verification code sent to
            <br />
            <span className="font-medium text-[#111920]">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(ref) => (otpInputs.current[index] = ref)}
              className="w-12 h-12 border-2 rounded-lg text-center text-xl font-semibold text-[#111920]
                     focus:border-[#111920] focus:ring-2 focus:ring-gray-200 transition-all
                     outline-none"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-center text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerifyOTP}
          disabled={loader || otp.join('').length !== 6}
          className="w-full bg-[#111920] text-white rounded-full py-3 font-semibold
                 flex items-center justify-center gap-2 hover:bg-gray-800
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loader ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Verify OTP
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Resend OTP */}
        {/* Resend OTP */}
        {isSignup && (
          <div className="mt-6 text-center">
            <button
              onClick={handleResendOTP}
              disabled={loader}
              className="flex items-center justify-center gap-2 mx-auto text-[#111920] hover:text-gray-800
               disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Resend OTP</span>
            </button>
          </div>
        )}
      </div>

      {loader && <Loader loading={loader} />}
    </div>
  );
};

export default OtpScreen;