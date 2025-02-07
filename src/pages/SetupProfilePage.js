import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { getToken } from '../utils/functions';
import CustomHeader from '../components/CustomHeader';

// Progress Bar Components
const BarFilled = () => (
  <div className="h-2 w-16 md:w-24 bg-gray-900 rounded-full"></div>
);

const Bar = () => (
  <div className="h-2 w-16 md:w-24 bg-gray-200 rounded-full"></div>
);

const CustomButton = ({ onClick, title, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full h-[50px] bg-[#111920] text-white rounded-full font-semibold
        transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 
        disabled:cursor-not-allowed flex items-center justify-center mt-5"
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        title
      )}
    </button>
  );
};

const CheckBox = ({ checked, onPress, title }) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer py-2 select-none">
      <div 
        onClick={onPress}
        className={`w-6 h-6 border-2 rounded flex items-center justify-center
          ${checked ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}
      >
        {checked && (
          <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="text-gray-900 text-base">{title}</span>
    </label>
  );
};

const SetupProfilePage = () => {
  const { userId } = useDataContext();
  const [improvementPreferences, setImprovementPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = async () => {
    setIsLoading(true);
    const profileData = {
      improvementPreferences,
    };

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('checkboxes', improvementPreferences.join(','));

      const response = await fetch(`${BaseURL}/insert_user_profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      console.log(data);
      setIsLoading(false);
      navigate('/setupProfile1', { state: profileData });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (preference) => {
    setImprovementPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(item => item !== preference)
        : [...prev, preference]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <CustomHeader title="Setup Profile" />
      
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
              <Bar />
              <Bar />
              <Bar />
              <Bar />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-medium text-gray-900 mb-8">
                Setup your profile to continue
              </h1>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    What do you want to improve?
                  </h2>

                  <div className="space-y-2">
                    {[
                      { id: 'articulation', label: 'Articulation' },
                      { id: 'stammering', label: 'Stammering' },
                      { id: 'voice', label: 'Voice' },
                      { id: 'receptive', label: 'Receptive Language' },
                      { id: 'expressive', label: 'Expressive Language' },
                    ].map(({ id, label }) => (
                      <CheckBox
                        key={id}
                        checked={improvementPreferences.includes(id)}
                        onPress={() => handleCheckboxChange(id)}
                        title={label}
                      />
                    ))}
                  </div>
                </div>

                <CustomButton
                  onClick={handleNavigate}
                  title="Next"
                  loading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupProfilePage;