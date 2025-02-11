import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ReactMic } from 'react-mic';
import { LinearProgress } from '@mui/material';
import { useDataContext } from '../contexts/DataContext';
import { getExpressiveQuestions, evaluateExpressiveQuestion, getToken, authenticateFace, getExpressiveAllExerciseQuestions, getExpressiveExerciseQuestions, detectExpression, matchExpressiveAnswer } from "../utils/functions";
import CustomHeader from '../components/CustomHeader';
import VideoPlayer2 from '../components/VideoPlayer2';
import Loader from '../components/Loader';
import LogoQuestionView from '../components/LogoQuestionView';
import WaveIcon from '../assets/Wave'; // Make sure to convert your WaveSVG to React component
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import { useExpressiveExercise } from '../hooks/useExpressiveExercise';
import { motion } from 'framer-motion';
// Button Components
const RecordButton = ({ onPress, title, disabled }) => (
  <button
    onClick={onPress}
    disabled={disabled}
    className={`w-full rounded-full bg-slate-900 py-3 px-4 h-12 flex items-center justify-center mt-5 mb-[10%] transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 active:bg-slate-700'}`}
  >
    <span className="text-white font-semibold flex items-center gap-2">
      <span className="text-red-500">●</span> {title}
    </span>
  </button>
);

const EndButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-[42%] rounded-full bg-red-500 py-3 px-4 h-12 flex items-center justify-center transition-all hover:bg-red-600 active:bg-red-700"
  >
    <span className="text-white font-semibold">{title}</span>
  </button>
);

const NextButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-[42%] rounded-full bg-green-400 py-3 px-4 h-12 flex items-center justify-center transition-all hover:bg-green-500 active:bg-green-600"
  >
    <span className="text-slate-900 font-semibold">{title}</span>
  </button>
);

const PrevButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-[42%] rounded-full border border-slate-900 py-3 px-4 h-12 flex items-center justify-center transition-all hover:bg-slate-50 active:bg-slate-100"
  >
    <span className="text-slate-900 font-semibold">{title}</span>
  </button>
);

const PlayButton = ({ onPress, disabled }) => (
  <div className="border-2 border-red-500 mb-[10%] p-1 rounded-full mt-5">
    <button
      disabled={disabled}
      onClick={onPress}
      className={`w-full rounded-full bg-red-500 py-3 px-4 h-12 flex items-center justify-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600 active:bg-red-700'}`}
    >
      <WaveIcon />
    </button>
  </div>
);

