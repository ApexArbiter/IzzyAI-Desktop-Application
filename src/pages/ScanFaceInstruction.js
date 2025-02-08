import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomHeader from '../components/CustomHeader';
import CustomButton from '../components/Button';

const ScanFaceInstruction = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = () => {
    navigate('/faceauthenticationscreen', {
      state: {
        ...location.state,
      },
    });
  };

  const handleNavigateBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 lg:p-8">
     <div className='w-full absolute top-0 left-0' >
     <CustomHeader title="Verification" goBack={handleNavigateBack} />
     </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col items-center justify-between max-w-2xl mx-auto w-full py-8 md:py-12"
      >
        <div className="space-y-8 text-center">
          <motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
            src={require('../assets/images/faceIcon.png')}
            alt="Face Icon"
            className="w-24 h-24 md:w-32 md:h-32 mx-auto object-contain"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              We want to scan
            </h1>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              your face
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-base md:text-lg text-gray-600 max-w-md mx-auto"
          >
            Please take a clear picture of yourself. It will be used for authentication purposes.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-md mt-8"
        >
          <CustomButton 
            onPress={handleNavigate} 
            title="Next"
            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ScanFaceInstruction;