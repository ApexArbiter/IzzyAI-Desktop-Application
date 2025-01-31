import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { endSession, getToken } from '../utils/functions';
import BaseURL from '../components/ApiCreds';
import moment from 'moment';
import { useDataContext } from '../contexts/DataContext';
import CustomHeader from '../components/CustomHeader';

// Custom Card Component
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

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Progress Components
const CircularProgress = ({ percentage, size = "lg" }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const sizes = {
    sm: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64"
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

const LinearProgressBar = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${value >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const ArticulationResult = () => {
  const navigate = useNavigate();
  const { updateUserDetail, articulationReport } = useDataContext();
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState('');
  const location = useLocation();
  const [soundNames, setSoundNames] = useState([]);

  const { startTime, SessiontypId, sessionId, totalQuestions: total, expressionsArray, incorrectExpressions, correctExpressions, correctAnswers, isQuick } = location.state || {};
  console.log(location.state)

  // Get data from localStorage
  // const sessionId = localStorage.getItem("sessionId");
  // const startTime = localStorage.getItem("startTime");
  // const correctAnswers = parseInt(localStorage.getItem("correctAnswers") || "0");
  const incorrectQuestions = JSON.parse(localStorage.getItem("incorrectQuestions") || "[]");

  console.log("Incorrect Questions", incorrectQuestions)
  // const expressionsArray = JSON.parse(localStorage.getItem("expressionsArray") || "[]");
  // const correctExpressions = JSON.parse(localStorage.getItem("correctExpressions") || "[]");
  // const incorrectExpressions = JSON.parse(localStorage.getItem("incorrectExpressions") || "[]");

  // Calculate scores
  console.log("SessionID", sessionId)
  const totalQuestions = correctAnswers + incorrectQuestions?.length;
  const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
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

  // const addAssessmentResult = async () => {
  //   const token = await getToken();

  //   try {
  //     // Validate required data before sending
  //     if (!localStorage.getItem("userId") || !sessionId) {
  //       console.error('Missing required user or session data');
  //       return;
  //     }

  //     const obj = {
  //       expressions: isQuick ? null : expressionsArray,
  //       correct: isQuick ? null : correctexpressionPercentage,
  //       incorrect: isQuick ? null : expressionpercentage,
  //       questions_array: getIncorrectQuestions()
  //     };

  //     const formData = new FormData();
  //     formData.append('UserID', localStorage.getItem("userId"));
  //     formData.append('Score', percentage);
  //     formData.append('SessionID', sessionId);
  //     formData.append('DisorderID', 1);

  //     if (isQuick) {
  //       formData.append('quick_assessment', "quick_assessment");
  //     }

  //     formData.append('emotion', JSON.stringify(obj));

  //     const validItems = articulationReport?.filter(item => item !== undefined);

  //     // Safely extract WordIDs and SoundIDs
  //     const extractedWordIDs = validItems?.map(item => item?.WordID || item?.id)?.filter(Boolean);
  //     const extractedSoundIDs = validItems?.map(item => item?.SoundID)?.filter(Boolean);

  //     if (extractedWordIDs && extractedWordIDs.length > 0) {
  //       formData.append('WordIDList', JSON.stringify(extractedWordIDs));
  //     }

  //     if (extractedSoundIDs && extractedSoundIDs.length > 0) {
  //       formData.append('SoundIDList', JSON.stringify(extractedSoundIDs));
  //     }

  //     formData.append('AssessmentDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));

  //     // Log the payload for debugging
  //     for (let [key, value] of formData.entries()) {
  //       console.log(`${key}:`, value);
  //     }
  //     console.log('Sending data:', Object.fromEntries(formData));
  //     setLoading(true);
  //     const response = await fetch(`${BaseURL}/add_assessment_result`, {
  //       method: 'POST',
  //       body: formData,
  //       headers: { 'Authorization': "Bearer " + token }
  //     });

  //     // More comprehensive error handling
  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('Server Error:', response.status, errorText);
  //       throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  //     }

  //     const responseData = await response.json();
  //     console.log('Assessment result added successfully', responseData);

  //   } catch (error) {
  //     console.error('Error in addAssessmentResult:', error);
  //     // Optionally show user-friendly error message
  //     // You might want to use a toast or alert component here
  //   } finally {
  //     setLoading(false);
  //   }
  // };



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
        <CustomHeader title={isQuick ? "Quick Articulation Disorder Assessment Result Report" :
          SessiontypId === 2 ? "Articulation Disorder Exercise Result Report" :
            "Articulation Disorder Assessment Result Report"} goBack={() => { navigate(-1) }} />

        <div className={`${expressionsArray ? 'grid md:grid-cols-2 gap-6' : ''} flex justify-center w-50`}>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CircularProgress percentage={percentage} />
            </CardContent>
          </Card>

          {/* Expression Score */}
          {expressionsArray?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expression Analysis</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CircularProgress percentage={expressionScore} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Results */}
        <Card className="mt-6">
          {/* <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-6">
            {/* Correct Answers */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Correct Pronunciations</span>
                <span className="font-semibold">{correctAnswers}/{totalQuestions}</span>
              </div>
              <LinearProgressBar value={(correctAnswers / totalQuestions) * 100} />
            </div>

            {/* Expressions */}
            {expressionsArray?.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Correct Expressions</span>
                  <span className="font-semibold">{correctExpressions?.length}/{expressionsArray?.length}</span>
                </div>
                <LinearProgressBar value={expressionScore} />
              </div>
            )}

            {/* Incorrect Words List */}
            {incorrectQuestions?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">List of incorrect Pronounciations:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {incorrectQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="p-2 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {!isQuick && <span>{question.WordText}</span>}
                      {isQuick && <span>{question.wordtext}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Words List */}
            {/* {correctExpressions?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Well Pronounced Words:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {correctExpressions.map((expression, index) => (
                    <div
                      key={index}
                      className="p-2 bg-green-50 text-green-700 rounded-lg flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{expression.word}</span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={() => { onPressBack() }}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ArticulationResult;