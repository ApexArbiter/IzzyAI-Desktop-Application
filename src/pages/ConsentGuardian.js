import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserIcon, Mail } from 'lucide-react';
import { registerGuardian, setToken, signup} from '../utils/functions';
import CustomHeader from '../components/CustomHeader';
import axios from 'axios';
import BaseURL from '../components/ApiCreds';

const CustomButton = ({ onPress, title, loading, className }) => {
  return (
    <button
      onClick={onPress}
      className={`w-full px-6 py-3 text-white bg-black rounded-full font-semibold 
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
    <div className="space-y-1.5">
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
          value={value || ''}
          onChange={(e) => onChangeText(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
          focus:ring-blue-500 focus:border-transparent transition-all duration-300
          placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

const isValidEmail = (email) => {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const ConsentGuardian = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isSomeone, isChild } = location.state;

  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [relation, setRelation] = useState(null);
  const [email, setEmail] = useState(data?.email);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onPressNext = async () => {
    if (!firstName || !lastName || !email || !relation) {
      setError('Please fill all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }

    try {
      setIsLoading(true);
      const signupresponse = await signup(data)
      console.log(signupresponse)

      if (signupresponse?.data?.access_token) {
        await setToken(signupresponse?.data?.access_token);
      }
      
      if (signupresponse?.data?.error || signupresponse?.response?.data?.error) {
        setError(signupresponse?.data?.error || signupresponse?.response?.data?.error);
      } else {
        const userData = {
          firstName,
          lastName,
          relationshipToUser: relation,
          emailAddress: email?.trim()?.toLowerCase(),
          accountType: isChild ? "My Child" : "Someone I Care For",
          consentCapacity: "YES",
          consentStatus: true,
          userId: signupresponse?.data?.user_id,
        };
        
        const response = await registerGuardian(userData);
        if (response?.data) {
          navigate("/otpScreen", { state: { email: data?.email, isSignup: true }});
        } else {
          setError(response?.data?.error || response?.response?.data?.error);
        }
      }
    } catch (error) {
        console.error(error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <CustomHeader title="Consent Process" goBack={() => navigate(-1)} />

      <div className="h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <img
              src={require('../assets/images/logo.png')}
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            {isSomeone ? "Legal Representative Details" : "Parents & Guardians Details"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              icon={<UserIcon className="w-5 h-5" />}
            />

            <InputField
              label="Last Name"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              icon={<UserIcon className="w-5 h-5" />}
            />

            <InputField
              label="Relationship"
              placeholder="Relation"
              value={relation}
              onChangeText={setRelation}
              icon={<UserIcon className="w-5 h-5" />}
            />

            <InputField
              label="Email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              icon={<Mail className="w-5 h-5" />}
              type="email"
            />
          </div>

          {error && (
            <div className="mt-6 text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="mt-8">
            <CustomButton
              onPress={onPressNext}
              title="Next"
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentGuardian;