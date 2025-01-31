import React from 'react';
import { motion } from 'framer-motion';
import CustomHeader from '../components/CustomHeader';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 }
    }
};

const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3
        }
    }
};

const AboutUs = () => {

    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            <div className='z-10 absolute'>
                <CustomHeader goBack={() => { navigate(-1) }} />
            </div>
            <motion.div
                className="max-w-4xl mx-auto px-4 py-8 md:py-12"
                initial="hidden"
                animate="visible"
                variants={staggerChildren}
            >
                {/* Logo Section */}
                <motion.div
                    className="w-40 md:w-48 mx-auto mb-8"
                    variants={fadeIn}
                >
                    <img
                        src={require('../assets/images/logo.png')}
                        alt="IzzyAI Logo"
                        className="w-full h-auto object-contain"
                    />
                </motion.div>

                {/* Welcome Section */}
                <motion.div
                    className="text-center mb-12"
                    variants={fadeIn}
                >
                    <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                        Welcome to IzzyAI
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-800 mb-6">
                        Your Speech Companion!
                    </h2>
                    <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Embark on a journey to clear and confident speech with IzzyAI. Our
                        avatar-led exercises, powered by AI, target Articulation,
                        Stammering, Voice, Receptive Language, and Expressive Language Disorders. Let's unlock your communication
                        potential together.
                    </p>
                </motion.div>

                {/* Vision & Mission Section */}
                <motion.div
                    className="grid md:grid-cols-2 gap-8 mb-12"
                    variants={staggerChildren}
                >
                    <motion.div
                        className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                        variants={fadeIn}
                    >
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Vision</h3>
                        <p className="text-gray-600">
                            Accessibility to timely assessment and a variety of therapeutic exercises for everyone.
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                        variants={fadeIn}
                    >
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Mission</h3>
                        <p className="text-gray-600">
                            IzzyAI Avatar-based assessments and interventions are tailored to
                            the specific needs of the users.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Rationale Section */}
                <motion.div
                    className="bg-white p-8 rounded-2xl shadow-lg"
                    variants={fadeIn}
                >
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 text-center">
                        Rationale
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        IzzyAI is the only human avatar-based model that captures audio-visual and emotional features of the user and provides comprehensive assessments and exercises. The wide variety of therapy options, especially the gamification, provides an easy and captivating intervention method. IzzyAI model training is based on data of articulation, stammering, voice, receptive language, and expressive language disorders.
                    </p>
                </motion.div>

                {/* Features Section */}
                {/* <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12"
                    variants={staggerChildren}
                >
                    {['Articulation', 'Stammering', 'Voice', 'Receptive Language', 'Expressive Language', 'Emotional Support'].map((feature, index) => (
                        <motion.div
                            key={feature}
                            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
                            variants={fadeIn}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <p className="text-gray-800 font-medium">{feature}</p>
                        </motion.div>
                    ))}
                </motion.div> */}
            </motion.div>
        </div>
    );
};

export default AboutUs;