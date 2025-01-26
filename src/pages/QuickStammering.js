import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDataContext } from '../contexts/DataContext';
import { getToken } from "../utils/functions";
import { useNavigate, useLocation } from 'react-router-dom';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import Loader from '../components/Loader';
import dynamicfunctions from '../utils/dynamicfunctions';
import { ArrowLeft } from 'lucide-react';


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
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [startTime, setStartTime] = useState('');
    const [backendResponseText, setBackendResponseText] = useState(null);

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
        <div className="flex flex-col min-h-screen bg-white">
            <header className="bg-white py-4 px-6 border-b">
                <h1 className="text-xl font-semibold text-[#111920]">
                    Quick Articulation Disorder Assessment
                </h1>
            </header>

            <main className="flex-1 p-5">
                <div className="max-w-3xl mx-auto">
                    {/* Progress Section
                    <div className="mb-8">
                        <p className="text-lg mb-4">
                            Assessment <span className="font-bold">{questionCount}</span> out of{' '}
                            <span className="font-bold">{questions?.length || 0}</span>
                        </p>

                        <div className="flex items-center gap-4">
                            <LinearProgress value={percentageCompleted / 100} />
                            <span className="text-sm font-medium">{percentageCompleted.toFixed(1)}%</span>
                        </div>
                    </div> */}

                    {/* Question Image */}
                    <div className="border border-[#0CC8E8] rounded-2xl p-5 flex justify-center mb-8">

                        <div className="mb-8">
                            <p className="text-lg mb-2">Read this Paragraph:</p>
                            <p className="text-xl font-semibold">
                                Well, he is nearly 93 years old, yet he still thinks as
                                swiftly as ever. He dresses himself in an old black frock
                                coat, usually several buttons missing. A long beard clings to
                                his chin, giving those who observe him a pronounced feeling of
                                the utmost respect. When he speaks, his voice is just a bit
                                cracked and quivers a bit. Twice each day he plays skillfully
                                and with zest upon a small organ. Except in the winter when
                                the snow or ice prevents, he slowly takes a short walk in the
                                open air each day. We have often urged him to walk more and
                                smoke less, but he always answers, “Banana oil!” Grandfather
                                likes to be modern in his language.
                            </p>
                        </div>


                    </div>



                    {/* Response */}
                    {recordingStatus === 'stop' && questionResponse && (
                        <div className={`p-4 rounded-lg mb-8 ${questionResponse === 'Correct!' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            <p className="text-lg font-semibold">{questionResponse}</p>
                        </div>
                    )}

                    {/* Recording Interface */}
                    {recordingStatus !== 'stop' && (
                        <div className="flex items-center justify-center gap-4 border-t pt-4 mt-8">
                            <LoaderWave isAnimation={recordingStatus === 'recording'} isDark={true} />

                            <button
                                disabled={recordingStatus === 'loading'}
                                onClick={() => recordingStatus === 'idle' ? onStartRecord() : onStopRecord()}
                                className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full"
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
                        </div>
                    )}

                    {/* Navigation Buttons
                    {recordingStatus === 'stop' && (
                        <div className="flex flex-col items-center gap-4 mt-8">
                            {questionCount < (questions?.length || 0) && (
                                <div className="flex justify-between w-full gap-4">
                                    {questionCount !== 1 && (
                                        <PrevButton
                                            onPress={() => {
                                                setRecordingStatus('idle');
                                                setQuestionResponse('');
                                                setQuestionCount(prev => prev - 1);
                                            }}
                                            title="Previous"
                                        />
                                    )}
                                    <NextButton
                                        onPress={() => {
                                            setRecordingStatus('idle');
                                            setQuestionResponse('');
                                            if (questionCount < questions?.length) {
                                                setQuestionCount(prev => prev + 1);
                                            } else {
                                                endAssessment();
                                            }
                                        }}
                                        title="Next"
                                    />
                                </div>
                            )}
                            <EndButton
                                onPress={endAssessment}
                                title={questionCount < (questions?.length || 0) ? "End Now" : "Finish"}
                            /> */}
                    {/* </div> */}
                    {/* )} */}
                </div>
            </main>
        </div>
    );
}

export default SpeechArticulationPage;