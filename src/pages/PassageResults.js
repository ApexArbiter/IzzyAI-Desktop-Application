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

  const onPressBack = () => {
    if (isQuick) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };




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
    <div className="h-screen overflow-hidden bg-[#f2f1f1]">
    <div className="h-[calc(100vh-64px)] p-4">
      <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl flex flex-col">
        <h1 className="text-2xl text-center font-semibold mb-4">
          {isQuick
            ? "Quick Stammering Assessment Result Report"
            : isExercise
              ? "Stammering Exercise Result Report"
              : "Stammering Assessment Result Report"
          }
        </h1>

        <div className="flex justify-center gap-8 mb-3">
          <CircularProgress
            percentage={stutteringPercentage}
            size={!isQuick ? "lg" : "lg"}
          />
          {!isQuick && (
            <CircularProgress
              percentage={expressionpercentage}
              size="lg"
            />
          )}
        </div>

        {!isQuick && expressionsArray && (
          <div className="mb-2">
            <p className=" mb-2">
            <span className='text-lg'>Facial Expressions:</span> {expressionsArray?.join(", ")}
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

        <div className="space-y-4 mb-2">
          <div>
            <p className="text-lg">{isExercise ? "Correct Answers" : "No Stuttering"}</p>
            <LinearProgressBar
              value={isExercise ? (100 - percentage) : noStutteringPercentage}
              color="#71D860"
            />
          </div>

          <div>
            <p className="text-lg">{isExercise ? "Wrong Answers" : "Stuttering"}</p>
            <LinearProgressBar
              value={isExercise ? percentage : stutteringPercentage}
              color="#FC4343"
            />
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={onPressBack}
            className="px-12 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default PassageResults;