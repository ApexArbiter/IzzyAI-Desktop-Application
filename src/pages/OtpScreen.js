import React, { useState, useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom'; // Using React Router for navigation
import BaseURL from '../components/ApiCreds';
import { getToken, resendOtp, verifySignupOtp } from '../utils/functions';
import Loader from '../components/Loader'; // You can adjust this to fit your custom Loader component

const OtpScreen = () => {
    
      const location = useLocation();
  const { email, isSignup } = location.state || {}; // Assuming React Router for passing state
  const otpInputs = useRef([]);
  const history = useNavigate();

  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [loader, setLoader] = useState(false);

  const focusInput = (index) => {
    otpInputs.current[index].focus();
  };

  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join('');
    if (enteredOTP.length === 6) {
      const formData = new FormData();
      formData.append('Email', email);
      formData.append('otp', enteredOTP);
      try {
        if (isSignup) {
          const response = await verifySignupOtp({ email: email?.trim()?.toLowerCase(), otp: enteredOTP });
          console.log(response.data.message);
            if (response?.data?.message === 'OTP verified successfully.') {
            history('/signInPage'); // Redirect to Sign In page
          }
        } else {
          const response = await fetch(`${BaseURL}/verify_otp`, {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            history('/newPassword', { email: email });
          } else {
            alert('Invalid OTP!');
          }
        }
      } catch (error) {
        alert('An error occurred while verifying OTP. Please try again.');
      }
    } else {
      alert('Invalid OTP!', 'Please enter a 6-digit OTP.');
    }
  };

  const handleInputChange = (value, index) => {
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    if (value) {
      if (index <5) {
        focusInput(index + 1);
      }
    } else if (index > 0) {
      focusInput(index - 1);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Enter OTP</h2>

      <div style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => (otpInputs.current[index] = ref)}
            style={styles.input}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleInputChange(e.target.value, index)}
          />
        ))}
      </div>

      {isSignup && (
        <button
          onClick={async () => {
            setLoader(true);
            const response = await resendOtp({ email: email?.trim()?.toLowerCase() });
            alert(response?.data?.message);
            setLoader(false);
          }}
          style={styles.resendButton}
        >
          Resend OTP
        </button>
      )}

      <button style={styles.button} onClick={handleVerifyOTP}>
        {loader ? <div>Loading...</div> : 'Done'}
      </button>

      {loader && <Loader loading={loader} />}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    minHeight: '100vh',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#111920',
  },
  otpContainer: {
    display: 'flex',
    marginBottom: '20px',
  },
  input: {
    width: '45px',
    height: '45px',
    borderWidth: '1px',
    borderColor: '#ccc',
    borderRadius: '10px',
    padding: '10px',
    marginRight: '8px',
    fontSize: '18px',
    textAlign: 'center',
  },
  button: {
    width: '85%',
    borderRadius: '50px',
    alignItems: 'center',
    backgroundColor: '#111920',
    padding: '10px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  resendButton: {
    alignSelf: 'center',
    height: '40px',
    justifyContent: 'center',
    width: '120px',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '20px',
    fontSize: '16px',
    color: '#111920',
    marginTop: '10px',
  },
};

export default OtpScreen;
