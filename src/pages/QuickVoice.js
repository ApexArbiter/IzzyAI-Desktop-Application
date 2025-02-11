import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from "../utils/functions";
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import Loader from '../components/Loader';
import CustomHeader from '../components/CustomHeader';
import LogoQuestionView from '../components/LogoQuestionView';

import { motion } from 'framer-motion';

// Button Components
const EndButton = ({ onPress, title }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPress}
        className="w-full bg-red-500 text-white rounded-full py-2 px-4 font-semibold"
    >
        {title}
    </motion.button>
);

const NextButton = ({ onPress, title }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPress}
        className="w-full bg-green-500 text-white rounded-full py-2 px-4 font-semibold"
    >
        {title}
    </motion.button>
);

const PrevButton = ({ onPress, title }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPress}
        className="w-full border border-gray-300 text-gray-700 rounded-full py-2 px-4 font-semibold"
    >
        {title}
    </motion.button>
);

// LoaderWave Component
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
const VoiceDisorderPage = () => {
  const location = useLocation();
  const { sessionId } = location.state || {};
  const navigate = useNavigate();
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [startTime, setStartTime] = useState(null);
  const [exerciseData, setExerciseData] = useState(null);
  const [exerciseCount, setExerciseCount] = useState(1);
  const [questionScores, setQuestionScores] = useState([]);
  const [error, setError] = useState(null);
  const [voiceResponse, setVoiceResponse] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
  const storedUserDetail = localStorage.getItem("userDetails");
  const percentageCompleted = exerciseCount / 3;

  useEffect(() => {
    const currentStartTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setStartTime(currentStartTime);
    localStorage.setItem('startTime', currentStartTime);
    fetchExerciseData();
  }, []);

  const fetchExerciseData = async () => {
    try {
      const token = await getToken();
      setLoading(true)
      const userDetail = JSON.parse(storedUserDetail);
      const response = await fetch(
        `${BaseURL}/get_voice_disorders/${userDetail?.AvatarID}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      if (data) setExerciseData(data?.voice_disorders);
    } catch (error) {
      setError('Failed to fetch exercise data');
      console.error('Error:', error);
    } finally {
      setLoading(false)
    }
  };

  const onStartRecord = async () => {
    try {
      setRecordingStatus('recording');
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start(100);
    } catch (error) {
      setError('Failed to start recording');
      setRecordingStatus('idle');
    }
  };

  const onStopRecord = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          await checkVoiceDisorder(audioBlob);
        } catch (error) {
          console.error('Error:', error);
        }
        resolve();
      };
      mediaRecorderRef.current.stop();
      setRecordingStatus('stop');
    });
  };

  const checkVoiceDisorder = async (audioBlob) => {
    try {
      setLoading(true)
      const formData = new FormData();
      formData.append('audio', new File([audioBlob], 'sound.wav', { type: 'audio/wav' }));

      const token = await getToken();
      const response = await fetch(
        `${BaseURL}/predict_voice_disorder`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: formData
        }
      );

      const data = await response.json();
      setVoiceResponse(data);
      console.log('Voice Response:', data);
      let array = [...questionScores]
      let filteredArray = array?.filter(item => item?.wordtext !== exerciseData?.[exerciseCount - 1]?.WordText)
      filteredArray?.push({ ...data?.predictions, wordtext: exerciseData?.[exerciseCount - 1]?.WordText })
      setQuestionScores(filteredArray);

    } catch (error) {
      console.error('Error:', error);
      return null;
    } finally {
      setRecordingStatus('result');
      setLoading(false)
    }
  };

  const handleNextExercise = () => {
    localStorage.setItem('questionScores', JSON.stringify(questionScores));
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('startTime', startTime);

    if (exerciseCount < 3) {
      setExerciseCount(prev => prev + 1);
      setRecordingStatus('idle');
      setVoiceResponse(null);
    } else {
      navigate('/voiceReport', {
        state: {
          date: formattedDate,
          isQuick: true,
          questionScores,
          sessionId, startTime
        }
      });
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 px-5 py-3">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <CustomHeader 
                        title="Quick Voice Disorder Assessment" 
                        goBack={() => navigate(-1)} 
                    />

                    <main className="p-6">
                        {/* Progress Section */}
                        <div className="mb-4">
                            <p className="text-start mb-1">
                                Assessment <span className="font-bold">{exerciseCount}</span> out of{' '}
                                <span className="font-bold">3</span>
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentageCompleted * 100}%` }}
                                        className="h-full bg-orange-500"
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                    {(percentageCompleted * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Video Section */}
                        {exerciseData && (
                            <div className="border border-[#0CC8E8] rounded-2xl p-4 mx-auto max-w-xl mb-8">
                                <div className="aspect-video w-full relative">
                                    <video
                                        className="w-full h-full object-contain rounded-lg"
                                        controls
                                        autoPlay
                                        src={`${IMAGE_BASE_URL}${exerciseData[exerciseCount - 1]?.VideoUrl}`}
                                        onEnded={() => setRecordingStatus('idle')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Question Text */}
                        <div className="mb-8">
                            <LogoQuestionView
                                first_text="Say this..."
                                second_text={exerciseData?.[exerciseCount - 1] ? exerciseData[exerciseCount - 1]?.WordText : 'loading'}
                            />
                        </div>

                        {/* Recording Interface */}
                        {recordingStatus !== 'stop' && recordingStatus !== 'result' && (
                            <div className="flex items-center justify-center gap-4 border-t border-gray-200 pt-6">
                                <LoaderWave isAnimation={recordingStatus === 'recording'} isDark={true} />

                                <button
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
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {recordingStatus === 'result' && (
                            <motion.div
                                className="space-y-4 max-w-xs mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        {exerciseCount !== 1 && (
                                            <div className="w-1/2">
                                                <PrevButton
                                                    onPress={() => {
                                                        setRecordingStatus('idle');
                                                        setExerciseCount(prev => prev - 1);
                                                        setVoiceResponse(null);
                                                    }}
                                                    title="Previous"
                                                />
                                            </div>
                                        )}
                                        <div className="w-1/2">
                                            <NextButton
                                                onPress={handleNextExercise}
                                                title={exerciseCount < 3 ? "Next" : "Finish"}
                                            />
                                        </div>
                                    </div>
                                    <EndButton
                                        onPress={() => navigate('/voiceReport', {
                                            state: {
                                                date: formattedDate,
                                                isQuick: true,
                                                questionScores,
                                                sessionId,
                                                startTime
                                            }
                                        })}
                                        title="End Now"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
            <Loader loading={loading} />
        </div>
  );
};

export default VoiceDisorderPage;