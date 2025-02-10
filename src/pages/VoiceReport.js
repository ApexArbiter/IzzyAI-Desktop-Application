import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { endSession, getToken } from '../utils/functions';
import BaseURL from '../components/ApiCreds';

const CircularProgress = ({ percentage, size = "lg", tintColor = "#FC4343", backgroundColor = "#71D860" }) => {
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = size === "lg" ? 15 : 30;

  return (
    <div className={`relative ${size === "lg" ? "w-48 h-48" : "w-64 h-64"} flex items-center justify-center`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none"
          style={{ stroke: backgroundColor }}
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none"
          style={{
            stroke: tintColor,
            strokeDasharray: circumference,
            strokeDashoffset: circumference - (percentage / 100) * circumference,
            strokeLinecap: "round",
            transition: "stroke-dashoffset 0.5s ease-out"
          }}
        />
      </svg>
      <span className={`absolute ${size === "lg" ? "text-4xl" : "text-5xl"} font-medium text-red-500`}>
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
};

const LinearProgressBar = ({ value, color }) => (
  <div className="flex items-center w-full gap-4">
    <div className="flex-1 bg-gray-200 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          backgroundColor: color
        }}
      />
    </div>
    <span className="text-sm font-medium min-w-[4rem]">{value.toFixed(1)}%</span>
  </div>
);
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
    <div className="h-screen overflow-hidden bg-[#f2f1f1]">
      <div className="h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl flex flex-col">
          <h1 className="text-2xl text-center font-semibold mb-4">
            {isQuick
              ? "Quick Voice Disorder Assessment Result Report"
              : isExercise
                ? "Voice Disorder Exercise Result Report"
                : "Voice Disorder Assessment Result Report"
            }
          </h1>

          <div className="flex justify-center gap-8 mb-3">
            <CircularProgress
              percentage={percentage}
              size={!isQuick ? "lg" : "xl"}
            />
            {!isQuick && (
              <CircularProgress
                percentage={expressionpercentage}
                size="lg"
              />
            )}
          </div>

          {!isQuick && expressionArray && (
            <div className="mb-2">
              <p className="text-lg mb-2">
                Facial Expressions: {expressionArray?.join(", ")}
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-lg">Correct Facial Expressions</p>
                  <LinearProgressBar
                    value={correctexpressionPercentage}
                    color="#71D860"
                  />
                </div>

                <div>
                  <p className="text-lg">Incorrect Facial Expressions</p>
                  <LinearProgressBar
                    value={expressionpercentage}
                    color="#FC4343"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {questionScores?.map((item, index) => (
              <div key={index}>
                <p className="text-lg">Sound {index + 1}</p>
                <LinearProgressBar
                  value={typeof item === 'number' ? item : parseFloat(item['Voice-Disorder']) || 0}
                  color={typeof item === 'number' 
                    ? (item >= 50 ? "#71D860" : "#FC4343")
                    : (parseFloat(item['Voice-Disorder']) >= 50 ? "#71D860" : "#FC4343")}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={onPressBack}
              className="px-12 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default VoiceDisorderResult;