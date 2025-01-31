import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import CustomHeader from '../components/CustomHeader';
import { useDataContext } from '../contexts/DataContext';
import { changeUserPassword } from '../utils/functions';

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

const InputField = ({ label, placeholder, value, onChangeText, icon, type = "password", required = true }) => {
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

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { userDetail, updateUserDetail } = useDataContext();
  const navigate = useNavigate();

  const handleChange = async () => {
    if (!oldPassword || !password) {
      setError('Old and new password are required');
      return;
    }
    if (password?.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (confirmPassword !== password) {
      setError('Password & Confirm Password must be the same');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    formData.append('Email', userDetail?.email?.trim()?.toLowerCase());
    formData.append('oldPassword', oldPassword);
    formData.append('newPassword', password);
    formData.append('confirmNewPassword', confirmPassword);

    try {
      setError("")
      const response = await changeUserPassword(formData);
      setIsLoading(false);
      console.log(response)
      if (response?.status === 200) {
        alert('Password Updated Successfully');
        updateUserDetail({});
        navigate('/');
      } else {
        setError(response?.response?.data?.error || 'Something went wrong');
      }
    } catch (error) {
      setIsLoading(false);
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <CustomHeader title="Change Password" goBack={() => navigate(-1)} />

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
              Change Your Password
            </h1>
            <p className="text-center text-gray-500">
              Please enter your old and new password
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <InputField
              label="Old Password"
              placeholder="Enter your old password"
              value={oldPassword}
              onChangeText={setOldPassword}
              icon={<Lock className="w-5 h-5" />}
            />

            <InputField
              label="New Password"
              placeholder="Enter your new password"
              value={password}
              onChangeText={setPassword}
              icon={<Lock className="w-5 h-5" />}
            />

            <InputField
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon={<Lock className="w-5 h-5" />}
            />

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Change Password Button */}
            <CustomButton
              onPress={handleChange}
              title="Change Password"
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;