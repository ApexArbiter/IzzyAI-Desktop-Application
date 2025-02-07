import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Progress Bar Component
const BarFilled = () => (
  <div className="h-2 w-16 md:w-24 bg-gray-900 rounded-full"></div>
);

// Custom Button Component
const CustomButton = ({ onClick, title }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-900 text-white rounded-full py-3 px-6 font-semibold
        hover:bg-gray-800 transition-all duration-300 mt-4"
    >
      {title}
    </button>
  );
};

const SetupProfilePage4 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = async () => {
    try {
      localStorage.setItem("isTerms", JSON.stringify(true));
      navigate('/scan-face-instruction', {
        state: {
          ...location.state,
          routeName: 'baselineQuestions',
          nextPage: 'faceauthenticationscreen',
        }
      });
    } catch (error) {
      console.error('Error saving terms agreement:', error);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl flex flex-col h-[95vh]">
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* Logo */}
          <div className="flex justify-center mb-4 h-16 md:h-20">
            <img
              src={require("../assets/images/logo.png")}
              alt="Logo"
              className="h-full w-auto object-contain"
            />
          </div>

          {/* Progress Bar */}
          <div className="flex justify-between items-center gap-2 mb-6">
            <BarFilled />
            <BarFilled />
            <BarFilled />
            <BarFilled />
            <BarFilled />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <h1 className="text-2xl font-medium text-gray-900 text-center mb-4">
              Our Terms & Conditions
            </h1>

            <p className="text-center text-gray-700 mb-4">
              Finish setting up your profile by thoroughly reading our Terms & Conditions
            </p>

            {/* Scrollable Terms Content */}
            <div className="flex-1 overflow-auto pr-2 space-y-3 text-gray-700 text-sm md:text-base">
              <p>
                Consent to Recording: You agree that this product may record audio
                and video for the purpose of speech-language disorder assessment and
                improvement.
              </p>

              <p>
                Data Usage: Your recorded data may be used to enhance the
                functionality of the product and for research purposes. Your
                privacy will be respected, and your data will not be shared with
                third parties without your consent.
              </p>

              <p>
                Our Terms & Conditions: For the complete terms & conditions please visit{' '}
                <a 
                  href="https://izzyai.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Terms of Use, Privacy Policy
                </a>
                , and Service Agreement at{' '}
                <a 
                  href="https://izzyai.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  izzyai.com
                </a>
              </p>

              <p>
                User Responsibilities: You are responsible for maintaining the
                confidentiality of your account credentials and ensuring the
                security of your device.
              </p>

              <p>
                Compliance: This product complies with relevant privacy
                regulations, including the General Data Protection Regulation
                (GDPR) and the Health Insurance Portability and Accountability Act
                (HIPAA), where applicable.
              </p>

              <p>
                Updates: These terms and conditions may be updated from time to
                time. By continuing to use the product, you agree to the updated
                terms.
              </p>
            </div>

            {/* Button Section */}
            <div className="mt-4">
              <CustomButton
                onClick={handleNavigate}
                title="I agree to Terms & Conditions"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupProfilePage4;