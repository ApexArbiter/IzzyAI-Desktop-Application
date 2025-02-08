import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '../assets/EmailIcon';
import UserIcon from '../assets/UserIcon';
import CustomHeader from '../components/CustomHeader';
import { clinicSignup } from '../utils/functions';

const InputField = ({ label, placeholder, value, onChangeText, icon, type = "text", required = true }) => (
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
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder:text-gray-400"
      />
    </div>
  </div>
);

const CustomButton = ({ onPress, title, loading, className }) => (
  <button
    onClick={onPress}
    className={`w-full px-6 py-3 text-white bg-black rounded-full font-semibold transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    disabled={loading}
  >
    {loading ? (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        Processing...
      </div>
    ) : title}
  </button>
);

function ClinicSignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clinic, setClinic] = useState('');
  const [count, setCount] = useState('');
  const [contact, setContact] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  };

  const onPressSignup = async () => {
    if (!email || !firstName || !lastName || !country || !count || !contact || !clinic || !comments) {
      setError('Please fill all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }

    const userData = {
      first_name: firstName,
      last_name: lastName,
      clinic_name: clinic,
      patients_count: count,
      email: email?.trim()?.toLowerCase(),
      contact_number: contact,
      country: country,
      comments: comments
    };

    setIsLoading(true);
    try {
      const response = await clinicSignup(userData);
      if (response?.response?.data?.error || response?.data?.error) {
        setError(response?.response?.data?.error || response?.data?.error);
      } else {
        navigate(-1);
        alert("Thanks for request. Our team will contact you shortly");
      }
    } catch (error) {
      setError('An error occurred while signing up');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setError(''), 10000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <CustomHeader title="Clinic Sign Up" goBack={() => navigate(-1)} />
      
      <div className="h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <img 
              src={require("../assets/images/logo.png")}
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              Request get started with IzzyAI
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
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
                required={false}
              />

              <InputField
                label="Clinic Name"
                placeholder="Clinic Name"
                value={clinic}
                onChangeText={setClinic}
                icon={<UserIcon className="w-5 h-5" />}
              />

              <InputField
                label="Patient Count"
                placeholder="Patient Count"
                value={count}
                onChangeText={setCount}
                type="number"
              />
            </div>

            <div className="space-y-4">
              <InputField
                label="Country"
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
                icon={<UserIcon className="w-5 h-5" />}
              />

              <InputField
                label="Contact"
                placeholder="Contact"
                value={contact}
                onChangeText={setContact}
                type="tel"
              />

              <InputField
                label="Email"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                icon={<EmailIcon />}
                type="email"
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Comments<span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 max-w-md mx-auto">
            <CustomButton
              onPress={onPressSignup}
              title="Sign Up"
              loading={isLoading}
            />

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signIn')}
                className=" text-black hover:font-black font-bold transition-colors duration-300"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicSignUp;