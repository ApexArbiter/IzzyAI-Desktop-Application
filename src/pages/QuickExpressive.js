import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import { getQuickExpressiveQuestions, getToken } from "../utils/functions";
import CustomHeader from '../components/CustomHeader';
import Loader from '../components/Loader';
import LogoQuestionView from '../components/LogoQuestionView';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
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

function QuickExpressive() {
    const navigate = useNavigate();
    const { sessionId } = useLocation().state || {};
    const { setExpressiveReport } = useDataContext();
    const userId = localStorage.getItem('userId');

    const [startTime, setStartTime] = useState('');
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [questionResponse, setQuestionResponse] = useState('');
    const [questionCount, setQuestionCount] = useState(1);
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        const currentStartTime = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
        setStartTime(currentStartTime);
    }, []);

    useEffect(() => {
        const fetchQuestionData = async () => {
            try {
                setLoading(true);
                const response = await getQuickExpressiveQuestions(userId);
                if (response) {
                    setQuestions(response);
                }
            } catch (error) {
                console.error('Network request failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestionData();
    }, []);

    const navigateTo = () => {
        setExpressiveReport(incorrectQuestions);
        navigate('/result-expressive-language', {
            state: {
                sessionId,
                startTime,
                correctAnswers: correctAnswersCount,
                incorrectAnswers: incorrectQuestions?.length,
                incorrectQuestions,
                isExpressive: true,
                totalQuestions: questions?.length,
                isQuick: true
            }
        });
    };

    const onStartRecord = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await sendAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecordingStatus('recording');
        } catch (error) {
            console.error('Error starting recording:', error);
            setRecordingStatus('idle');
        }
    };

    const onStopRecord = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setRecordingStatus('loading');
        } else {
            setRecordingStatus('idle');
        }
    };

    const onCorrectAnswer = (ques) => {
        setQuestionResponse('Matched');
        setCorrectAnswersCount(prevCount => prevCount + 1);
        if (!correctQuestions.includes(ques + questionCount)) {
            setCorrectQuestions(prevQuestions => [
                ...prevQuestions,
                ques + questionCount,
            ]);
        }
        if (incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
            setIncorrectQuestions(prevQuestions =>
                prevQuestions.filter(q => q?.questiontext !== ques + questionCount),
            );
        }
        setRecordingStatus("stop");
    };

    const onWrongAnswer = (ques) => {
        if (!incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
            setIncorrectQuestions(prevQuestions => [
                ...prevQuestions,
                { ...questions?.[questionCount - 1], questiontext: ques + ques + questionCount },
            ]);
        }
        if (correctQuestions.includes(ques + ques + questionCount)) {
            setCorrectAnswersCount(prevCount => prevCount - 1);
            setCorrectQuestions(prevQuestions =>
                prevQuestions.filter(q => q !== ques + questionCount),
            );
        }
        setQuestionResponse('UnMatched');
    };

    const sendAudio = async (audioBlob) => {
        const token = await getToken();
        const formData = new FormData();
        formData.append('audio', audioBlob, 'sound.wav');

        try {
            setLoading(true);
            const response = await fetch(`${BaseURL}/api/voice_to_text`, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                    Authorization: "Bearer " + token
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            const data = JSON.parse(result);

            const answers = questions?.[questionCount - 1]?.answers?.split(";");
            const isMatched = answers?.find((item) =>
                item?.trim()?.toLowerCase() === data?.transcription?.toLowerCase() + "."
            );

            if (isMatched) {
                onCorrectAnswer(questions?.[questionCount - 1]?.question);
            } else {
                onWrongAnswer(questions?.[questionCount - 1]?.question);
            }
        } catch (error) {
            console.error('Network request failed:', error);
            onWrongAnswer(questions?.[questionCount - 1]?.question);
        } finally {
            setRecordingStatus("stop");
            setLoading(false);
        }
    };

    const percentageCompleted = ((questionCount) / questions?.length) * 100;

    return (
      <div className="min-h-screen overflow-hidden bg-gray-50 px-5 py-3">
      <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <CustomHeader
                  title="Quick Expressive Language Disorder Assessment"
                  goBack={() => navigate(-1)}
              />

              <main className="p-6">
                  {/* Progress Section */}
                  <div className="mb-4">
                      <p className="text-start mb-1">
                          Assessment <span className="font-bold">{questionCount}</span> out of{' '}
                          <span className="font-bold">{questions?.length || 0}</span>
                      </p>

                      <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
                              <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentageCompleted}%` }}
                                  className="h-full bg-orange-500"
                                  transition={{ duration: 0.5 }}
                              />
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                              {percentageCompleted.toFixed(1)}%
                          </span>
                      </div>
                  </div>

                  {/* Question Image */}
                  <div className="border border-[#0CC8E8] rounded-2xl p-4 mx-auto max-w-xl mb-8">
                      {questions?.[questionCount - 1] && (
                          <div className="flex justify-center">
                              <img
                                  src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_label}`}
                                  alt="Question"
                                  className="w-[200px] h-[200px] object-contain rounded-lg"
                              />
                          </div>
                      )}
                  </div>

                  {/* Question Text */}
                  <div className="mb-8">
                      {questions?.[questionCount - 1] && (
                          <LogoQuestionView
                              first_text="Answer this..."
                              second_text={questions[questionCount - 1]?.question}
                          />
                      )}

                      {recordingStatus === 'stop' && questionResponse && (
                          <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              className="mt-4"
                          >
                              <LogoQuestionView
                                  first_text={questionResponse}
                                  second_text={null}
                                  questionResponse={questionResponse}
                              />
                          </motion.div>
                      )}
                  </div>

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

                  {/* Navigation Buttons */}
                  {recordingStatus === 'stop' && (
                      <motion.div
                          className="space-y-4 max-w-xs mx-auto"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                      >
                          {questionCount < (questions?.length || 0) && (
                              <div className="flex gap-3">
                                  {questionCount !== 1 && (
                                      <div className="w-1/2">
                                          <PrevButton
                                              onPress={() => {
                                                  setRecordingStatus('idle');
                                                  setQuestionResponse('');
                                                  setQuestionCount(prev => prev - 1);
                                              }}
                                              title="Previous"
                                          />
                                      </div>
                                  )}
                                  <div className="w-1/2">
                                      <NextButton
                                          onPress={() => {
                                              setRecordingStatus('idle');
                                              setQuestionResponse('');
                                              if (questionCount < questions?.length) {
                                                  setQuestionCount(prev => prev + 1);
                                              } else {
                                                  navigateTo();
                                              }
                                          }}
                                          title="Next"
                                      />
                                  </div>
                              </div>
                          )}
                          <EndButton
                              onPress={navigateTo}
                              title={questionCount < (questions?.length || 0) ? "End Now" : "Finish"}
                          />
                      </motion.div>
                  )}
              </main>
          </div>
      </div>
      <Loader loading={loading} />
  </div>
    );
}

export default QuickExpressive;