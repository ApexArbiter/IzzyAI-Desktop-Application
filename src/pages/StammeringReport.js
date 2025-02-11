import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
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
        {percentage?.toFixed(1)}%
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
    <span className="text-sm font-medium min-w-[4rem]">{value?.toFixed(1)}%</span>
  </div>
);

const StammeringReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const {
    result,
    sessionId,
    expressionsArray,
    isExercise,
    isQuick,
    startTime,
    incorrectQuestions,
    incorrectExpressions,
    correctExpressions,
    correctAnswers: correct,
    incorrectAnswers: incorrect
  } = location.state || {};

  const totalQuestions = isExercise ? (incorrect + correct) : 3;
  const correctPercentage = (correct / totalQuestions) * 100;
  const percentage = isExercise ? ((incorrect / totalQuestions) * 100) : JSON.parse(result)?.stuttering;
  const expressionpercentage = (incorrectExpressions?.length / (totalQuestions?.length || totalQuestions)) * 100;
  const correctexpressionPercentage = (correctExpressions?.length / (totalQuestions?.length || totalQuestions)) * 100;

   const onPressBack=()=>{
      navigate("/home")
   }
  const addAssessmentResult = async () => {
    try {
      const token = await getToken();
      const obj = {
        expressions: isQuick ? null : expressionsArray,
        correct: isQuick ? null : correctexpressionPercentage,
        incorrect: isQuick ? null : expressionpercentage,
        questions_array: isExercise ? incorrectQuestions : null
      };

      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('SessionID', sessionId);
      formData.append('Score', isExercise ? percentage : JSON.parse(result)?.stuttering);
      formData.append('DisorderID', 2);
      
      if (isExercise) {
        formData.append('ExerciseDate', moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
        formData.append('CompletionStatus', 'complete');
        formData.append('CompletedQuestions', totalQuestions);
      } else {
        formData.append('AssessmentDate', moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
      }
      
      if (isQuick) {
        formData.append('quick_assessment', "quick_assessment");
      }
      formData.append('emotion', JSON.stringify(obj));

      const response = await fetch(
        `${BaseURL}/${isExercise ? 'stammering_user_exercise' : "add_assessment_stammering"}`,
        {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Assessment submission failed');
    } catch (error) {
      console.error('Error posting assessment result:', error);
    }
  };

  const updateSession = async () => {
    try {
      await endSession(
        sessionId,
        startTime,
        isQuick ? 'quick_assessment_status' : 'Completed',
        2
      );
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  useEffect(() => {
    addAssessmentResult();
    updateSession();
  }, []);

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

        {!isQuick && expressionsArray && (
          <div className="mb-2">
            <p className="text-lg mb-2">
              Facial Expressions: {expressionsArray.join(", ")}
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
              value={isExercise ? correctPercentage : JSON.parse(result)?.no_stuttering} 
              color="#71D860" 
            />
          </div>

          <div>
            <p className="text-lg">{isExercise ? "Wrong Answers" : "Stuttering"}</p>
            <LinearProgressBar 
              value={isExercise ? percentage : JSON.parse(result)?.stuttering} 
              color="#FC4343" 
            />
          </div>
        </div>

        {isExercise && incorrectQuestions?.length > 0 && (
          <div className="flex flex-col">
            <h3 className="text-lg mt-2">List of Incorrect Answers:</h3>
            <div className="max-h-[100px] overflow-y-auto rounded-lg">
              <div className="space-y-1">
                {incorrectQuestions.map((item, index) => (
                  <p key={index} className="ml-4">
                    {item?.Sentence?.charAt(0).toUpperCase() + item?.Sentence?.substring(1)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

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
  </div>
  );
};

export default StammeringReport;