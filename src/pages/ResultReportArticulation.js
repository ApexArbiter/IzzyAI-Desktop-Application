import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { endSession, getToken } from '../utils/functions';
import BaseURL from '../components/ApiCreds';
import moment from 'moment';
import { useDataContext } from '../contexts/DataContext';
import CustomHeader from '../components/CustomHeader';


const generateHighlightedText = (text, indexes) => {
  if (!text) return null;

  return text.split('').map((letter, index) => {
    const isHighlighted = indexes?.includes(index);
    const isFirstLetter = index === 0;

    return (
      <span
        key={index}
        className={`
          inline-block
          text-lg
          ${isHighlighted ? 'text-red-500' : 'text-black'}
          ${isFirstLetter ? 'uppercase' : 'lowercase'}
          ${index > 0 ? 'ml-px' : ''}
        `}
      >
        {letter}
      </span>
    );
  });
};


// Progress Components
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

const ArticulationResult = () => {
  const navigate = useNavigate();
  const { updateUserDetail, articulationReport } = useDataContext();
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState('');
  const location = useLocation();
  const [soundNames, setSoundNames] = useState([]);

  const { startTime, SessiontypId, sessionId, incorrectQuestions, totalQuestions: total, expressionsArray, incorrectExpressions, correctExpressions, correctAnswers, isQuick } = location.state || {};
  console.log(location.state)



  // Calculate scores
  console.log("SessionID", sessionId)
  const totalQuestions = correctAnswers + incorrectQuestions?.length;
  const percentage = totalQuestions > 0 ? (incorrectQuestions.length / totalQuestions) * 100 : 0;
  const correctPercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const expressionScore = expressionsArray?.length > 0
    ? (correctExpressions?.length / expressionsArray?.length) * 100
    : 0;
  const expressionpercentage = (incorrectExpressions?.length / totalQuestions) * 100;
  const correctexpressionPercentage = (correctExpressions?.length / totalQuestions) * 100;

  const getIncorrectQuestions = () => {
    console.log("getting")
    if (SessiontypId == 1) return incorrectQuestions?.filter(item => item && (item.WordText || item?.wordtext))
    return incorrectQuestions
  }

  const addAssessmentResult = async () => {
    const token = await getToken()
    try {
      const obj = {
        expressions: isQuick ? null : expressionsArray,
        correct: isQuick ? null : correctexpressionPercentage,
        incorrect: isQuick ? null : expressionpercentage,
        questions_array: getIncorrectQuestions()
      }
      setLoading(true)
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('Score', percentage);
      formData.append('SessionID', sessionId);
      formData.append('DisorderID', 1);
      if (isQuick) {
        formData.append('quick_assessment', "quick_assessment");
      }
      formData.append('emotion', JSON.stringify(obj));

      const validItems = articulationReport?.filter(item => item !== undefined);


      const extractedWordIDs = validItems?.map(item => item?.WordID || item?.id);
      const extractedSoundIDs = validItems?.map(item => item?.SoundID);


      if (extractedWordIDs && extractedSoundIDs) {

        console.log("Extracted", extractedWordIDs, extractedSoundIDs)
        formData.append('WordIDList', JSON.stringify(extractedWordIDs));


        formData.append('SoundIDList', JSON.stringify(extractedSoundIDs));
      } else {
        return;
      }

      formData.append('AssessmentDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));

      console.log(formData);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(`${BaseURL}/add_assessment_result`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': "Bearer " + token }
      });

      if (response.ok) {
        // If the response is successful, parse the response body as JSON
        const responseData = await response.json();
      } else {
        // Handle error response
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
      setLoading(false)
      // Handle fetch error
    } finally {
      setLoading(false)
    }
  };
  const fetchReport = async () => {
    const token = await getToken()
    const userId = localStorage.getItem("userId");
    try {
      const response = await fetch(
        `${BaseURL}/get_Exercise_word_count/${userId}/1/`,
        {
          method: 'GET',
          headers: { 'Authorization': "Bearer " + token }//}
        },
      );
      if (response.ok) {
        const reportData = await response.json();
        let sum = 0;
        const names = [];
        for (const key in reportData) {
          if (reportData.hasOwnProperty(key)) {
            sum += reportData[key].Count / 4;
            names.push(reportData[key].SoundName);
          }
        }
        updateUserDetail({ totalQuestion: sum });
        setSoundNames(names);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const submitUserExercise = async () => {
    const token = await getToken()
    const obj = {
      expressions: isQuick ? null : expressionsArray,
      correct: isQuick ? null : correctexpressionPercentage,
      incorrect: isQuick ? null : expressionpercentage,
      questions_array: getIncorrectQuestions()
    }
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('DisorderID', 1);
    formData.append('SessionID', sessionId);
    formData.append('ExerciseDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss")); // Assuming exerciseDate is in 'YYYY-MM-DD' format
    formData.append('SoundIDList', JSON.stringify(soundNames)); // Use soundNames array
    formData.append('CompletionStatus', 'complete');
    formData.append('CompletedQuestions', totalQuestions);
    formData.append('WordIDList', JSON.stringify([])); // You need to provide word IDs if necessary
    formData.append('Score', percentage);
    formData.append('TotalQuestions', totalQuestions);
    formData.append('emotion', JSON.stringify(obj));

    try {
      setLoading(true)
      console.log(formData);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      const response = await fetch(`${BaseURL}/artic_user_exercise`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': "Bearer " + token }
      });

      console.log(response)
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData)
      } else {
        const errorData = await response.json();
        console.log("hello")
        throw new Error(errorData.error || response.statusText);
      }
    } catch (error) {
      console.log("hello")
      console.error('ErrorExercise:', error);
    } finally {
      console.log("hello")
      setLoading(false)
    }
  };



  useEffect(() => {
    const currentEndTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setEndTime(currentEndTime);
  }, []);

  // useEffect(() => {
  //   const init = async () => {
  //     await endSession(sessionId, startTime, 'Completed', 1); 
  //     addAssessmentResult();
  //   };
  //   init();
  // }, []);

  // Fix for ArticulationResult component
  useEffect(() => {
    const handleEffects = async () => {
      try {
        if (SessiontypId === 1) {
          await addAssessmentResult();
        }
        if (SessiontypId === 2) {
          await submitUserExercise();
        }
        await updateSession();
      } catch (error) {
        console.error('Error in effect:', error);
      }
    };

    handleEffects();

    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, []);
  const updateSession = async () => {
    const response = await endSession(sessionId, startTime, isQuick ? 'quick_assessment_status' : 'Completed', 1)
    console.log(response)
  };



  const onPressBack = () => {
    if (isQuick) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };


  return (
    <div className="h-screen overflow-hidden bg-[#f2f1f1]">
      <div className="h-[calc(100vh-64px)]  p-4">
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl  flex flex-col">
          <h1 className="text-2xl text-center font-semibold mb-4">
            {isQuick
              ? "Quick Articulation Disorder Assessment Result Report"
              : SessiontypId === 2
                ? "Articulation Disorder Exercise Result Report"
                : "Articulation Disorder Assessment Result Report"
            }
          </h1>



          <div className="flex justify-center gap-8 mb-3">
            <CircularProgress
              percentage={percentage}
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
              <p className="text-  mb-2">
                Facial Expressions: {expressionsArray.join(", ")}
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-lg ">Correct Facial Expressions</p>
                  <LinearProgressBar
                    value={(correctExpressions?.length / totalQuestions) * 100}
                    color="#71D860"
                  />
                </div>

                <div>
                  <p className="text-lg ">Incorrect Facial Expressions</p>
                  <LinearProgressBar
                    value={(incorrectExpressions?.length / totalQuestions) * 100}
                    color="#FC4343"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-2">
            <div>
              <p className="text-lg ">Correct Answers</p>
              <LinearProgressBar value={correctPercentage} color="#71D860" />
            </div>

            <div>
              <p className="text-lg ">Incorrect Answers</p>
              <LinearProgressBar value={percentage} color="#FC4343" />
            </div>
          </div>

          <div className="flex flex-col">
  <h3 className="text-lg mt-2">List of Incorrect Pronunciations:</h3>
  <div className="max-h-[100px] overflow-y-auto rounded-lg">
    <div className="">
      {incorrectQuestions.map((item, index) => {
        // Handle both quick and regular assessment cases
        const word = item?.WordText || item?.wordtext;
        const highlightStr = item?.HighlightWord || item?.highlightword;
        
        // Parse highlight indexes, handling both string and array formats
        let highlightIndexes = [];
        try {
          if (highlightStr) {
            highlightIndexes = typeof highlightStr === 'string' 
              ? JSON.parse(highlightStr)
              : highlightStr;
          }
        } catch (error) {
          console.error('Error parsing highlight indexes:', error);
        }

        return word ? (
          <div
            key={`${word}-${index}`}
            className="flex items-center"
          >
            <span className="text-red-700">
              {generateHighlightedText(word, highlightIndexes)}
            </span>
          </div>
        ) : null;
      })}
    </div>
  </div>
</div>
          <div className="flex justify-center">
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

export default ArticulationResult;