import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDataContext } from '../contexts/DataContext';
import { getToken } from "../utils/functions";
import { useNavigate, useLocation } from 'react-router-dom';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import Loader from '../components/Loader';
import dynamicfunctions from '../utils/dynamicfunctions';
import { ArrowLeft } from 'lucide-react';
import CustomHeader from '../components/CustomHeader';
import LogoQuestionView from '../components/LogoQuestionView';


// Button Components
const EndButton = ({ onPress, title }) => (
    <button
        onClick={onPress}
        className="w-[42%] rounded-3xl flex items-center justify-center bg-red-500 p-3 h-[50px]"
    >
        <span className="text-white font-semibold">{title}</span>
    </button>
);

const NextButton = ({ onPress, title }) => (
    <button
        onClick={onPress}
        className="w-[42%] rounded-[50px] flex items-center justify-center bg-[#71D860] p-3 h-[50px]"
    >
        <span className="text-[#111920] font-semibold">{title}</span>
    </button>
);

const PrevButton = ({ onPress, title }) => (
    <button
        onClick={onPress}
        className="w-[42%] rounded-[50px] flex items-center justify-center border border-solid p-3 h-[50px]"
    >
        <span className="text-[#111920] font-semibold">{title}</span>
    </button>
);

// Progress Bar Component
const LinearProgress = ({ value, color }) => (
    <div className="relative w-full h-2 bg-gray-200 rounded-2xl overflow-hidden">
        <div
            className="absolute top-0 left-0 h-full bg-[#FF7A2F] transition-all duration-300 ease-in-out rounded-2xl"
            style={{ width: `${value * 100}%` }}
        />
    </div>
);

// Loader Wave Component
const LoaderWave = ({ isAnimation, isDark }) => (
    <div className={`flex items-center justify-center gap-1 ${isAnimation ? 'animate-pulse' : ''}`}>
        {[...Array(5)].map((_, i) => (
            <div
                key={i}
                className={`w-1 h-4 ${isDark ? 'bg-gray-800' : 'bg-gray-400'} rounded-full transform transition-all duration-150`}
                style={{
                    animation: isAnimation ? `wave 1s infinite ${i * 0.1}s` : 'none'
                }}
            />
        ))}
    </div>
);

const SpeechArticulationPage = () => {
    const location = useLocation();
    const { sessionId, isAll } = location?.state || {};
    console.log(sessionId)
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [startTime, setStartTime] = useState('');
    const [backendResponseText, setBackendResponseText] = useState(null);
    const [loading, setLoading] = useState(false);

    const mediaRecorderRef = useRef(null);

    const [questionResponse, setQuestionResponse] = useState('');


    const User = () => localStorage.getItem("userId");
    const storedUserDetail = () => localStorage.getItem("userDetails");



    const navigate = useNavigate();

    // Initialize user details from localStorage
    // useEffect(() => {
    //     const fetchData = () => {
    //         try {
    //             const storedUserDetail = localStorage.getItem("userDetails");
    //             const storedUserId = User();

    //             if (storedUserDetail) {
    //                 setUserDetail(JSON.parse(storedUserDetail));
    //             }

    //             if (storedUserId) {
    //                 setUserId(storedUserId);
    //             }
    //         } catch (error) {
    //             console.error("Error retrieving user details:", error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    // Navigation function
    const navigateTo = () => {
        const navigationState = {
            sessionId: sessionId,
            startTime: startTime,
            isQuick: true,
            result: backendResponseText
        };


        navigate('/passage-results', {
            state: navigationState,
            replace: true
        });
    };

    // Fetch question data


    // Initialize start time
    useEffect(() => {
        const currentStartTime = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
        setStartTime(currentStartTime);
    }, []);

    // Fetch question data when count changes
    useEffect(() => {

        // fetchQuestions(questionCount);

    }, []);

    // Audio recording functions
    const onStartRecord = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(audioStream);
                const audioChunks = [];

                mediaRecorderRef.current.ondataavailable = (e) => {
                    audioChunks.push(e.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    sendAudio(audioBlob);
                };

                mediaRecorderRef.current.start();
                setRecordingStatus('recording');
            } catch (error) {
                console.error('Error starting audio recording:', error);
            }
        }
    };

    const onStopRecord = async () => {
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            setRecordingStatus('stopped');
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    };

    // Send audio for processing
    const sendAudio = async (audioBlob) => {
        setLoading(true)
        if (!audioBlob) {
            console.error('Audio blob is not defined');
            setRecordingStatus('stop');

            return;
        }

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('audio', audioBlob, 'stammering_audio.wav');

            const response = await fetch(`${BaseURL}/predict_stutter`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
            const data = await response.json();
            console.log(data)
            if (response.ok) {
                setBackendResponseText(data, null, 2);
            }


        } catch (error) {
            console.error('Error in speech processing:', error);
        } finally {
            setRecordingStatus('stop');
            setLoading(false)
        }
    };
    useEffect(() => {
        if (backendResponseText !== null && recordingStatus === 'stop') {
            setTimeout(() => {
                navigateTo()
            }, 2000);
        }
    }, [backendResponseText, recordingStatus]);

    return (
        <div className="min-h-screen overflow-hidden bg-gray-50 px-5 py-3">
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <CustomHeader 
                    title="Quick Stammering Assessment" 
                    goBack={() => navigate(-1)} 
                />

                <main className="p-6">
                    {/* Reading Section */}
                    <div className="mb-8">
                        <div className="border border-[#0CC8E8] rounded-2xl p-6 mx-auto">
                            <div className="mb-6">
                                <LogoQuestionView
                                    second_text="Read this Paragraph:"
                                    className="mt-4"
                                />
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="prose prose-lg max-w-none"
                            >
                                <p className="text-lg text-gray-800 leading-relaxed">
                                    Well, he is nearly 93 years old, yet he still thinks as
                                    swiftly as ever. He dresses himself in an old black frock
                                    coat, usually several buttons missing. A long beard clings to
                                    his chin, giving those who observe him a pronounced feeling of
                                    the utmost respect. When he speaks, his voice is just a bit
                                    cracked and quivers a bit. Twice each day he plays skillfully
                                    and with zest upon a small organ. Except in the winter when
                                    the snow or ice prevents, he slowly takes a short walk in the
                                    open air each day. We have often urged him to walk more and
                                    smoke less, but he always answers, "Banana oil!" Grandfather
                                    likes to be modern in his language.
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Response Message */}
                    {recordingStatus === 'stop' && questionResponse && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg mb-8 ${
                                questionResponse === 'Correct!' ? 'bg-green-100' : 'bg-red-100'
                            }`}
                        >
                            <p className="text-lg font-semibold">{questionResponse}</p>
                        </motion.div>
                    )}

                    {/* Recording Interface */}
                    {recordingStatus !== 'stop' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-4 border-t border-gray-200 pt-6"
                        >
                            <LoaderWave isAnimation={recordingStatus === 'recording'} isDark={true} />

                            <button
                                disabled={recordingStatus === 'loading'}
                                onClick={() => recordingStatus === 'idle' ? onStartRecord() : onStopRecord()}
                                className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                {recordingStatus === 'recording' ? (
                                    <div className="w-5 h-5 bg-black rounded-sm" />
                                ) : (
                                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                                        <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                    </svg>
                                )}
                            </button>
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
        <Loader loading={loading} />
    </div>
    );
}

export default SpeechArticulationPage;