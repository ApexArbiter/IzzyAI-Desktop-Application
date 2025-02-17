import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import AlertModal from '../components/AlertModal';

// Progress Bar Components
// Progress Bar Components - Made more responsive
const BarFilled = () => (
  <div className="h-1.5 w-[12%] bg-gray-900 rounded-full"></div>
);

const Bar = () => (
  <div className="h-1.5 w-[12%] bg-gray-200 rounded-full"></div>
);

// Adjusted CircularProgress for better responsiveness
const CircularProgress = ({ percentage, color, bgColor, children }) => {
  // Dynamic size based on viewport
  const size = 'min(120px, 25vw)';
  const strokeWidth = 'min(15px, 3vw)';
  const radius = `calc((${size} - ${strokeWidth}) / 2)`;
  const circumference = `calc(${radius} * 2 * 3.14159)`;
  const offset = `calc(${circumference} - (${percentage} / 100) * ${circumference})`;

  return (
    <div className="relative inline-flex">
      <svg
        style={{ width: size, height: size }}
        className="transform -rotate-90"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke={bgColor}
          strokeWidth="15"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke={color}
          strokeWidth="15"
          fill="none"
          strokeDasharray="314.159"
          strokeDashoffset={`${314.159 - (percentage / 100) * 314.159}`}
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
      className={`px-6 py-2 sm:px-8 sm:py-3 rounded-full text-white text-base sm:text-lg font-semibold 
        transition-all duration-300 ${bgColor} whitespace-nowrap`}
    >
      {title}
    </button>
  );
};

const SetupProfilePage3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passed, setPassed] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [data, setData] = useState({ title: "", message: "" })

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
      setData({ title: "Error", navigate: true, message: "Please try again to pass Camera/Microphone test.\nPlease say the sentence loud and close to the microphone." });
      setIsAlertOpen(true)
      // alert("Please try again to pass Camera/Microphone test.\nPlease say the sentence loud and close to the microphone.");
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
              <h1 className="lg:text-3xl text-2xl font-medium text-gray-900 text-center mb-8">
                {passed
                  ? "Congratulations! Your camera passed the test!"
                  : "Oops! Your Camera/Microphone didn't qualify the test"}
              </h1>

              <p className="text-center text-lg lg:text-xl text-gray-700 max-w-md mx-auto mb-12">
                {passed
                  ? "Your camera is good to go! You can now proceed to the next step"
                  : "Try cleaning up your Camera/Microphone or use different device in order to use IzzyAI"}
              </p>

              {/* Circular Progress Indicators */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12 pt-8">
                <div className="text-center ">
                  <CircularProgress
                    percentage={videoQualityPercentage}
                    color="#FC4343"
                    bgColor="#FFECF0"
                  >
                    <span className="text-2xl font-medium text-[#FC4343]">
                      {Math.round(videoQualityPercentage)}%
                    </span>
                  </CircularProgress>
                  <p className="mt-6 mb-8 text-lg text-gray-900">Camera Score</p>
                  <CustomButton
                    onClick={handleBack}
                    title="Retry"
                    backgroundColor="red"
                  />
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
                  <p className="mt-6 mb-8 text-lg text-gray-900">Microphone Score</p>
                  <CustomButton
                    onClick={handleNavigate}
                    title="Done"
                    backgroundColor="green"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <AlertModal
                  isOpen={isAlertOpen}
                  onConfirm={() => {
                    data.navigate && navigate("/setupProfile2");
                    setIsAlertOpen(false);
                  }}
                  onClose={() => {

                    data.navigate && navigate("/setupProfile2");
                    setIsAlertOpen(false);
                  }}
                  type="success"
                  title={data.title}
                  message={data.message}
                  confirmText="OK"
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