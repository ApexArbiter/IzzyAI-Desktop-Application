import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import CustomHeader from '../components/CustomHeader';
import { useNavigate } from 'react-router-dom';

const SignupConsent = () => {
    const navigate =  useNavigate()
  const [loading, setLoading] = useState(false);

  const onPressAdultClinic = async (isClinic) => {
    // Implementation would go here
  };

  const onNavigateSignup = (type) => {
    navigate(`/signUpPage`, {
        state:{type},
        replace: true  
      });
    }
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
     <CustomHeader title={"Profile Type"} />

      {/* Main Content */}
      <main className="px-4 md:px-10 lg:px-20 flex-1">
        <h2 className="text-2xl font-bold text-center text-gray-900 mt-20 mb-8">
          Choose a Profile Type:
        </h2>

        {/* Grid Container */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Myself (Adult) */}
          <button 
            onClick={() => onNavigateSignup('adult')}
            className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="h-32 w-full flex items-center justify-center">
              <img 
                src={require("../assets/images/adult_image.png")}
                alt="Adult profile" 
                className="h-full object-contain"
              />
            </div>
            <span className="mt-2 font-semibold text-gray-900 text-lg">
              Myself (Adult)
            </span>
          </button>

          {/* My Child */}
          <button 
            onClick={() => onNavigateSignup('child')}
            className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="h-32 w-full flex items-center justify-center">
              <img 
                src={require("../assets/images/child_image.png")}
                alt="Child profile" 
                className="h-full object-contain"
              />
            </div>
            <span className="mt-2 font-semibold text-gray-900 text-lg">
              My Child
            </span>
          </button>

          {/* Someone I Care For */}
          <button 
            onClick={() => onNavigateSignup('someone')}
            className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="h-32 w-full flex items-center justify-center">
              <img 
                src={require("../assets/images/someone_image.png")}
                alt="Caregiver profile" 
                className="h-full object-contain"
              />
            </div>
            <span className="mt-2 font-semibold text-gray-900 text-lg text-center">
              Someone I<br />Care For
            </span>
          </button>

          {/* SLP Clinic */}
          <button 
            onClick={() => onPressAdultClinic(true)}
            className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="h-32 w-full flex items-center justify-center">
              <img 
                src={require("../assets/images/clinic_image.png")}
                alt="Clinic profile" 
                className="h-full object-contain"
              />
            </div>
            <span className="mt-2 font-semibold text-gray-900 text-lg">
              SLP Clinic
            </span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default SignupConsent;