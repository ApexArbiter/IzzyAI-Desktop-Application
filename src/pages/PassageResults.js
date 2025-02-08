import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import moment from 'moment';
import { endSession, getToken } from '../utils/functions';
import BaseURL from '../components/ApiCreds';

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

const CircularProgress = ({ percentage, size = "lg" }) => {
const radius = 75;
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
        className="stroke-[#71D860] fill-none"
        strokeWidth="15"
      />
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        className="stroke-[#FC4343] fill-none"
        strokeWidth="15"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
    <span className="absolute text-4xl font-medium text-[#FC4343]">
      {percentage?.toFixed(1)}%
    </span>
  </div>
);
};

const LinearProgressBar = ({ label, value, color }) => (
<div className="space-y-2">
  <p className="text-base md:text-lg text-[#111920]">{label}</p>
  <div className="flex items-center gap-4">
    <div className="flex-1 bg-gray-200 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          backgroundColor: color
        }}
      />
    </div>
    <span className="text-sm font-medium text-[#111920] min-w-[4rem]">
      {value?.toFixed(1)}%
    </span>
  </div>
</div>
);

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
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }


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
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <div className="p-4 md:p-6 flex-grow max-w-6xl mx-auto w-full">
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
          <h1 className="text-2xl font-semibold text-[#111920]">
            {isQuick ? "Quick Stammering Assessment Result Report" :
              isExercise ? "Stammering Exercise Result Report" :
                "Stammering Assessment Result Report"}
          </h1>
        </motion.div>

        {/* Progress Circles */}
        <div className="flex justify-center gap-8 mb-12">
          <CircularProgress percentage={stutteringPercentage} />
          {!isQuick && (
            <CircularProgress percentage={expressionpercentage} />
          )}
        </div>

        {/* Expressions Section */}
        {!isQuick && expressionsArray && (
          <Card className="mb-6">
            <CardContent className="space-y-6">
              <p className="text-lg font-medium text-[#111920]">
                Facial Expressions: {expressionsArray?.join(", ")}
              </p>
              
              <LinearProgressBar 
                label="Correct Facial Expressions"
                value={correctexpressionPercentage}
                color="#71D860"
              />
              
              <LinearProgressBar 
                label="Incorrect Facial Expressions"
                value={expressionpercentage}
                color="#FC4343"
              />
            </CardContent>
          </Card>
        )}

        {/* Stuttering Analysis */}
        <Card>
          <CardContent className="space-y-6">
            <LinearProgressBar 
              label={isExercise ? "Correct Answers" : "No Stuttering"}
              value={isExercise ? (100 - percentage) : noStutteringPercentage}
              color="#71D860"
            />
            
            <LinearProgressBar 
              label={isExercise ? "Wrong Answers" : "Stuttering"}
              value={isExercise ? percentage : stutteringPercentage}
              color="#FC4343"
            />
          </CardContent>
        </Card>

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={() => navigate("/home")}
            className="px-12 py-4 bg-[#111920] text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PassageResults;