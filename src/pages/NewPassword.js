import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import BaseURL from '../components/ApiCreds';
import { getToken } from '../utils/functions';
import CustomHeader from '../components/CustomHeader';

const CustomButton = ({ onClick, title, loading, className }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-6 py-3 text-white bg-[#111920] rounded-xl font-semibold 
      transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 
      disabled:cursor-not-allowed flex items-center justify-center ${className}`}
      disabled={loading}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        title
      )}
    </button>
  );
};

const PasswordInput = ({ value, onChange, placeholder, showPassword, onTogglePassword }) => {
  return (
    <div className="relative w-full mb-5">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[50px] px-3 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-all duration-300 text-gray-900"
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
        hover:text-gray-700 transition-colors"
      >
        {showPassword ? (
          <EyeOffIcon className="w-5 h-5" />
        ) : (
          <EyeIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  console.log(location.state);

  // Handle navigation if email is missing
  useEffect(() => {
    if (!email) {
      navigate('/signin', { replace: true });
    }
  }, [email, navigate]);

  const isValidPassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
    return regex.test(password);
  };

  const clearError = () => {
    setError('');
  };

  const handleChangePassword = async () => {
    // Validation checks
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields!');
      return;
    }

    if (!isValidPassword(newPassword) || !isValidPassword(confirmPassword)) {
      setError(
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    clearError();
    
    try {
      setIsLoading(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append('Email', email);
      formData.append('password', newPassword);
      formData.append('confirmPassword', confirmPassword);

      const response = await fetch(`${BaseURL}/update_password`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      alert('Password updated successfully! Please login with your new password.');
      navigate('/signin', { replace: true });
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If email is missing, render nothing while redirect happens
  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <CustomHeader title="Change Password" goBack={()=>{navigate(-1)}} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl mx-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Change Password
          </h1>

          <div className="space-y-4">
            <PasswordInput
              value={newPassword}
              onChange={(text) => {
                setNewPassword(text);
                clearError();
              }}
              placeholder="New Password"
              showPassword={showPass1}
              onTogglePassword={() => setShowPass1(!showPass1)}
            />

            <PasswordInput
              value={confirmPassword}
              onChange={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
              placeholder="Confirm Password"
              showPassword={showPass2}
              onTogglePassword={() => setShowPass2(!showPass2)}
            />

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <CustomButton
              onClick={handleChangePassword}
              title="Change Password"
              loading={isLoading}
              className="mt-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;