import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getReceptiveQuestions, shuffleArray } from "../utils/functions";
import Loader from '../components/Loader';
import VideoPlayer from '../components/VideoPlayer';
import LogoQuestionView from '../components/LogoQuestionView';
import { IMAGE_BASE_URL } from '../components/ApiCreds';
import { useDataContext } from '../contexts/DataContext';
import { ArrowLeft } from 'lucide-react';

const ReceptiveAssessment = () => {
  const location = useLocation();
  const { sessionId, isAll } = location.state || {};
  console.log("State:", location.state);
  const navigate = useNavigate();
  const { setExpressiveReport } = useDataContext();
  const videoRef = useRef(null);
  const [userDetail, setUserDetail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [questionResponse, setQuestionResponse] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [correctQuestions, setCorrectQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [isVideoEnd, setIsVideoEnd] = useState(false);
  const [categorywiseReport, setCategoryWiseReport] = useState({
    category1: 0,
    category2: 0,
    category3: 0,
    category4: 0
  });

  const User = () => localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = () => {
      try {
        const storedUserDetail = localStorage.getItem("userDetails");
        const storedUserId = User();

        if (storedUserDetail) {
          setUserDetail(JSON.parse(storedUserDetail));
        }

        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error retrieving user details:", error);
      }
    };

    fetchData();
    setStartTime(new Date().toISOString().slice(0, 19).replace('T', ' '));
  }, []);

  const fetchQuestionData = async () => {
    try {
      setIsLoading(true);
      const response = await getReceptiveQuestions(userId, userDetail?.AvatarID);
      if (response) {
        setQuestions(response);
        setCurrentImages(shuffleArray(response?.[questionCount - 1]?.images || []));
      }
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userDetail?.AvatarID) {
      fetchQuestionData();
    }
  }, [userId, userDetail]);

  const onCorrectAnswer = (ques) => {
    setQuestionResponse('Correct!');
    setCorrectAnswersCount(prev => prev + 1);
    setCorrectQuestions(prev => [...new Set([...prev, ques])]);
    setIncorrectQuestions(prev => prev.filter(q => q?.question !== ques));
  };

  const onWrongAnswer = (ques) => {
    setQuestionResponse('Incorrect!');
    setIncorrectQuestions(prev => [...new Set([...prev, questions?.[questionCount - 1]])]);
    if (correctQuestions.includes(ques)) {
      setCorrectAnswersCount(prev => prev - 1);
      setCorrectQuestions(prev => prev.filter(q => q !== ques));
    }

    const categoryIndex = Math.floor((questionCount - 1) / 5);
    setCategoryWiseReport(prev => ({
      ...prev,
      [`category${categoryIndex + 1}`]: prev[`category${categoryIndex + 1}`] + 1
    }));
  };

  const navigateTo = () => {
    // Prepare data for localStorage
    const assessmentData = {
      sessionId,
      startTime,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectQuestions?.length,
      incorrectQuestions,
      totalQuestions: questions?.length,
      categorywiseReport,
      assessmentType: 'receptive', // Add this to specify the assessment type
      expressionData: null // Add this if you have any expression-related data
    };

    // Store data in localStorage
    // localStorage.setItem('sessionId', sessionId);
    // localStorage.setItem('startTime', startTime);
    // localStorage.setItem('correctAnswers', correctAnswersCount);
    // localStorage.setItem('incorrectAnswers', incorrectQuestions?.length);
    // localStorage.setItem('totalQuestions', questions?.length);
    // localStorage.setItem('assessmentType', 'receptive');
    // localStorage.setItem('incorrectQuestions', JSON.stringify(incorrectQuestions));
    // localStorage.setItem('categorywiseReport', JSON.stringify(categorywiseReport));

    // Navigate to the new generalized result page
    setExpressiveReport(incorrectQuestions),
      navigate('/result-expressive-language', {
        state: {
          sessionId: sessionId,
          startTime: startTime,
          correctAnswers: correctAnswersCount,
          incorrectAnswers: incorrectQuestions?.length,
          incorrectQuestions: incorrectQuestions,
          isExpressive: false,
          totalQuestions: questions?.length,
          categorywiseReport
        }
      });
  };

  const onPressImage = async (item, evt) => {
    const currentQuestion = questions?.[questionCount - 1];

    if (currentQuestion?.image_url) {
      const rect = evt.target.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;

      const coordinates = JSON.parse(item?.coordinates || '[]');
      const [min_x, min_y, max_x, max_y] = coordinates;

      if (x >= min_x && x <= max_x && y >= min_y && y <= max_y) {
        onCorrectAnswer(currentQuestion?.question_text);
      } else {
        onWrongAnswer(currentQuestion?.question_text);
      }
    } else {
      const imagePath = item?.split("/");
      const fileName = imagePath?.[imagePath?.length - 1]?.split(".")[0];
      if (currentQuestion?.correct_answers?.[0] === fileName) {
        onCorrectAnswer(currentQuestion?.question_text);
      } else {
        onWrongAnswer(currentQuestion?.question_text);
      }
    }
  };

  const percentageCompleted = (questionCount / (questions?.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold ml-3">Receptive Language Assessment</h1>
            </div>
          </div>

          <main className="p-6">
            {/* Progress Section */}
            <div className="mb-8">
              <p className="text-center mb-4">
                Question <span className="font-bold">{Math.min(questionCount, questions?.length || 0)}</span> out of{' '}
                <span className="font-bold">{questions?.length || 0}</span>
              </p>

              {percentageCompleted.toString() !== 'Infinity' && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentageCompleted}%` }}
                      className="h-full bg-green-500"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {percentageCompleted.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Question Section */}
            {questions?.[questionCount - 1] && (
              <div className="mb-8">
                <LogoQuestionView
                  first_text={''}
                  second_text={questions[questionCount - 1].question_text}
                />
              </div>
            )}

            {/* Image Section */}
            {questions?.length > 0 ? (
              <div className="mb-8">
                {questions[questionCount - 1]?.image_url ? (
                  <button
                    disabled={questionResponse !== '' || !isVideoEnd}
                    onClick={onPressImage}
                    className="w-full transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    <img
                      className="w-full h-64 object-cover rounded-xl shadow-lg"
                      src={`${IMAGE_BASE_URL}${questions[questionCount - 1].image_url}`}
                      alt="question"
                    />
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {currentImages?.map((item, index) => (
                      <button
                        key={index}
                        disabled={questionResponse !== '' || !isVideoEnd}
                        onClick={(evt) => onPressImage(item, evt)}
                        className="relative aspect-square transition-transform hover:scale-105 disabled:opacity-50"
                      >
                        <img
                          className="w-full h-full object-cover rounded-xl shadow-lg"
                          src={`${IMAGE_BASE_URL}${item}`}
                          alt={`option ${index + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xl text-center text-gray-500 my-8">No Questions Found</p>
            )}

            {/* Response Message */}
            {questionResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center p-4 rounded-lg mb-8 ${questionResponse === 'Correct!' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
              >
                <LogoQuestionView
                  second_text={null}
                  first_text={questionResponse}
                  questionResponse={questionResponse}
                />
              </motion.div>
            )}

            {/* Video Player */}
            <div className="mb-8">
              <VideoPlayer
                ref={videoRef}
                videoHeight={210}
                source={`${IMAGE_BASE_URL}${questions?.[questionCount - 1]?.avatar_assessment}`}
                onEnd={() => setIsVideoEnd(true)}
                onStart={() => setIsVideoEnd(false)}
              />
            </div>

            {/* Loading State */}
            <Loader loading={isLoading} />

            {/* Navigation Buttons */}
            {questionResponse !== '' && (
              <div className="space-y-4">
                {questionCount < questions?.length && (
                  <div className="flex gap-4">
                    {questionCount !== 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setQuestionResponse('');
                          setIsVideoEnd(false);
                          setQuestionCount(prev => prev - 1);
                          setCurrentImages(shuffleArray(questions?.[questionCount - 2]?.images));
                        }}
                        className="flex-1 border border-gray-300 hover:bg-gray-50 rounded-full py-3 font-semibold transition-colors"
                      >
                        Previous
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (questionCount < questions?.length) {
                          setQuestionResponse('');
                          setIsVideoEnd(false);
                          setQuestionCount(prev => prev + 1);
                          setCurrentImages(shuffleArray(questions?.[questionCount]?.images));
                        } else {
                          navigateTo();
                        }
                      }}
                      className="flex-1 bg-green-400 hover:bg-green-500 text-gray-900 rounded-full py-3 font-semibold transition-colors"
                    >
                      Next
                    </motion.button>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={navigateTo}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-3 font-semibold transition-colors"
                >
                  {questionCount < questions?.length ? 'End Now' : 'Finish'}
                </motion.button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ReceptiveAssessment;