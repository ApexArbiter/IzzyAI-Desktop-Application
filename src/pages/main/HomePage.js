import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/functions';
import BottomNavigation from '../../components/BottomNavigation';
import { motion } from 'framer-motion';
import { useDataContext } from '../../contexts/DataContext';
import BaseURL, { IMAGE_BASE_URL } from '../../components/ApiCreds';

const HomePage = () => {
  const { userId } = useDataContext();
  const [userData, setUserData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { updateUserDetail } = useDataContext();
  const history = useNavigate();
  const [userDetail, setUserDetail] = useState(null);
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));

  useEffect(() => {
    try {

      const storedUserDetail = localStorage.getItem("userDetails");
      if (storedUserDetail) {
        setUserDetail(JSON.parse(storedUserDetail));
      }
    } catch (error) {
      console.error("Error retrieving userDetails", error);
    }
  }, []);

  const fetchData = async () => {
    const token = await getToken();
    console.log(token)
    const UserId = localStorage.getItem("userId");
    console.log("UserId", UserId);
    try {
      const response = await fetch(`${BaseURL}/get_user_profile/${UserId}`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      const userData = await response.json();
      updateUserDetail(userData);
      setUserData(userData);

      if (userData?.AvatarID) {
        const response = await fetch(`${BaseURL}/get_avatar/${userData.AvatarID}`, {
          headers: { 'Authorization': 'Bearer ' + token },
        });
        const avatarData = await response.json();
        if (avatarData?.AvatarURL) {
          updateUserDetail({ avatarUrl: `${BaseURL}${avatarData.AvatarURL}` });
          setAvatarUrl(avatarData.AvatarURL);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const avatarUrlNew = `${IMAGE_BASE_URL}${avatarUrl}`;

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const onPressTab = (route) => {

    history(`/${route}`);
    // if (!userDetail?.SubscriptionDetails) {
    //   history(`/${route}`);
    // } else {
    //   alert('Please subscribe first');
    // }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cards = [
    {
      title: "Assessment",
      description: "Test your speech-language skills with our AI-based assessments",
      image: require('../../assets/images/home1.png'),
      route: 'assessmentPage'
    },
    {
      title: "Exercises",
      description: "Improve your speaking skills with our AI Therapist",
      image: require('../../assets/images/home2.png'),
      route: 'exercisePage'
    },
    {
      title: "Reports",
      description: "View your progress and improvement",
      image: require('../../assets/images/home3.png'),
      route: 'reportsPage'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4  sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <img
            src={userDetails.avatarUrl || avatarUrlNew}
            alt="Avatar"
            className="h-14 w-14 rounded-full bg-yellow-100 object-cover"
          />
          <div>
            <span className="text-gray-600">Logged in as </span>
            <span className="font-medium text-gray-900">{userData.FullName}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.2 }}
              onClick={() => onPressTab(card.route)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
                <div className="mt-4 flex justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-24 h-24 object-contain"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Notes:</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Please do not switch/change between the screens while using IzzyAl. Doing so may disable the Record button.
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Adjust your face image within the camera frame for proper facial recording.
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Be close and within the frame.
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Press the Record button to start and stop the audio recording.
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Press the Previous button to go back and record again.
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Press End/Finish at any point to exit the assessment or exercise.
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              If you close the Assessment, Exercise, or Game without clicking Finish/End, your report will not be generated.
            </li>
          </ul>
        </motion.div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default HomePage;