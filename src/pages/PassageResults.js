import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import moment from 'moment';
import { endSession, getToken } from '../utils/functions';
import BaseURL from '../components/ApiCreds';

// Reusable Card Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-6 border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-800">{children}</h2>
);

const CardContent = ({ children }) => (
  <div className="p-6 ">{children}</div>
);

// Progress Circle Component
const CircularProgress = ({ percentage, size = "lg" }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const sizes = {
    sm: "w-32 h-32",
    lg: "w-48 h-48"
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
          className={`${percentage >= 70 ? 'stroke-green-500' : 'stroke-red-500'} fill-none`}
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

const PassageResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sessionId,
    isAll,
    initialExpression,
    middleExpression,
    lastExpression,
    stutteringScore,
    result, expressionsArray, isExercise, isQuick, startTime, incorrectQuestions, incorrectExpressions, correctExpressions
  } = location.state || {};
  console.log(location.state)


  // Get data from localStorage
  // const sessionId = localStorage.getItem("sessionId");
  // const initialExpression = localStorage.getItem("initialExpression");
  // const middleExpression = localStorage.getItem("middleExpression");
  // const lastExpression = localStorage.getItem("lastExpression");
  // const stutteringScore = JSON.parse(localStorage.getItem("stutteringScore") || "{}");

  const noStutteringPercentage = stutteringScore?.no_stuttering || result?.no_stuttering || 0;
  const stutteringPercentage = stutteringScore?.stuttering || result?.stuttering || 0;


  // const { userId } = useDataContext();
  const userId = localStorage.getItem("userId");
  console.log("UserId", userId)

  const correct = location.state?.correctAnswers;
  const incorrect = location.state?.incorrectAnswers;
  const totalQuestions = isExercise ? (incorrect + correct) : 3

  const correctPercentage = (correct / totalQuestions) * 100;
  const percentage = isExercise ? ((incorrect / totalQuestions) * 100) : result?.stuttering;

  const expressionpercentage = (incorrectExpressions?.length / (totalQuestions?.length || totalQuestions)) * 100;
  const correctexpressionPercentage = (correctExpressions?.length / (totalQuestions?.length || totalQuestions)) * 100;







  const addAssessmentResult = async () => {
    const token = await getToken()
    try {
      if (!userId) {
        throw new Error('UserID is required');
      }
      const obj = {
        expressions: isQuick ? null : expressionsArray,
        correct: isQuick ? null : correctexpressionPercentage,
        incorrect: isQuick ? null : expressionpercentage,
        questions_array: isExercise ? incorrectQuestions : null
      }
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('SessionID', sessionId);
      formData.append('Score', isExercise ? percentage : result?.stuttering);
      formData.append('DisorderID', 2);
      if (isExercise) {
        formData.append('ExerciseDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));
        formData.append('CompletionStatus', 'complete');
        formData.append('CompletedQuestions', totalQuestions);
      } else {
        formData.append('AssessmentDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));
      }
      if (isQuick) {
        formData.append('quick_assessment', "quick_assessment");
      }
      formData.append('emotion', JSON.stringify(obj));

      const response = await fetch(`${BaseURL}/${isExercise ? 'stammering_user_exercise' : 'add_assessment_stammering'}`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(response)

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error posting assessment result:', error);
      // Handle error appropriately - maybe show user feedback
      throw error;
    }
  };






  const updateSession = async () => {
    const response = await endSession(sessionId, startTime, isQuick ? 'quick_assessment_status' : 'Completed', 2)
    console.log("update session", response)
  }



  useEffect(() => {
    // setTimeout(() => {
    //     if (!isExercise) {
    //         setShowModal(true)
    //     }
    // }, 1000);
    addAssessmentResult()
    updateSession()
  }, [])





  const getExpressionColor = (expression) => {
    switch (expression?.toLowerCase()) {
      case 'happy':
        return 'text-green-500';
      case 'sad':
        return 'text-red-500';
      case 'neutral':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
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
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Passage Assessment Results</h1>
        </motion.div>

        <div className={`${expressionsArray ? 'grid md:grid-cols-2 gap-6' : 'flex justify-center w-100'} `}>
          {/* Stuttering Score */}
          <Card className={`${expressionsArray ? '' : "w-full text-center"} `}>
            <CardHeader>
              <CardTitle>Fluency Score</CardTitle>
            </CardHeader>
            <div className="flex justify-center p-6">
              <CircularProgress percentage={noStutteringPercentage} />
            </div>
          </Card>

          {/* Expression Analysis */}
          {expressionsArray?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expression Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Initial Expression:</span>
                    <span className={`font-semibold ${getExpressionColor(initialExpression)}`}>
                      {initialExpression || 'Not detected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Middle Expression:</span>
                    <span className={`font-semibold ${getExpressionColor(middleExpression)}`}>
                      {middleExpression || 'Not detected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Final Expression:</span>
                    <span className={`font-semibold ${getExpressionColor(lastExpression)}`}>
                      {lastExpression || 'Not detected'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Analysis */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Stuttering Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">Fluent Speech</div>
                    <div className="text-2xl font-bold text-green-700">
                      {noStutteringPercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-600">Stuttering Detected</div>
                    <div className="text-2xl font-bold text-red-700">
                      {stutteringPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 flex justify-center gap-4"
        >
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>

        </motion.div>
      </div>
    </motion.div>
  );
};

export default PassageResults;