import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BaseURL from '../components/ApiCreds';
import CustomHeader from '../components/CustomHeader';
import { UserIcon, Mail, Lock } from 'lucide-react';
import { setToken, calculateAge, signup } from '../utils/functions';
import moment from 'moment';

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
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
          focus:ring-blue-500 focus:border-transparent transition-all duration-300
          placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

const genders = ['Male', 'Female', 'Transgender', 'Prefer not to say'];

const SignUpPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const { type } = location.state;

  const handleNavigate = async () => {
    if (!email || !password || !firstName || !username || !confirmPassword || !gender) {
      setError('Please fill all fields');
      return;
    }

    if (!moment(date).isSameOrBefore(moment(new Date()).subtract(1, 'day'))) {
      setError("Please add valid date of birth");
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }
    
    if (!isValidPassword(password)) {
      setError('Invalid password. It should contain at least 8 characters, 1 uppercase letter, and 1 special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password don't match");
      return;
    }

    const userData = {
      username,
      fullName: firstName + " " + (lastName ?? ""),
      email: email?.trim()?.toLowerCase(),
      password,
      confirmPassword,
      source: 'web',
      gender,
      dob: moment(date).format("YYYY-MM-DD"),
      userType: "Patient"
    };

    if (type === 'adult') {
      setIsLoading(true);
      try {
        const response = await signup(userData)
        if (response?.data?.access_token) {
          console.log(response?.data?.access_token)
          await setToken(response?.data?.access_token);
          navigate('/otpScreen', { state: { email: userData?.email, isSignup: true } });
        } else {
          setError(response?.response?.data?.error || response?.data?.error || 'Something went wrong');
        }
      } catch (error) {
        console.log(error);
        console.log(error?.response?.data?.error);
        setError(error?.response?.data?.error || 'An error occurred while signing up');
      }
      setIsLoading(false);
    } else if (type === 'child') {
      const age = calculateAge(date);
      console.log(age)
      if (age >= 18) {
        alert("Oops! Looks like you're under 18. No worries—just pop in your Parent/Guardian's email address to keep going");
       
      }
      navigate("/ConsentGuardian", { state: { data: userData, isChild: true } });
    } else {
      navigate("/SomeoneCareScreen", { state: { data: userData } });
    }
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
    <div className="max-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <CustomHeader title="Sign Up" goBack={() => navigate(-1)} />

      <div className="h-[calc(100vh-64px)] mt-10 p-4">
        <div className="w-full max-w-6xl mx-auto bg-white p-6  rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <img
              src={require('../assets/images/logo.png')}
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl  mb-4 font-bold text-gray-900">
              Sign up to get started with IzzyAI
            </h1>
            <p className="text-sm md:text-lg text-gray-500">
              Please fill in your details to create an account
            </p>
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
                required={true}
              />

              <InputField
                label="Username"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
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

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Your Gender<span className="text-red-500">*</span>
                </label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white"
                >
                  {genders.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={moment(date).format("YYYY-MM-DD")}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  max={moment().format("YYYY-MM-DD")}
                  className="w-full pl-3 pr-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <InputField
                label="Password"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                icon={<Lock className="w-5 h-5" />}
                type="password"
              />

              <InputField
                label="Confirm Password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon={<Lock className="w-5 h-5" />}
                type="password"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 max-w-md mx-auto">
            <CustomButton
              onPress={handleNavigate}
              title="Sign Up"
              loading={isLoading}
            />

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/SignIn')}
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