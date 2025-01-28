import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BaseURL from '../components/ApiCreds';
import CustomHeader from '../components/CustomHeader';
import { UserIcon, Mail, Lock } from 'lucide-react';
import { setToken } from '../utils/functions';

const CustomButton = ({ onPress, title, loading, className }) => {
  return (
    <button
      onClick={onPress}
      className={`w-full max-w-md px-6 py-3 text-white bg-black rounded-full font-semibold 
      transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 
      disabled:cursor-not-allowed ${className}`}
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Processing...
        </div>
      ) : (
        title
      )}
    </button>
  );
};

const InputField = ({ label, placeholder, value, onChangeText, icon, type = "text", required = true }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
          focus:ring-blue-500 focus:border-transparent transition-all duration-300
          placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate(-1);
  };

  const handleNavigate = () => {
    if (!email || !password || !username || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError(
        'Invalid password. It should contain at least 8 characters, 1 uppercase letter, and 1 special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password don't match");
      return;
    }

    setIsLoading(true);

    // Request Data
    const userData = {
      username: username,
      email: email?.trim()?.toLowerCase(),
      password: password,
      confirmPassword: confirmPassword,
      source: 'web', // Web platform
    };

    axios
      .post(`${BaseURL}/signup`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(async (response) => {
        const data = response.data;
        if (data?.access_token) {
          await setToken(data?.access_token);
        }
        if (data.error) {
          setError(data.error);
        } else {
          alert('OTP Sent! An OTP has been sent to your email. Enter it here to continue!');
          navigate('/otpScreen', { state: { isSignup: true, email } });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setError('An error occurred while signing up');
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setError('');
    }, 10000);

    return () => clearTimeout(timer);
  }, [error]);

  const isValidEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  };

  const isValidPassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
    return regex.test(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <CustomHeader title="Sign Up" goBack={() => navigate(-1)} />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src={require('../assets/images/logo.png')}
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-center text-gray-900">
              Sign up to get started with IzzyAI
            </h1>
            <p className="text-center text-gray-500">
              Please fill in your details to create an account
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <InputField
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              icon={<UserIcon className="w-5 h-5" />}
            />

            <InputField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              icon={<Mail className="w-5 h-5" />}
              type="email"
            />

            <InputField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              icon={<Lock className="w-5 h-5" />}
              type="password"
            />

            <InputField
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon={<Lock className="w-5 h-5" />}
              type="password"
            />

            {/* Password Requirements */}
            {/* <div className="text-xs text-gray-500 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>At least 8 characters</li>
                <li>1 uppercase letter</li>
                <li>1 special character</li>
                <li>1 number</li>
              </ul>
            </div> */}

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <CustomButton
              onPress={handleNavigate}
              title="Create Account"
              loading={isLoading}
            />

            {/* Sign In Link */}
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
