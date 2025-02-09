import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../contexts/DataContext';
import CustomHeader from '../../components/CustomHeader';
import { motion } from 'framer-motion';
import { Settings, CreditCard, User, HelpCircle, MessageSquare, LogOut } from 'lucide-react';
import { IMAGE_BASE_URL } from '../../components/ApiCreds';
import BottomNavigation from '../../components/BottomNavigation';
import FeedbackModal from '../../components/FeedbackModal';



function ProfilePage() {
  const history = useNavigate();
  const { updateUserDetail } = useDataContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const navigate = useNavigate()
  const navigateBack = () => {
    navigate(-1);
  };
  let userDetail = JSON.parse(localStorage.getItem('userDetails'))

  const handleLogout = () => {
    updateUserDetail({});
    navigate('/');
  };
  const menuItems = [
    { icon: <Settings className="w-6 h-6" />, label: 'Settings', onClick: () => navigate("/settings") },
    { icon: <CreditCard className="w-6 h-6" />, label: 'Manage Subscriptions', onClick: () => navigate("/ManageSubcription") },
    { icon: <User className="w-6 h-6" />, label: 'Bio Data', onClick: () => navigate("/BioData") },
    { icon: <HelpCircle className="w-6 h-6" />, label: 'About App', onClick: () => navigate("/aboutUs") },
    { icon: <MessageSquare className="w-6 h-6" />, label: 'Feedback', onClick: () => setShowFeedbackModal(true) },
    { icon: <LogOut className="w-6 h-6" />, label: 'Logout', onClick: () => setShowLogoutModal(true) }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomHeader title="My Profile" goBack={navigateBack} />

      <div className="max-w-2xl mx-auto px-4 py-2 space-y-4  lg:space-y-6">
        {/* Profile Section */}
          {/* Logo */}
          <div className="h-20 w-40 mx-auto ">
              <img
                src={require("../../assets/images/logo.png")}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0cc8e81f] to-[#2deeaa1f] rounded-2xl  px-4 py-6"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative"
            >
              {console.log(`${userDetail.avatarUrl}`)}
              <img
                src={`${userDetail.avatarUrl}`}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-semibold text-gray-900"
              >
                {userDetail.FullName}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600"
              >
                {userDetail.email}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              // whileHover={{ backgroundColor: '#f3f4f6' }}
              className="flex items-center  rounded-2xl bg-gradient-to-r from-[#0cc8e81f] to-[#2deeaa1f] justify-between p-4 cursor-pointer border-b last:border-b-0 border-gray-100"
              onClick={item.onClick}
            >
              <div className="flex items-center space-x-4">
                <div className="text-blue-500">
                  {item.icon}
                </div>
                <span className="text-gray-700 lg:text-lg font-medium">{item.label}</span>
              </div>
              <motion.div
                whileHover={{ x: 5 }}
                className="text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        

        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />

        {/* Logout Modal */}
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-semibold text-center mb-4">
                Are you sure you want to logout?
              </h3>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}

export default ProfilePage;