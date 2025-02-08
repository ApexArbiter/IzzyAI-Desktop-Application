import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GettingStartedPageThree = () => {
    const navigate = useNavigate();

    const handleNavigation = async () => {
        // Store onboarding completion in localStorage (web equivalent of AsyncStorage)
        localStorage.setItem("isOnboarding", JSON.stringify(true));
        navigate('/SignIn');  // Navigate to auth stack
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    return (
        <motion.div
            className="min-h-screen p-6 md:p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-blue-50 to-white"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow relative z-10">
                {/* Logo */}
                <motion.div className="flex justify-center mt-8 lg:mt-12" variants={itemVariants}>
                    <div className="h-16 md:h-20 lg:h-24 w-32 md:w-40 lg:w-48 relative">
                        <img
                            src={require("../assets/images/logo.png")}
                            alt="IzzyAI Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </motion.div>

                {/* Content Section */}
                <div className="flex-grow flex flex-col justify-center items-center mb-12 lg:mb-16">
                    <motion.h1
                        className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center font-bold text-gray-900 mb-8 leading-tight"
                        variants={itemVariants}
                    >
                        Rationale
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl lg:text-3xl text-center text-gray-600 mt-6 md:mt-8 max-w-4xl mx-auto leading-relaxed"
                        variants={itemVariants}
                    >
                        IzzyAI is the only human avatar-based model that captures audio-visual and emotional features of the user and provides comprehensive assessments and exercises. The wide variety of therapy options, especially the gamification, provides an easy and captivating intervention method. IzzyAI model training is based on data of articulation, stammering, voice, receptive language and expressive language disorders.
                    </motion.p>

                    <motion.button
                        className="w-full max-w-md mx-auto mt-8 md:mt-12 px-8 py-4 bg-gray-900 text-white rounded-full text-lg md:text-xl font-semibold cursor-pointer shadow-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-102 active:scale-98"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        onClick={handleNavigation}
                    >
                        Next
                    </motion.button>
                </div>
            </div>

            {/* Decorative Blobs */}
            {/* <motion.div
                className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-200 opacity-70 blur-xl mix-blend-multiply"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute top-0 right-0 w-64 h-64 rounded-full bg-yellow-200 opacity-70 blur-xl mix-blend-multiply"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />
            <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-pink-200 opacity-70 blur-xl mix-blend-multiply"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                }}
            /> */}
        </motion.div>
    );
};

export default GettingStartedPageThree;