import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseURL from '../components/ApiCreds';
import { useDataContext } from '../contexts/DataContext';
import CustomHeader from '../components/CustomHeader';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import GoogleIcon from '../assets/GoogleIcon';
import AppleIcon from '../assets/AppleIcon';
import { getGoogleToken, googleLogin, isIOS, resendOtp, setToken } from '../utils/functions';
import EmailPopup from '../components/EmailPopup';

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

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgetLoading, setForgetLoading] = useState(false);
  const [forgetError, setForgetError] = useState('');
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const { updateUserId, updateUserDetail, setQuestionReport } = useDataContext();
  const navigate = useNavigate();

  const navigateAfterLogin = (isFace = false, route = 'main', params = {}) => {
    if (isFace) {
      navigate('/scanfaceInstruction', { 
        state: { 
          routeName: 'baselineQuestions', 
          nextPage: 'faceauthenticationscreen'
        } 
      });
    } else {
      navigate(route, { state: params });
    }
  };

  const checkUserInfo = async (data) => {
    if (data?.access_token) {
      localStorage.setItem('token', data?.access_token);
    }
    
    updateUserId(data?.USERID);
    
    if (data?.error) {
      setIsLoading(false);
      setError(data.error);
      return;
    }

    if (!data?.IsOTPVerified) {
      setIsLoading(false);
      await resendOtp({ email: data?.email ?? email?.trim()?.toLowerCase() });
      navigate("/otpScreen", { 
        state: { 
          isSignup: true, 
          email: data?.email ?? email?.trim()?.toLowerCase() 
        } 
      });
      return;
    }

    try {
      const response = await fetch(`${BaseURL}/userdata_info/${data?.USERID}`, {
        headers: { 'Authorization': 'Bearer ' + data?.access_token }
      });
      const responseData = await response.json();
      console.log("userdata_info",responseData)

      localStorage.setItem("isTerms", JSON.stringify(true));
      const quesReport = localStorage.getItem("questionReport");
      setQuestionReport(JSON.parse(quesReport));

      updateUserDetail({
        UserID: data?.USERID,
        FullName: responseData?.UserProfile?.FullName,
        Age: responseData?.UserProfile?.Age,
        AvatarID: responseData?.UserProfile?.AvatarID,
        email: email,
        UserType: responseData?.UserType?.UserType,
        Gender: responseData?.UserProfile?.Gender,
        SubscriptionDetails: responseData?.SubscriptionDetails,
        DaysLeft: responseData?.DaysLeft,
        Amount: responseData?.SubscriptionDetails?.Amount ?? 0,
      });

      setIsLoading(false);

      // Navigation logic
      if (!responseData?.UserProfile?.CheckboxValues) {
        navigateAfterLogin(false, "/setupProfile");
      } else if (responseData?.UserProfile?.CheckboxValues && !responseData?.UserProfile?.AvatarID) {
        navigateAfterLogin(false, "/setupProfile1");
      } else if (!responseData?.MicCameraTestReport?.CamQualityPrecent || !responseData?.MicCameraTestReport?.MicQualityPrecent) {
        navigateAfterLogin(false, "/setupProfile2");
      } else if (!JSON.parse(localStorage.getItem("isTerms"))) {
        navigateAfterLogin(false, "/setupProfile4");
      } else if (responseData?.FaceAuthentication?.FaceSnapshotURL?.length < 1 || !responseData?.FaceAuthentication?.FaceSnapshotURL) {
        navigateAfterLogin(true);
      } else if (!responseData?.InitialQuestions?.Answer) {
        navigateAfterLogin(false, "/baselineQuestions");
      } else {
        localStorage.setItem("questionReport", responseData?.InitialquestionLogic?.InitialquestionLogic);
        setQuestionReport(JSON.parse(responseData?.InitialquestionLogic?.InitialquestionLogic));

        if (responseData?.SubscriptionDetails?.Plan === 'annual' && responseData?.DaysLeft <= 14) {
          alert(`Your subscription will expire in ${responseData?.DaysLeft} ${responseData?.DaysLeft > 0 ? "days" : "day"}. Renew now!`);
        }
        navigate('/home');
      }
    } catch (error) {
      setIsLoading(false);
      setError('An error occurred while fetching answers');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BaseURL}/new_login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email?.trim()?.toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();
      await checkUserInfo(data);
    } catch (error) {
      setIsLoading(false);
      setError('An error occurred while signing in');
    }
  };

  const handleForgetPassword = async (forgetEmail) => {
    if (!forgetEmail) {
      setForgetError('Email is required');
      return;
    }

    setForgetLoading(true);

    const formData = new FormData();
    formData.append('Email', forgetEmail);

    try {
      const response = await fetch(`${BaseURL}/generate_otp`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data?.error) {
        setForgetError(data.error);
      } else {
        navigate('/otpScreen', { state: { email: forgetEmail } });
        setShowEmailPopup(false);
        setForgetError('');
      }
    } catch (error) {
      alert('An unexpected error occurred!');
    } finally {
      setForgetLoading(false);
    }
  };

  const onPressGoogle = async () => {
    try {
      const googleData = await getGoogleToken();
      if (googleData?.idToken) {
        const response = await googleLogin(googleData?.idToken);
        if (response?.data?.USERID) {
          await checkUserInfo(response?.data);
        }
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert("Failed to login with Google");
    }
  };

  const isValidEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
   

      <div className="flex flex-col  items-center justify-center min-h-screen px-4">

        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">Sign In</h1>

            <div
              className="w-48 h-16 mx-auto mb-8"
            >
              <img
                src={require("../assets/images/logo.png")}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-center text-lg pb-0 text-gray-500">Please enter your details to sign in</p>
          </div>

          {/* Form Container */}
          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent transition-all duration-300
                  placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={hidePassword ? 'password' : 'text'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent transition-all duration-300
                  placeholder:text-gray-400"
                />
                <button
                  onClick={() => setHidePassword(!hidePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  {hidePassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link - Now properly positioned */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowEmailPopup(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-300"
                type="button"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Login Button */}
            <CustomButton
              onPress={handleLogin}
              title="Sign In"
              loading={isLoading}
            />

            {/* Sign Up Prompt */}
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/SignUpConsent')}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                type="button"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-lg bg-white text-gray-500">or continue with</span>
            </div>
          </div>

          {/* Social Auth Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300
              shadow-sm hover:shadow-md"
              type="button"
            >
              <GoogleIcon />
            </button>
            <button
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300
              shadow-sm hover:shadow-md"
              type="button"
            >
              <AppleIcon />
            </button>
          </div>
        </div>
      </div>

      <EmailPopup
        visible={showEmailPopup}
        error={forgetError}
        onClose={() => {
          setShowEmailPopup(false);
          setForgetError('');
        }}
        onConfirm={handleForgetPassword}
        loading={forgetLoading}
      />
    </div>
  );
}

export default SignInPage;