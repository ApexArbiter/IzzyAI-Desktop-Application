import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/functions';
import BottomNavigation from '../../components/BottomNavigation';
import { motion } from 'framer-motion';
import { useDataContext } from '../../contexts/DataContext';
import BaseURL, { IMAGE_BASE_URL } from '../../components/ApiCreds';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import AlertModal from '../../components/AlertModal';

const HomePage = () => {
  const { userId } = useDataContext();
  const [userData, setUserData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { updateUserDetail } = useDataContext();
  const history = useNavigate();
  const [userDetail, setUserDetail] = useState(null);
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  // const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
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
    try {
      const response = await fetch(`${BaseURL}/get_user_profile/${UserId}`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      const userData = await response.json();
      console.log("UserProfile",userData)
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
    if (route === 'assessmentPage' || userDetail?.SubscriptionDetails) {
      history(`/${route}`);
    } else {
      setIsAlertOpen(true)
      // setShowSubscriptionAlert(true);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cards = [
    {
      title: "Assessments",
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* <AlertDialog open={showSubscriptionAlert} onOpenChange={setShowSubscriptionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please subscribe to access this feature. A subscription is required to use all the features of our application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSubscriptionAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => history('/subscription')}>Subscribe Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        type="success"
        title="Subscribe"
        message="Please subscribe first"
        confirmText="OK!"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={userDetails.avatarUrl || avatarUrlNew}
                  alt="Avatar"
                  className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-yellow-100 object-cover"
                />
                <div>
                  <span className="text-gray-600">Logged in as </span>
                  <span className="font-medium text-gray-900">{userData.FullName}</span>
                </div>
              </div>
              <div className="flex-1 flex justify-center mr-8">
                <img
                  src={require("../../assets/images/logo.png")}
                  alt="Logo"
                  className="h-12 lg:w-48 lg:h-14 object-contain"
                />
              </div>
              <div className="w-48"></div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
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
                <div className="p-4 lg:p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm lg:text-base text-gray-600">{card.description}</p>
                  </div>
                  <div className="mt-3 flex justify-center">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-20 h-20 lg:w-24 lg:h-24 object-contain"
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
            className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-16"
          >
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3">Notes:</h3>
            <ul className="space-y-1.5 text-sm lg:text-base text-gray-600">
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
      </div>
      <BottomNavigation />
    </div>
  );
};

export default HomePage;