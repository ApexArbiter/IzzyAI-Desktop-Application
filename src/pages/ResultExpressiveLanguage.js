import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import moment from 'moment';
import { endSession, getToken } from "../utils/functions";


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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">
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
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="relative">
            <svg className="transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#68d96c"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#FC4343"
                strokeWidth="8"
                strokeDasharray={`${percentage * 2.827} 282.7`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{percentage.toFixed(1)}%</span>
            </div>
          </div>

          {(isExpressive && !isQuick) && (
            <div className="relative">
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e6e6e6"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#FC4343"
                  strokeWidth="8"
                  strokeDasharray={`${expressionpercentage * 2.827} 282.7`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{expressionpercentage.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {(isExpressive && !isQuick) && (
          <>
            <div className="mb-8">
              <p className="text-lg font-medium mb-4">
                Facial Expressions: {expressionsArray?.join(", ")}
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Correct Facial Expressions</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${correctexpressionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm mt-1">{correctexpressionPercentage.toFixed(1)}%</span>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Incorrect Facial Expressions</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${expressionpercentage}%` }}
                    />
                  </div>
                  <span className="text-sm mt-1">{expressionpercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-6 mb-8">
          <div>
            <h3 className="text-lg font-medium mb-2">Correct Answers</h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${correctPercentage}%` }}
              />
            </div>
            <span className="text-sm mt-1">{correctPercentage.toFixed(1)}%</span>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Incorrect Answers</h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm mt-1">{percentage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">List of Incorrect Answers:</h3>
          <div className="space-y-2">
            {expressiveReport?.map((item, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded">
                {isExpressive ? item?.question : item?.question_text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate(isQuick ? "/AvatarTherapistName" : "/home")}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
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