function ExpressiveAssessment() {
  const { sessionId, isAll, navigate, setExpressiveReport, webcamRef, videoRef, startTime, setStartTime, correctAnswersCount, setCorrectAnswersCount, isLoading, setIsLoading, questionResponse, setQuestionResponse, questionCount, setQuestionCount, recordingStatus, setRecordingStatus, incorrectQuestions, setIncorrectQuestions, correctQuestions, setCorrectQuestions, incorrectExpressions, setIncorrectExpressions, correctExpressions, setCorrectExpressions, expressionsArray, setExpressionsArray, questionExpressions, setQuestionExpressions, questions, setQuestions, disableRecordingButton, setDisableRecordingButton, isWrongAnswer, setInWrongAnswer, wrongWord, setWrongWord, answerCount, setAnswerCount, recordCount, setRecordCount, consecutiveCorrect,setConsecutiveCorrect, isNextAnswer, setIsNextAnswer, isDelay, setIsDelay, expression, setExpression, snapshot, setSnapshot, isVideoEnd, setIsVideoEnd, response, setResponse, expressionResponse, setExpressionResponse, transcript, setTranscript, incorrectWord, setIncorrectWord, updatedQuestionExpression, setUpdatedQuestionExpression } = useExpressiveExercise();
  let question = [];

  // Get user details from localStorage
  const userId = localStorage.getItem("userId");
  const userDetail = JSON.parse(localStorage.getItem("userDetails"));

  useEffect(() => {
    const currentStartTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setStartTime(currentStartTime);

    // Add beforeunload event listener
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const fetchQuestionData = async () => {
    try {
      setIsLoading(true);
      console.log("isALL", isAll)
      const response = isAll ? await getExpressiveAllExerciseQuestions(userId, userDetail?.AvatarID) : await getExpressiveExerciseQuestions(userId, userDetail?.AvatarID)
      console.log(response)
      if (response) {
        console.log("Questions from response", response?.[questionCount - 1]?.question);
        setQuestions(prevQuestions => [...prevQuestions, ...response]);
        // questions.push(response)
        question = response
        console.log(question)

      }
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Call fetchQuestionData
  useEffect(() => {
    const func = async () => {
      await fetchQuestionData();
    }
    func();
  }, []);
  // Add this at the component level
  useEffect(() => {
    const resetAndPlayVideo = () => {
      if (videoRef.current) {
        videoRef.current.stop();
        videoRef.current.seek(0.1);
        setTimeout(() => {
          if (recordCount < 3 && !isDelay && recordingStatus === 'idle') {
            videoRef.current.resume();
            setIsVideoEnd(false);
          }
        }, 200);
      }
    };

    if (recordingStatus === 'idle' && !isDelay) {
      resetAndPlayVideo();
    }
  }, [recordingStatus, isDelay, recordCount]);
  const endAssessment = () => {
    setExpressiveReport(incorrectQuestions);
    navigateTo();
  };

  const navigateTo = () => {
    setExpressiveReport(incorrectQuestions);
    navigate('/result-expressive-language', {
      state: {
        sessionId,
        startTime,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: incorrectQuestions?.length,
        incorrectQuestions,
        isExpressive: true,
        totalQuestions: questions?.length,
        isExercise: true, // Add this
        expressionsArray,
        incorrectExpressions,
        correctExpressions
      }
    });
  };

  const getCurrentAnswer = () => {
    let answers = questions?.[questionCount - 1]?.answers?.split(";")
    return answers?.[answerCount]?.trim()
  }

  const onStartRecord = async () => {
    try {
      setRecordingStatus('recording');

      if (!webcamRef.current) {
        console.error('Webcam reference not available');
        setRecordingStatus('idle');
        return;
      }

      const imageSrc = webcamRef.current.getScreenshot();
      setSnapshot(imageSrc)
      if (!imageSrc) {
        console.error('No image captured');
        
        return;
      }


      // setDisableRecordingButton(false);

    } catch (error) {
      console.error('Error capturing image:', error);
      setRecordingStatus('idle');
    }
  };
  const onCorrectAnswer = (ques) => {
    setQuestionResponse('Correct!');
    setCorrectAnswersCount(prevCount => prevCount + 1);
    if (!correctQuestions.includes(ques + questionCount)) {
        setCorrectQuestions(prevQuestions => [
            ...prevQuestions,
            ques + questionCount,
        ]);
    }
    if (incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
        setIncorrectQuestions(prevQuestions =>
            prevQuestions.filter(q => q?.questiontext !== ques + questionCount),
        );
    }
    setRecordingStatus("stop")
    setWrongWord(null)
    setInWrongAnswer(null)
}
const onWrongAnswer = (ques) => {
    if (!incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
        setIncorrectQuestions(prevQuestions => [
            ...prevQuestions,
            { ...questions?.[questionCount - 1], questiontext: ques + questionCount },
        ]);
    }
    if (correctQuestions.includes(ques + questionCount)) {
        setCorrectAnswersCount(prevCount => prevCount - 1);
        setCorrectQuestions(prevQuestions =>
            prevQuestions.filter(q => q !== ques + questionCount),
        );
    }
    setQuestionResponse('Incorrect!');
    setWrongWord(null)
    setInWrongAnswer(null)
}
const onCorrectExpression = (ques, exp) => {
    if (!correctExpressions.includes(ques + exp + questionCount)) {
        setCorrectExpressions(prevQuestions => [
            ...prevQuestions,
            ques + exp + questionCount,
        ]);
    }
    if (incorrectExpressions.some(q => q === ques + exp + questionCount)) {
        setIncorrectExpressions(prevQuestions =>
            prevQuestions.filter(q => q !== ques + exp + questionCount),
        );
    }
}
const onWrongExpression = (ques, exp) => {
    if (!incorrectExpressions.some(q => q === ques + exp + questionCount)) {
        setIncorrectExpressions(prevQuestions => [
            ...prevQuestions,
            ques + exp + questionCount,
          ]);
        }
    if (correctExpressions.includes(ques + exp + questionCount)) {
      setCorrectExpressions(prevQuestions =>
            prevQuestions.filter(q => q !== (ques + exp + questionCount)),
          );
    }
}

const sendSnapshot = async () => {
  if (!webcamRef.current) return null;

  try {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return null;

    const base64Response = await fetch(imageSrc);
    const blob = await base64Response.blob();

    const formData = new FormData();
    formData.append('image', blob, 'snapshot.jpg');

    const response = await detectExpression(formData)
    if (response?.expression) {
      setExpression(response?.expression)
      return response?.expression
  }
  console.log(response.expression)
  return null

   
  } catch (error) {
    console.error('Error capturing/sending snapshot:', error);
    return null;
  }
};



const getSingleExpression = (arr) => {
  const countMap = arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
  }, {});

  // Step 2: Find the element with the highest count
  const maxElement = Object.keys(countMap).reduce((a, b) =>
      countMap[a] > countMap[b] ? a : b
  );

  // Step 3: Filter out the most frequent element
  const filteredArray = arr.find(item => item === maxElement);
  return filteredArray
}

const updateValuesToInitial = (updatedQuestionExpression) => {
  setExpressionsArray(prevArray => [...prevArray, getSingleExpression(updatedQuestionExpression) || ""])
  // setConsecutiveCorrect(0)
  // setAnswerCount(0)
  // setRecordCount(0)
}




  const onStopRecord = async () => {
    setRecordingStatus('loading');
    // Stop recording will trigger ReactMic's onStop callback
  };

  // const evaluateQuestion = async (transcription) => {
  //   const file = await processImage()
  //   console.log(file)

  //   const formData = new FormData();
  //   formData.append('image', file, 'webcam-snapshot.jpg');
  //   formData.append('transcription', transcription);
  //   formData.append('answers', question?.[questionCount - 1]?.answers);
  //   formData.append('expected_expression', question?.[questionCount - 1]?.expression);

  //   try {
  //     const response = await evaluateExpressiveQuestion(formData);
  //     console.log(response)

  //     setRecordingStatus("stop");

  //     if (response?.expression) {
  //       setExpression(response.expression);
  //       return response.expression;
  //     }
  //   } catch (error) {
  //     console.error('Error evaluating question:', error);
  //   }

  //   return null;
  // };

  const handleAudioStop = async (recordedBlob) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('audio', recordedBlob.blob, 'sound.wav');
    const answer = getCurrentAnswer()?.replace(/\.$/, "")?.toLowerCase();

        formData.append("answer", answer)
    
        try {
          const res = await matchExpressiveAnswer(formData)
          setResponse(res)
          
          const expResponse = await sendSnapshot();
          setExpressionResponse(expResponse)

          setTranscript(response?.transcription?.trim()?.toLowerCase())
          setIncorrectWord(response?.first_incorrect_word?.trim()?.toLowerCase())
          setUpdatedQuestionExpression([...questionExpressions, expressionResponse])
          setRecordCount(prev => prev + 1)
          console.log(response, updatedQuestionExpression)
          // if (expressionResponse?.toLowerCase() === questions?.[questionCount - 1]?.expression?.toLowerCase()) {
            
          // } else {
            
          // }
          console.log("Hello recording stop")

          
      
  // } else {
  // setQuestionExpressions(prevArray => [...prevArray, expressionResponse || ""])
  // if (incorrectWord !== transcript && transcript !== null && incorrectWord?.toLowerCase() !== 'none') {
  //     setIsDelay(true)
  //     setTimeout(() => {
  //         setIsDelay(false)
  //         setExpression(null)
  //         setRecordingStatus("idle")
  //         setInWrongAnswer(true)
  //         setWrongWord(response?.first_incorrect_word)
  //         setRecordCount(0)
  //         setIsVideoEnd(false)
  //     }, 2000);
  // }
  //     } else {
  //         updateValuesToInitial(updatedQuestionExpression)
  //         onCorrectExpression(questions?.[questionCount - 1]?.question, expressionResponse)
  //         onCorrectAnswer(questions?.[questionCount - 1]?.question)
  //     }
  // }
} catch (error) {
  console.error('Network request failed When sending audio:', error);
}
};


  const percentageCompleted = ((questionCount) / questions?.length) * 100;

  useEffect(() => {
  console.log("record Count:", recordCount)
  if (recordCount === 2) {
    console.log("mango")
    if (questions?.[questionCount - 1]?.answers?.split(";")?.[answerCount + 1]) {
        setAnswerCount(answerCount + 1)
        setQuestionExpressions(prevArray => [...prevArray, expressionResponse || ""])
        setIsDelay(true)
        setIsNextAnswer(true)
        setTimeout(() => {
          setIsDelay(false);
          setExpression(null);
          videoRef.current.stop();
          videoRef.current.seek(0.1);
          videoRef.current.resume();
          setRecordingStatus("idle");
          setIsNextAnswer(false);
          setRecordCount(0);
          setIsVideoEnd(false);
        }, 2000);
    } else {
        setRecordingStatus("stop")
        updateValuesToInitial(updatedQuestionExpression)
        if (consecutiveCorrect > (questions?.[questionCount - 1]?.answers?.split(";")?.length / 2)) {
            onCorrectExpression(questions?.[questionCount - 1]?.question, expressionResponse)
            onCorrectAnswer(questions?.[questionCount - 1]?.question)
        } else {
            onWrongAnswer(questions?.[questionCount - 1]?.question)
            onWrongExpression(questions?.[questionCount - 1]?.question, expressionResponse)
        }
    }
}else {
  setQuestionExpressions(prevArray => [...prevArray, expressionResponse || ""])
  if (incorrectWord === transcript || transcript === null || incorrectWord?.toLowerCase() === 'none') {
      setConsecutiveCorrect(consecutiveCorrect + 1)
      setIsDelay(true)
      setTimeout(() => {
          setIsDelay(false)
          setExpression(null)
          setRecordingStatus("idle")
          setIsVideoEnd(false)
      }, 2000);
  } else {
      setInWrongAnswer(true)
      setWrongWord(response?.first_incorrect_word)
      setIsDelay(true)
      setTimeout(() => {
          setIsDelay(false)
          setExpression(null)
          setRecordingStatus("idle")
          setIsVideoEnd(false)
      }, 2000);
  }
}

  
}, [recordCount])

  

  return (
    <div className="bg-gray-100 mb-0 overflow-hidden min-h-screen">
      <CustomHeader
        title="Expressive Language Disorder Excercise"
        goBack={() => navigate(-1)}
      />

      <div className="max-w-4xl mx-auto">
        <div className="mb-0 overflow-hidden">
          <main className="flex flex-col h-full px-6">
            {/* Instructions */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-600 text-center mb-2 mt-4"
            >
              Place your face in the middle of the camera frame while speaking
            </motion.p>

            {/* Question Counter */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-left">
                Question{' '}
                <span className="font-bold">
                  {questionCount > questions?.length ? questions?.length : questionCount}{' '}
                </span>
                out of
                <span className="font-bold"> {questions?.length}</span>
              </p>
              
            </div>

            {/* Progress Bar */}
            {percentageCompleted.toString() !== "Infinity" && (
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentageCompleted}%` }}
                    className="h-full bg-orange-500"
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {percentageCompleted > 0 ? percentageCompleted.toFixed(1) : 0}%
                </span>
              </div>
            )}

            {/* Delay Message */}
            {isDelay && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-blue-600 font-medium mb-4"
              >
                {isNextAnswer ? "Please be ready for next answer part" : "Please be ready for next attempt"}
              </motion.p>
            )}

            {/* Media and Question Section */}
            <div className="flex flex-col items-center mb-6">
              {/* Question Image and Video */}
              {questions?.[questionCount - 1] && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex justify-center mb-2"
                >
                  <div className="flex gap-4">
                    <div className="px-6 py-3 border border-sky-400 rounded-xl">
                      <img
                        className="w-48 h-48 rounded-lg shadow-lg object-cover"
                        src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_label}`}
                        alt="Question"
                      />
                    </div>
                    <div className="w-48 h-48">
                      <VideoPlayer2
                        source={`${IMAGE_BASE_URL}/${questions?.[questionCount - 1]?.avatar_exercise?.split(",")?.[answerCount]?.trim()}`}
                        onEnd={() => {
                          setIsVideoEnd(true);
                          if (!isDelay && recordCount < 3) {
                            setDisableRecordingButton(false);
                          }
                        }}
                        onStart={() => {
                          setIsVideoEnd(false);
                          setDisableRecordingButton(true);
                        }}
                        ref={videoRef}
                        videoHeight={192}
                        className="rounded-xl shadow-lg object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div className="flex items-center justify-center gap-16 w-full text-sm mb-2 text-gray-800">
                <div className='w-48' ><p className='text-start text-sm'  >Attempt: {Math.min(recordCount + 1, 3)}</p></div>
                <div className='w-48' ><p className='text-end' >Answer Count: {answerCount + 1}</p></div>
              </div>

              {/* Question Text Below Image */}
              <div className="w-[480px]">
                <LogoQuestionView
                  first_text={questions?.[questionCount - 1]?.question}
                  second_text={getCurrentAnswer()}
                />
              </div>
            </div>

            {/* Camera and Controls Section */}
            <div className="flex flex-row justify-center items-start gap-12 mt-4">
              {/* Camera View */}
              <div className="">
                <div className="rounded-2xl overflow-hidden flex justify-center">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "user",
                      width: 192,
                      height: 192
                    }}
                    className="rounded-2xl shadow-lg"
                  />
                </div>
              </div>

              {/* Recording, Responses and Navigation Controls */}
              <div className="w-48 flex flex-col justify-between h-full">
                {/* Response Area */}
                <div className="flex flex-col items-center mb-4">
                  {recordingStatus === 'stop' && questionResponse && (
                    <LogoQuestionView
                      second_text={null}
                      first_text={questionResponse}
                      questionResponse={questionResponse}
                    />
                  )}
                  {recordingStatus === 'stop' && expression && (
                    <p className="text-center whitespace-nowrap">
                      Facial Expression: {expression}
                    </p>
                  )}
                </div>

                <ReactMic
                  record={recordingStatus === 'recording'}
                  className="sr-only"
                  onStop={handleAudioStop}
                  strokeColor="#000000"
                  backgroundColor="#FF4081"
                />

                {/* Controls */}
                <div className="flex flex-col h-full justify-end">
                  {/* Buttons */}
                  <div className="flex justify-center items-center">
                    {/* Record Button */}
                    {recordingStatus === 'idle' && isVideoEnd && recordCount < 3 && !isDelay && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartRecord}
                        disabled={disableRecordingButton}
                        className="w-full rounded-full bg-slate-900 py-2 px-3 h-10 flex items-center justify-center mt-24 mb-4 transition-all hover:bg-slate-800 active:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-white font-semibold flex items-center gap-2 text-sm">
                          <span className="text-red-500">●</span> Record
                        </span>
                      </motion.button>
                    )}

                    {/* Recording Wave Button */}
                    {recordingStatus === 'recording' && (
                      <div className="border-2 border-red-500 mb-4 p-1 rounded-full mt-24 w-full">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onStopRecord}
                          className="w-full rounded-full bg-red-500 py-2 px-3 h-10 flex items-center justify-center transition-all"
                        >
                          <WaveIcon />
                        </motion.button>
                      </div>
                    )}

                  {/* Navigation Buttons */}
                  {((recordingStatus === 'stop' && recordCount >= 3) || recordCount >= 3) && (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        {questionCount !== 1 && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setRecordingStatus('idle');
                              setExpression(null);
                              setQuestionResponse('');
                              setRecordCount(0);
                              if (questionCount >= 1) {
                                setIsVideoEnd(false);
                                if (videoRef.current) {
                                  videoRef.current.stop();
                                  videoRef.current.seek(0.1);
                                  videoRef.current.resume();
                                }
                                setQuestionCount(prev => prev - 1);
                              }
                            }}
                            className="flex-1 border border-gray-300 hover:bg-gray-50 rounded-full py-2 px-4 font-semibold transition-colors"
                          >
                            Previous
                          </motion.button>
                        )}

                        {questionCount < questions?.length && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setRecordingStatus('idle');
                              setExpression(null);
                              setQuestionResponse('');
                              setAnswerCount(0);
                              setRecordCount(0);
                              setConsecutiveCorrect(0);
                              setIsDelay(false);
                              setIsNextAnswer(false);
                              if (questionCount < questions?.length) {
                                setIsVideoEnd(false);
                                if (videoRef.current) {
                                  videoRef.current.stop();
                                  videoRef.current.seek(0.1);
                                  videoRef.current.resume();
                                }
                                setQuestionCount(prev => prev + 1);
                              } else {
                                navigateTo();
                              }
                            }}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full py-2 px-4 font-semibold transition-colors"
                          >
                            Next
                          </motion.button>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={endAssessment}
                        className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-2 px-4 font-semibold transition-colors"
                      >
                        {questionCount < questions?.length ? "End Now" : "Finish"}
                      </motion.button>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>

            <Loader loading={isLoading || recordingStatus === 'loading'} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExpressiveAssessment;