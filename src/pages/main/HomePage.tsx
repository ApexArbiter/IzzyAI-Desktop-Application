import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../contexts/DataContext';
import BaseURL, { IMAGE_BASE_URL } from '../../components/ApiCreds';
import { getToken } from '../../utils/functions';

const Card = ({ title, description, imageSrc, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between p-6 border-2 border-cyan-400 rounded-xl 
    hover:bg-cyan-50 transition-all duration-300 w-full mb-6 group"
  >
    <div className="flex-1 mr-6">
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
    <div className="w-24 h-24 flex-shrink-0">
      <img 
        src={imageSrc} 
        alt={title}
        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  </button>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { userId, updateUserDetail, userDetail } = useDataContext();
  const [userData, setUserData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const fetchData = async () => {
    const token = await getToken();
    try {
      const response = await fetch(`${BaseURL}/get_user_profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userData = await response.json();
      updateUserDetail(userData);
      setUserData(userData);

      if (userData?.AvatarID) {
        const avatarResponse = await fetch(`${BaseURL}/get_avatar/${userData.AvatarID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const avatarData = await response.json();
        if (avatarData?.AvatarURL) {
          const fullAvatarUrl = `${BaseURL}${avatarData.AvatarURL}`;
          updateUserDetail({ avatarUrl: fullAvatarUrl });
          setAvatarUrl(avatarData.AvatarURL);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onPressTab = (route) => {
    if (userDetail?.SubscriptionDetails) {
      navigate(route);
    } else {
      alert("Please subscribe first");
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  const avatarUrlNew = `${IMAGE_BASE_URL}${avatarUrl}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* User Profile Section */}
        <div className="flex items-center mb-12 bg-white p-6 rounded-xl shadow-sm">
          <img
            src={userDetail?.avatarUrl || avatarUrlNew}
            alt="Profile"
            className="w-12 h-12 rounded-full bg-amber-100 object-cover"
          />
          <div className="ml-4">
            <p className="text-gray-600">Logged in as</p>
            <h2 className="text-lg font-medium text-gray-900">{userData.FullName}</h2>
          </div>
        </div>

        {/* Main Cards Section */}
        <div className="space-y-6">
          <Card
            title="Assessment"
            description="Test your speech-language skills with our AI based assessments"
            imageSrc="/assets/images/home1.png"
            onClick={() => onPressTab('assessmentPage')}
          />
          
          <Card
            title="Exercises"
            description="Improve your speaking skills with our AI Therapist"
            imageSrc="/assets/images/home2.png"
            onClick={() => onPressTab('exercisePage')}
          />
          
          <Card
            title="Reports"
            description="View your progress and improvement"
            imageSrc="/assets/images/home3.png"
            onClick={() => onPressTab('reportsPage')}
          />
        </div>

        {/* Notes Section */}
        <div className="mt-12 bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Notes:</h3>
          <div className="space-y-3 text-gray-600">
            <p>1. Please do not switch/change between the screens while using IzzyAl. Doing so may disable the Record button.</p>
            <p>2. Adjust your face image within the camera frame for proper facial recording.</p>
            <p>3. Be close and within the frame.</p>
            <p>4. Press the Record button to start and stop the audio recording.</p>
            <p>5. Press the Previous button to go back and record again.</p>
            <p>6. Press End/Finish at any point to exit the assessment or exercise.</p>
            <p>7. If you close the Assessment, Exercise or Game without clicking Finish/End, your report will not be generated.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;