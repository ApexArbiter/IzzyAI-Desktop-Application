import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomHeader from '../components/CustomHeader';
import logo from '../assets/images/logo.png';
import { IMAGE_BASE_URL } from '../components/ApiCreds';


const Settings = () => {
  const navigate = useNavigate();
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  console.log(userDetails);
  // Replace with your context

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <CustomHeader goBack={() => navigate(-1)} />

        {/* Logo */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <img
            src={require("../assets/images/logo.png")}
            alt="Logo"
            className=" h-20"
          />
        </div>
      {/* Main Content */}
      <motion.main
        className="flex-1 container mx-auto px-4 py-6 max-w-2xl mt-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Profile Section */}
        <motion.div
          className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-6 mb-6"
          variants={itemVariants}
        >
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={`${userDetails.avatarUrl}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <h2 className="text-xl font-medium text-gray-900 truncate">
                {userDetails.FullName}
              </h2>
              <p className="text-sm text-gray-600 truncate mt-1">
                {userDetails.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Options */}
        <motion.div className="space-y-4" variants={itemVariants}>
          {/* Update Avatar Button */}
          <motion.button
            onClick={() => navigate('/UpdateAvatar')}
            className="w-full bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-6 flex items-center justify-between group hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="text-base font-medium text-gray-900">Update Avatar</span>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </motion.button>

          {/* Change Password Button */}
          <motion.button
            onClick={() => navigate('/ChangePassword')}
            className="w-full bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-6 flex items-center justify-between group hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="text-base font-medium text-gray-900">Change Password</span>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </motion.button>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Settings;