import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import moment from 'moment';
import { endSession, getToken } from "../utils/functions";
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


const ResultExpressiveLanguage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categorywiseReport, isExercise, isExpressive, sessionId, startTime, totalQuestions: total, expressionsArray, incorrectExpressions, correctExpressions, isQuick } = location.state || {};
  console.log("State:", location.state)
  const { expressiveReport } = useDataContext();
  let userId = localStorage.getItem("userId");
  // console.log("userId", userId, "expressiveReport", expressiveReport)

  const correct = location.state?.correctAnswers;
  const incorrect = location.state?.incorrectAnswers;
  const totalQuestions = incorrect + correct;

  const percentage = Math.round((incorrect / totalQuestions) * 100);

  const correctPercentage = (correct / totalQuestions) * 100;

  const expressionpercentage = (incorrectExpressions?.length / totalQuestions) * 100;
  const correctexpressionPercentage = (correctExpressions?.length / totalQuestions) * 100;

  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEndTime(new Date().toISOString().slice(0, 19).replace('T', ' '));
  }, []);

  const addReceptiveReport = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!categorywiseReport) {
        throw new Error('Category report data missing');
      }

      const divisor = isExpressive ? 9 : 5;
      const formData = new FormData();

      formData.append('user_id', userId);
      formData.append('category1', (categorywiseReport.category1 * 100) / divisor);
      formData.append('category2', (categorywiseReport.category2 * 100) / divisor);

      if (!isExpressive) {
        formData.append('category3', (categorywiseReport.category3 * 100) / 5);
        formData.append('category4', (categorywiseReport.category4 * 100) / 5);
      }

      // Debug log
      console.log('Sending data:', Object.fromEntries(formData));

      const response = await fetch(`${BaseURL}/${isExpressive ? "post_performance_expressive" : "post_performance"}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const responseText = await response.text();
      console.log('Server response:', responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${responseText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const addExerciseResult = async () => {
    const token = await getToken()
    try {
      const obj = {
        expressions: isQuick ? null : (isExpressive ? expressionsArray : null),
        correct: isQuick ? null : (isExpressive ? correctexpressionPercentage : null),
        incorrect: isQuick ? null : (isExpressive ? expressionpercentage : null),
        questions_array: expressiveReport
      }

      setLoading(true)
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('Score', percentage);
      formData.append('SessionID', sessionId);
      formData.append('DisorderID', isExpressive ? 4 : 5);
      formData.append('ExerciseDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));
      formData.append('CompletionStatus', totalQuestions == total ? "complete" : "incomplete");
      formData.append('CompletedQuestions', totalQuestions);
      formData.append('emotion', JSON.stringify(obj));

      console.log('Sending data:', Object.fromEntries(formData));
      console.log(formData);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }


      const response = await fetch(`${BaseURL}/receptive_expressive_user_exercise`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': "Bearer " + token }///}
      });
      if (response.ok) {

      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  };
  const addAssessmentResult = async () => {
    const token = await getToken()
    try {
      const obj = {
        expressions: isQuick ? null : (isExpressive ? expressionsArray : null),
        correct: isQuick ? null : (isExpressive ? correctexpressionPercentage : null),
        incorrect: isQuick ? null : (isExpressive ? expressionpercentage : null),
        questions_array: expressiveReport
      }
      setLoading(true)
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('Score', percentage);

      formData.append('SessionID', sessionId);
      formData.append('DisorderID', isExpressive ? 4 : 5);
      formData.append('AssessmentDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));
      formData.append('emotion', JSON.stringify(obj));
      if (isQuick) {
        formData.append('quick_assessment', "quick_assessment");
      }
      console.log('Sending data:', Object.fromEntries(formData));
      const response = await fetch(`${BaseURL}/add_assessment_result`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': "Bearer " + token } ///}
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData)

        if (categorywiseReport) {
          addReceptiveReport()
        } else {
          setLoading(false)
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
    }
  };
  const updateSession = async () => {
    const response = await endSession(sessionId, startTime, isQuick ? 'quick_assessment_status' : 'Completed', isExpressive ? 4 : 5)
    console.log(response)
  };

  updateSession();

  useEffect(() => {
    if (isExercise) {
      addExerciseResult()
    } else {
      addAssessmentResult();
    }
  }, []);

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
            {isQuick ?
              (isExpressive ? "Quick Expressive Language Disorder Assessment Result Report" :
                'Quick Receptive Language Disorder Assessment Result Report') :
              (isExpressive ?
                (isExercise ? "Expressive Language Disorder Exercise Result Report" :
                  "Expressive Language Disorder Assessment Result Report") :
                (isExercise ? "Receptive Language Disorder Exercise Result Report" :
                  "Receptive Language Disorder Assessment Result Report"))
            }
          </h1>

          <div className="flex justify-center gap-8 mb-3">
            <CircularProgress
              percentage={percentage}
              size={!isQuick ? "lg" : "lg"}
            />
            {(isExpressive && !isQuick) && (
              <CircularProgress
                percentage={expressionpercentage}
                size="lg"
              />
            )}
          </div>

          {(isExpressive && !isQuick) && (
            <div className="mb-2">
              <p className="text-lg mb-2">
                Facial Expressions: {expressionsArray?.join(", ")}
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
              <p className="text-lg">Correct Answers</p>
              <LinearProgressBar value={correctPercentage} color="#71D860" />
            </div>

            <div>
              <p className="text-lg">Incorrect Answers</p>
              <LinearProgressBar value={percentage} color="#FC4343" />
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-lg mt-2">List of Incorrect Answers:</h3>
            <div className="max-h-[100px] overflow-y-auto rounded-lg">
              <div className="">
                {expressiveReport?.map((item, index) => (
                  <div key={index} className="pl-3 rounded">
                    {isExpressive ? item?.question : item?.question_text}
                  </div>
                ))}
              </div>
            </div>
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

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default ResultExpressiveLanguage;