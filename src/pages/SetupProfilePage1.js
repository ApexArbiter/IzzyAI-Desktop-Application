import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const AvatarOption = ({ id, imgSrc, selected, onClick }) => (
  <div
    onClick={() => onClick(id)}
    className={`cursor-pointer w-[45%] aspect-[1/1] rounded-lg overflow-hidden
      transition-all duration-300 hover:opacity-90
      ${selected ? 'ring-2 ring-[#2DEEAA] ring-offset-2' : 'ring-1 ring-gray-200'}`}
  >
    <img
      src={imgSrc}
      alt={`Avatar ${id}`}
      className="w-full h-full object-cover"
    />
  </div>
);

const SetupProfilePage1 = () => {
  const { userId, userDetail, updateUserDetail } = useDataContext();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [gender, setGender] = useState(userDetail?.Gender|| "Male");
  const [isLoading, setIsLoading] = useState(false);
  console.log(userId, userDetail)
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (userDetail?.Gender) {
      setGender(userDetail?.Gender);
    }
  }, [userDetail?.Gender]);

  const handleNavigateNext = async () => {
    if (!selectedAvatar) {
      alert('Please select an avatar');
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('AvatarID', selectedAvatar);

      const response = await fetch(`${BaseURL}/update_avatar_id`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      updateUserDetail({
        AvatarID: selectedAvatar,
      });

      navigate('/setupProfile2', { 
        state: location.state 
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAvatarSection = () => {
    if (gender === 'Male') {
      return (
        <div className="flex justify-between items-start mt-8">
          <AvatarOption
            id={1}
            imgSrc={require("../assets/images/male1.png")}
            selected={selectedAvatar === 1}
            onClick={setSelectedAvatar}
          />
          <AvatarOption
            id={2}
            imgSrc={require("../assets/images/male2.png")}
            selected={selectedAvatar === 2}
            onClick={setSelectedAvatar}
          />
        </div>
      );
    }

    if (gender === 'Female') {
      return (
        <div className="flex justify-between items-start mt-8">
          <AvatarOption
            id={3}
            imgSrc={require("../assets/images/female1.png")}
            selected={selectedAvatar === 3}
            onClick={setSelectedAvatar}
          />
          <AvatarOption
            id={4}
            imgSrc={require("../assets/images/female2.png")}
            selected={selectedAvatar === 4}
            onClick={setSelectedAvatar}
          />
        </div>
      );
    }

    if (gender === 'Transgender' || gender === 'Prefer not to say') {
      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Male Avatars
            </h3>
            <div className="flex justify-between items-start">
              <AvatarOption
                id={1}
                imgSrc={require("../assets/images/male1.png")}
                selected={selectedAvatar === 1}
                onClick={setSelectedAvatar}
              />
              <AvatarOption
                id={2}
                imgSrc={require("../assets/images/male2.png")}
                selected={selectedAvatar === 2}
                onClick={setSelectedAvatar}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Female Avatars
            </h3>
            <div className="flex justify-between items-start">
              <AvatarOption
                id={3}
                imgSrc={require("../assets/images/female1.png")}
                selected={selectedAvatar === 3}
                onClick={setSelectedAvatar}
              />
              <AvatarOption
                id={4}
                imgSrc={require("../assets/images/female2.png")}
                selected={selectedAvatar === 4}
                onClick={setSelectedAvatar}
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };
  const handleBack = () => {
    navigate(-1);
  };


  return (
    <div className="min-h-screen bg-white">
      <CustomHeader title="Setup Profile" goBack={handleBack} />
      
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
              <Bar />
              <Bar />
              <Bar />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-3xl font-medium text-gray-900 text-center mb-10 mt-2">
                Choose your Avatar
              </h1>

              {renderAvatarSection()}

              <div className="mt-10">
                <CustomButton
                  onClick={handleNavigateNext}
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

export default SetupProfilePage1;