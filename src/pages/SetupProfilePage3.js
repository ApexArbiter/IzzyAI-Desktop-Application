import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';

// Progress Bar Components
const BarFilled = () => (
  <div className="h-2 w-16 md:w-24 bg-gray-900 rounded-full"></div>
);

const Bar = () => (
  <div className="h-2 w-16 md:w-24 bg-gray-200 rounded-full"></div>
);

const CircularProgress = ({ percentage, size = 150, strokeWidth = 20, color, bgColor, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

const CustomButton = ({ onClick, title, backgroundColor }) => {
  const bgColor = backgroundColor === 'red' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600';
  
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 rounded-full text-white font-semibold 
        transition-all duration-300 ${bgColor}`}
    >
      {title}
    </button>
  );
};

const SetupProfilePage3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passed, setPassed] = useState(false);

  const videoQualityPercentage = location.state?.videoQualityPercentage || 0;
  const audioQualityPercentage = location.state?.audioQualityPercentage || 0;
console.log(location.state)
  useEffect(() => {
    const checkQuality = () => {
      if (videoQualityPercentage >= 40 && audioQualityPercentage >= 10) {
        setPassed(true);
      } else {
        setPassed(false);
      }
    };
    checkQuality();
  }, [videoQualityPercentage, audioQualityPercentage]);

  const handleNavigate = () => {
    if (passed) {
      navigate('/setupProfile4', { 
        state: location.state 
      });
    } else {
      navigate(-1);
      alert("Please try again to pass Camera/Microphone test.\nPlease say the sentence loud and close to the microphone.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      <CustomHeader title="Setup Profile" showBack={true} goBack={handleBack} />
      
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        <div className="flex-1 px-4 py-6 md:px-6 lg:px-8 max-w-3xl mx-auto w-full">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-20 w-40 mx-auto mb-8">
              <img
                src={require("../assets/images/logo.png")}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Progress Bar */}
            <div className="flex justify-between items-center gap-2 mb-8">
              <BarFilled />
              <BarFilled />
              <BarFilled />
              <BarFilled />
              <Bar />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-medium text-gray-900 text-center mb-8">
                {passed 
                  ? "Congratulations! Your camera passed the test!"
                  : "Oops! Your Camera/Microphone didn't qualify the test"}
              </h1>

              <p className="text-center text-gray-700 max-w-md mx-auto mb-12">
                {passed 
                  ? "Your camera is good to go! You can now proceed to the next step"
                  : "Try cleaning up your Camera/Microphone or use different device in order to use IzzyAI"}
              </p>

              {/* Circular Progress Indicators */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
                <div className="text-center">
                  <CircularProgress
                    percentage={videoQualityPercentage}
                    color="#FC4343"
                    bgColor="#FFECF0"
                  >
                    <span className="text-2xl font-medium text-[#FC4343]">
                      {Math.round(videoQualityPercentage)}%
                    </span>
                  </CircularProgress>
                  <p className="mt-4 text-gray-900">Camera Score</p>
                </div>

                <div className="text-center">
                  <CircularProgress
                    percentage={audioQualityPercentage}
                    color="#71D860"
                    bgColor="#F4FCF3"
                  >
                    <span className="text-2xl font-medium text-[#71D860]">
                      {Math.round(audioQualityPercentage)}%
                    </span>
                  </CircularProgress>
                  <p className="mt-4 text-gray-900">Microphone Score</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <CustomButton
                  onClick={handleBack}
                  title="Retry"
                  backgroundColor="red"
                />
                <CustomButton
                  onClick={handleNavigate}
                  title="Done"
                  backgroundColor="green"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupProfilePage3;