import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const CustomButton = ({ onClick, title, loading }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-full 
               font-semibold hover:bg-gray-800 transition-colors duration-300
               min-w-[200px] h-[50px] flex items-center justify-center"
  >
    {loading ? (
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    ) : (
      title
    )}
  </motion.button>
);

const SufferingDisease = () => {

  const [questionReport, setQuestionReport] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const questions = JSON.parse(localStorage.getItem('questionReport'));
    if (questions) {
      setQuestionReport(questions);
    }
  }, []); // Empty dependency array means this only runs once when component mounts

  useEffect(() => {
    if (questionReport) {
      console.log('Articulation:', questionReport.articulationYes > (questionReport.articulationNo || 0));
      console.log('Stammering:', questionReport.stammeringYes > (questionReport.stammeringNo || 0));
      console.log('Voice:', questionReport.voiceYes > (questionReport.voiceNo || 0));
      console.log('Receptive:', questionReport.receptiveNo > (questionReport.receptiveYes || 0));
      console.log('Expressive:', questionReport.expressiveNo > (questionReport.expressiveYes || 0));
    }
    console.log(questionReport)
  }, [questionReport]);

  const handleGetStarted = () => {
    navigate('/profileSetupSuccess');
  };

  const conditions = [
    {
      condition: 'Articulation Disorder',
      show: questionReport?.articulationYes > questionReport?.articulationNo
    },
    {
      condition: 'Stammering',
      show: questionReport?.stammeringYes > questionReport?.stammeringNo
    },
    {
      condition: 'Voice Disorder',
      show: questionReport?.voiceYes > questionReport?.voiceNo
    },
    {
      condition: 'Receptive Language Disorder',
      show: questionReport?.receptiveYes > questionReport?.receptiveNo
    },
    {
      condition: 'Expressive Language Disorder',
      show: questionReport?.expressiveYes > questionReport?.expressiveNo
    }
  ];


  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <motion.div 
        className="w-full max-w-4xl px-4 md:px-6 py-6 flex flex-col min-h-screen"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Logo Section */}
        <motion.div 
          className="w-40 h-16 mx-auto mb-8 mt-16"
          variants={fadeIn}
        >
          <img
            src={require('../assets/images/logo.png')}
            alt="Izzy AI Logo"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col">
          <motion.h2 
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          >
            Suspected Conditions
          </motion.h2>

          {/* Conditions List */}
          <motion.div 
            className="space-y-4 mb-8"
            variants={containerVariants}
          >
            {conditions.map((item, index) => (
              item.show && (
                <motion.p
                  key={index}
                  variants={fadeIn}
                  className="text-xl md:text-2xl font-semibold text-gray-900"
                >
                  {item.condition}
                </motion.p>
              )
            ))}
          </motion.div>

          {/* Description */}
          <motion.p 
            variants={fadeIn}
            className="text-base md:text-lg text-gray-700 mb-8 max-w-2xl"
          >
            Explore our app to find personalized exercise plans, assessments,
            and informative content designed to address common disorder
            concerns. With easy-to-use tools and comprehensive solutions, you can take charge of your linguistic well-being today.
          </motion.p>

          {/* Button */}
          <motion.div 
            variants={fadeIn}
            className="flex justify-center mt-auto pb-8"
          >
            <CustomButton
              onClick={handleGetStarted}
              title="Get Started"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SufferingDisease;