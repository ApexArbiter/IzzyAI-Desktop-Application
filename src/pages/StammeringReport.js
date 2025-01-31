import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import { endSession, getToken } from '../utils/functions';
import BaseURL from '../components/ApiCreds';

// Reusable Card Components for consistent styling
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
  <div className="p-6">{children}</div>
);

// Progress Circle Component with improved styling
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
        {percentage?.toFixed(1)}%
      </span>
    </div>
  );
};

const StammeringReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  console.log(location.state)

  // Extract all necessary data from location state
  const {
    sessionId,
    SessiontypId,
    startTime,
    correctAnswers,
    incorrectAnswers,
    incorrectQuestions,
    expressionsArray,
    isExercise,
    isQuick,
    incorrectExpressions,
    correctExpressions
  } = location.state || {};

  // Calculate various percentages and scores
  // Fix the calculations in StammeringReport
  const totalQuestions = 3; // This should be a fixed value
  const overallScore = correctAnswers ? (correctAnswers / totalQuestions) * 100 : 0;
  const expressionPercentage = incorrectExpressions?.length ?
    (incorrectExpressions.length / totalQuestions) * 100 : 0;
  const correctExpressionPercentage = correctExpressions?.length ?
    (correctExpressions.length / totalQuestions) * 100 : 0;

  // Function to determine expression analysis color
  const getExpressionColor = (count, total) => {
    const percentage = (count / total) * 100;
    return percentage >= 70 ? 'text-green-500' : 'text-red-500';
  };

  // Submit assessment results to backend
  const addAssessmentResult = async () => {
    try {
      const token = await getToken();
      if (!userId) throw new Error('UserID is required');

      const emotionData = {
        expressions: isQuick ? null : expressionsArray,
        correct: isQuick ? null : correctExpressionPercentage || 0,
        incorrect: isQuick ? null : expressionPercentage || 0,
        questions_array: isExercise ? incorrectQuestions || [] : null
      };

      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('SessionID', sessionId);
      formData.append('Score', overallScore || 0);
      formData.append('DisorderID', 2);

      if (isExercise) {
        formData.append('ExerciseDate', moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
        formData.append('CompletionStatus', 'complete');
        formData.append('CompletedQuestions', totalQuestions);
      }

      formData.append('emotion', JSON.stringify(emotionData));

      const response = await fetch(
        `${BaseURL}/${isExercise ? 'stammering_user_exercise' : 'add_assessment_stammering'}`,
        {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Assessment result submitted successfully');
    } catch (error) {
      console.error('Error posting assessment result:', error);
    }
  };

  // Update session status
  const updateSession = async () => {
    try {
      await endSession(
        sessionId,
        startTime,
        isQuick ? 'quick_assessment_status' : 'Completed',
        2
      );
      console.log('Session updated successfully:');
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  // Initialize data submission on component mount
  useEffect(() => {
    addAssessmentResult();
    updateSession();
  }, []);

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
          <h1 className="text-2xl font-bold">Stammering Assessment Results</h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <div className="flex justify-center p-6">
              <CircularProgress percentage={overallScore} />
            </div>
          </Card>

          {/* Expression Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Expression Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Correct Expressions</div>
                  <div className="text-2xl font-bold text-green-700">
                    {correctExpressions?.length || 0}
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">Incorrect Expressions</div>
                  <div className="text-2xl font-bold text-red-700">
                    {incorrectExpressions?.length || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Exercise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Correct Attempts</div>
                  <div className="text-2xl font-bold text-green-700">
                    {correctAnswers || 0}/{totalQuestions}
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">Incorrect Attempts</div>
                  <div className="text-2xl font-bold text-red-700">
                    {incorrectAnswers || 0}/{totalQuestions}
                  </div>
                </div>
              </div>

              {incorrectQuestions?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Areas for Improvement</h3>
                  <div className="space-y-3">
                    {incorrectQuestions.map((question, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                      >
                        <span className="font-medium">Exercise {index + 1}</span>
                        <span className="text-red-600">{question.Sentence}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

export default StammeringReport;