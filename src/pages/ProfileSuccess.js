import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const ProfileSetupSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div 
        className="flex flex-col items-center justify-center space-y-6 rounded-2xl bg-white p-8 shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
        >
          <CheckCircle className="h-16 w-16 text-green-500" />
        </motion.div>

        <motion.div 
          className="mt-4 flex flex-col items-center space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="h-16 w-40">
            <img
               src={require("../assets/images/logo.png")}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <motion.h1 
            className="text-center text-2xl font-medium text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Your IzzyAI profile has been setup successfully
          </motion.h1>
        </motion.div>

        <motion.div
          className="mt-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full bg-green-500"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ 
                duration: 3,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileSetupSuccessPage;