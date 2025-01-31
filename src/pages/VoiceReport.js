import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { endSession, getToken } from '../utils/functions';

const CircularProgress = ({ percentage, size = "lg", color = "error" }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const sizes = {
    sm: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64"
  };

  const colors = {
    error: "stroke-red-500",
    success: "stroke-green-500"
  };

  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="stroke-gray-200 fill-none"
          strokeWidth="8"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={`${colors[color]} fill-none`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-2xl font-bold">
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
};

const LinearProgressBar = ({ value, color = "success" }) => {
  const colors = {
    error: "bg-red-500",
    success: "bg-green-500"
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${colors[color]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const VoiceDisorderResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { userId } = useDataContext();
  const userId = localStorage.getItem("userId")
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Extract route parameters
  const {
    questionScores,
    sessionId,
    expressionArray,
    isExercise,
    isQuick,
    startTime,
    incorrectExpressions,
    totalQuestions,
    correctExpressions
  } = location.state || {};
  console.log(location.state)


  const expressionpercentage = questionScores?.length
    ? ((incorrectExpressions?.length || 0) / questionScores.length) * 100
    : 0;

  const correctexpressionPercentage = questionScores?.length
    ? ((correctExpressions?.length || 0) / questionScores.length) * 100
    : 0;

  const averageScore = questionScores?.length > 0
    ? (questionScores.reduce((acc, score) => acc + (typeof score === 'number' ? score : parseFloat(score['Voice-Disorder']) || 0), 0) / questionScores.length).toFixed(2)
    : 0;

  const percentage = Number(averageScore);

  const addAssessmentResult = async () => {
    const token = await getToken();
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      setLoading(true);
      const obj = {
        expressions: isQuick ? null : expressionArray,
        correct: isQuick ? null : correctexpressionPercentage,
        incorrect: isQuick ? null : expressionpercentage,
        questions_array: questionScores,
        isVoice: true
      };
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('SessionID', sessionId);
      formData.append('DisorderID', 3);
      formData.append('AssessmentDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));
      formData.append('Score', averageScore);
      formData.append('emotion', JSON.stringify(obj));
      if (isQuick) {
        formData.append('quick_assessment', "quick_assessment");
      }
      console.log(formData);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(`${BaseURL}/add_assessment_voice_disorder`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': "Bearer " + token }
      });
      console.log(response);
      console.log('Full response:', await response.text());
      setLoading(false);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const addExerciseResult = async () => {
    const token = await getToken();
    try {
      setLoading(true);
      const obj = {
        expressions: isQuick ? null : expressionArray,
        correct: isQuick ? null : correctexpressionPercentage,
        incorrect: isQuick ? null : expressionpercentage,
        questions_array: questionScores,
        isVoice: true
      };
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('SessionID', sessionId);
      formData.append('DisorderID', 3);
      formData.append('ExerciseDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));
      formData.append('Score', averageScore || '0');
      formData.append('emotion', JSON.stringify(obj));

      const response = await fetch(`${BaseURL}/voice_disorder_user_exercise`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': "Bearer " + token }
      });

      setLoading(false);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const addFeedback = async (feedbackresult) => {
    const token = await getToken();
    try {
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('DisorderID', 3);
      formData.append('ModelOutput', `VoiceDisorder ${averageScore}`);
      formData.append('FeedbackAnswer', feedbackresult);
      const response = await fetch(`${BaseURL}/add_user_feedback`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': "Bearer " + token }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
      console.error('Error posting Feedback result:', error);
      throw error;
    }
  };

  const updateSession = async () => {
    await endSession(sessionId, startTime, isQuick ? 'quick_assessment_status' : 'Completed', 3);
  };

  useEffect(() => {
    if (isExercise) {
      addExerciseResult();
    } else {
      addAssessmentResult();
    }
    updateSession();
    // Optional: Add a timeout to show feedback modal
    // const timer = setTimeout(() => setShowModal(true), 1000);
    // return () => clearTimeout(timer);
  }, []);

  const handleYes = () => {
    addFeedback('Yes');
    setShowModal(false);
  };

  const handleNo = () => {
    addFeedback('No');
    setShowModal(false);
  };

  const onPressBack = () => {
    if (isQuick) {
      navigate(-2);
    } else {
      navigate('/home');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={onPressBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">
            {isQuick
              ? "Quick Voice Disorder Assessment Result Report"
              : isExercise
                ? "Voice Disorder Exercise Result Report"
                : "Voice Disorder Assessment Result Report"
            }
          </h1>
        </motion.div>

        {/* Progress Circles */}
        <div className="flex justify-center mb-8 space-x-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <CircularProgress
              percentage={percentage}
              color="error"
            />
            {/* <p className="mt-4 text-lg font-semibold">Overall Score</p> */}
          </motion.div>

          {!isQuick && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <CircularProgress
                percentage={expressionpercentage}
                color={expressionpercentage >= 50 ? "success" : "error"}
              />
              <p className="mt-4 text-lg font-semibold">Expressions</p>
            </motion.div>
          )}
        </div>

        {/* Detailed Results */}
        {!isQuick && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Facial Expressions</h3>
            <p className="mb-4">{`Expressions: ${expressionArray?.join(" , ")}`}</p>

            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium mb-2">Correct Facial Expressions</h4>
                <div className="flex items-center space-x-4">
                  <LinearProgressBar
                    value={correctexpressionPercentage}
                    color="success"
                  />
                  <span className="font-semibold">
                    {isNaN(correctexpressionPercentage) ? 0 : correctexpressionPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium mb-2">Incorrect Facial Expressions</h4>
                <div className="flex items-center space-x-4">
                  <LinearProgressBar
                    value={expressionpercentage}
                    color="error"
                  />
                  <span className="font-semibold">
                    {expressionpercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {questionScores?.map((item, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">
                {`Sound ${index + 1}`}
              </span>
              <span className={`font-semibold ${typeof item === 'number' ? (item >= 50 ? 'text-green-600' : 'text-red-600') : (parseFloat(item['Voice-Disorder']) >= 50 ? 'text-green-600' : 'text-red-600')}`}>
                {(typeof item === 'number' ? item : parseFloat(item['Voice-Disorder']) || 0).toFixed(1)}%
              </span>
            </div>
            <LinearProgressBar
              value={typeof item === 'number' ? item : parseFloat(item['Voice-Disorder']) || 0}
              color={typeof item === 'number' ? (item >= 50 ? "success" : "error") : (parseFloat(item['Voice-Disorder']) >= 50 ? "success" : "error")}
            />
          </div>
        ))}

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={onPressBack}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>

      {/* Modal Feedback */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Satisfied with Results?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleYes}
                className="px-6 py-2 border border-black rounded hover:bg-gray-100"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="px-6 py-2 border border-black rounded hover:bg-gray-100"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VoiceDisorderResult;