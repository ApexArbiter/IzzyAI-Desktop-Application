import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TherapistImage from '../assets/images/TherapistImage.png';
import CustomHeader from '../components/CustomHeader';

const CustomButton = ({ onPress, title }) => (
  <motion.button
    onClick={onPress}
    className="rounded-full bg-[#111920] p-3 h-[50px] flex items-center justify-center w-full"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.8 }}
  >
    <span className="text-white font-semibold">{title}</span>
  </motion.button>
);

function TherapistProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-white">
      <CustomHeader title="IzzyAI Chatbot" goBack={() => navigate(-1)} />
      <div className="flex-1 p-5 overflow-auto">
        <div className="flex flex-col mt-26">
          <motion.img
            src={TherapistImage}
            alt="Therapist"
            className="w-[230px] h-[230px] mt-10 self-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          />
          <motion.h2
            className="mt-5 text-2xl font-medium text-[#111920] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Hello, I'm IzzyAI Chatbot.
          </motion.h2>
          <motion.p
            className="text-base px-8 mt-5 text-[#111920] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            I will assist you to overcome your speech-language problems. I provide the best possible strategies as per the various needs and preferences of the user. My capabilities include speech recognition, language understanding, and synthesis. I strive to enhance communication experiences for users across different platforms and environments. Let me know how I can assist you further!
          </motion.p>
        </div>
        <div className="p-5 mt-10 ">
          <CustomButton
            onPress={() => navigate('/AvatarTherapistName')}
            title="Contact AI SLP"
          />
        </div>
      </div>
    </div>
  );
}

export default TherapistProfilePage;