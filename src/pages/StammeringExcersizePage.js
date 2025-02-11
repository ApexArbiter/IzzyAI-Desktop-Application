import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useLocation, useNavigate } from 'react-router-dom';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import VideoPlayer from '../components/VideoPlayer';
import { getToken, detectExpression, getStammeringWords, capitalize } from '../utils/functions';
import CustomHeader from '../components/CustomHeader';
import Loader from '../components/Loader';
import WaveIcon from '../assets/Wave';
import LogoQuestionView from '../components/LogoQuestionView';
import { motion } from 'framer-motion';
import { useDataContext } from '../contexts/DataContext';

const StammeringExercisePage = () => {
  const { setExercisesReport, userId, userDetail } = useDataContext();
  const location = useLocation();
  const { sessionId, SessiontypId, isAll } = location?.state || {};
  console.log(location.state)
  const webcamRef = useRef(null);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [exerciseData, setExerciseData] = useState(null);
  const [exerciseCount, setExerciseCount] = useState(1);
  const [questionResponse, setQuestionResponse] = useState('');
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [mispronouncedWord, setMispronouncedWord] = useState('');

  const [expressionsArray, setExpressionsArray] = useState([]);
  const [isVideoEnd, setIsVideoEnd] = useState(false);

  const [questionWordsArray, setQuestionWordsArray] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [tries, setTries] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [avatarPath, setAvatarPath] = useState('');
  const [expression, setExpression] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isDelay, setIsDelay] = useState(false);
  const [timer, setTimer] = useState(5);
  const [counter, setCounter] = useState(100);
  const audioChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const [rightAttempts, setRightAttempts] = useState(0);
  const [rightWords, setRightWords] = useState(0);
  const [questionExpressions, setQuestionExpressions] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [correctExpressions, setCorrectExpressions] = useState([]);
  const [incorrectExpressions, setIncorrectExpressions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const sentenceID = [1, 3, 4, 9, 11, 12];

  // Fetch exercise data
  const fetchExerciseData = useCallback(async (id) => {
    const token = await getToken();
    setLoading(true)
    try {
      // Fetch stammering words
      const questionWords = await getStammeringWords(id);
      setQuestionWordsArray(questionWords?.data || []);

      // Fetch sentence
      const response = await fetch(
        `${BaseURL}/get_exercise_sentence/${sentenceID[id]}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();

      if (data) {
        setExerciseData(data);
       await fetchAvatarPath(data.Sentence);
      }
      console.log(data)
    } catch (error) {
      console.error('Failed to fetch exercise data:', error);
    } finally {
      setLoading(false)
    }
  }, []);
  const navigateBack = () => {
    navigate(isAll ? -2 : -1);
  };


  useEffect(() => {
    const currentStartTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    setStartTime(currentStartTime);
  }, []);

  // Fetch avatar path
  const fetchAvatarPath = async (wordtext) => {
    const token = await getToken();
    try {
      setLoading(true)
      const response = await fetch(
        `${BaseURL}/get_avatar_path/${wordtext?.toLowerCase()}/${userDetail.AvatarID}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setAvatarPath(data.AvatarPath);
      }
    } catch (error) {
      console.error('Failed to fetch avatar path:', error);
    } finally {
      setLoading(false)
    }
  };
  const onCorrectExpression = (ques, exp) => {
    // Check if not already in correctExpressions
    if (!correctExpressions.includes(ques + exp)) {
      setCorrectExpressions(prevExpressions => [...prevExpressions, ques + exp]);
    }

    // Remove from incorrectExpressions if present
    if (incorrectExpressions.includes(ques + exp)) {
      setIncorrectExpressions(prevExpressions =>
        prevExpressions.filter(item => item !== ques + exp)
      );
    }
  };

  const onWrongExpression = (ques, exp) => {
    // Check if not already in incorrectExpressions
    if (!incorrectExpressions.includes(ques + exp)) {
      setIncorrectExpressions(prevExpressions => [...prevExpressions, ques + exp]);
    }

    // Remove from correctExpressions if present
    if (correctExpressions.includes(ques + exp)) {
      setCorrectExpressions(prevExpressions =>
        prevExpressions.filter(item => item !== ques + exp)
      );
    }
  };
  // Start recording
  const onStartRecord = async () => {
    try {
      setRecordingStatus('recording');
      setTimer(5);  // Reset timer
      setCounter(100);  // Reset counter
      audioChunksRef.current = [];
      setIsStopButtonDisabled(true);
      setTimeout(() => {
        setIsStopButtonDisabled(false);
      }, 5000);

      // Create and resume AudioContext after user interaction
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(100);
      sendSnapshot();

    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingStatus('idle');
    }
  };

  const sendSnapshot = async () => {
    try {
      // Take snapshot
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const response = await fetch(imageSrc);
          const blob = await response.blob();
          const formData = new FormData();
          formData.append('image', blob, 'snapshot.jpg');

          const expressionResponse = await detectExpression(formData);
          // const faceAuthResponse = await authenticateFace('userId', formData);

          if (expressionResponse?.expression) {
            setExpression(expressionResponse.expression);
          }
        }
      }
    } catch (error) {
      console.error('Snapshot error:', error);
    }
  }

  const getSingleExpression = (arr) => {
    const countMap = arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    const maxElement = Object.keys(countMap).reduce((a, b) =>
      countMap[a] > countMap[b] ? a : b
    );

    return arr.find(item => item === maxElement);
  };

  // Stop recording
  const onStopRecord = async () => {
    try {
      if (!mediaRecorderRef.current) return;
    

      return new Promise((resolve) => {
        mediaRecorderRef.current.onstop = async () => {
          try {
            setLoading(true)
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            console.log('Audio blob created:', audioBlob.size, 'bytes');

            const token = await getToken();
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');
            formData.append('sentence', mispronouncedWord || exerciseData.Sentence);

            const options = {
              method: 'POST',
              body: formData,
              headers: {
                Accept: 'application/json',
                'Authorization': `Bearer ${token}`
              },
            };

            const response = await fetch(`${BaseURL}/process_sentence`, options);
            const data = await response.json();
            console.log('Recording response:', data.mispronounced_words);
            setMispronouncedWord(data.mispronounced_words);
            const isMatched = data.message?.toLowerCase() === 'matched';

            console.log("Message:", data.message)
            console.log("isMatched", isMatched)
            console.log("Hello 1")
            setLoading(false)
            handleRecordingResponse(isMatched);
            resolve();
          } catch (error) {
            console.error('Error processing recording:', error);
            setRecordingStatus('idle');
            resolve();
          }
        };

        mediaRecorderRef.current.stop();
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordingStatus('idle');
    } finally {
      setLoading(false)
    }
  };

  // Handle recording response logic
  const handleRecordingResponse = (isMatched) => {
    const isCorrectExpression = expression?.toLowerCase() === 'happy';
    setIsDelay(true); // Set delay flag true for all responses
    console.log("Hello 2")

    // If matched and not in wrong state
    if (isMatched && !isWrong) {
      setExpressionsArray(prev => [...prev, expression]);
      setQuestionResponse('Correct!');
      setCorrectAnswersCount(prev => prev + 1);
      setMispronouncedWord('');
      setIsVideoEnd(true);
      setRecordingStatus('stop');
      // setAvatarPath(null);
      setCorrectAnswersCount(prev => prev + 1);

      if (isCorrectExpression) {
        onCorrectExpression(exerciseData?.Sentence || 'question', expression);
      } else {
        onWrongExpression(exerciseData?.Sentence || 'question', expression);
      }

      // Add delay before moving to next question
      setTimeout(() => {
        setIsDelay(false);
        if (exerciseCount < 5) {
          setExerciseCount(prev => prev + 1);
          setRecordingStatus('idle');
          setQuestionResponse('');
          setIsVideoEnd(false);
          setTries(0);
        }
      }, 5000);
    } else {
      setTimeout(() => {
        setAvatarPath(null);
        setIsWrong(true);
      }, 5000);

      if (tries === 1) {
        if (wordCount + 1 === questionWordsArray?.length) {
          const finalExpression = getSingleExpression([...questionExpressions, expression]);
          setExpressionsArray(prev => [...prev, finalExpression]);

          if (finalExpression?.toLowerCase() === 'happy') {
            onCorrectExpression(exerciseData?.Sentence || 'question', finalExpression);
          } else {
            onWrongExpression(exerciseData?.Sentence || 'question', finalExpression);
          }

          setTimeout(() => {
            setIsDelay(false);
            if (isMatched) {
              setRightWords(prev => prev + 1);
              if (rightWords + 1 >= 2) setRightAttempts(prev => prev + 1);

              if (rightAttempts + 1 >= questionWordsArray?.length / 2) {
                setQuestionResponse('Correct!');
                setCorrectAnswersCount(prev => prev + 1);
              } else {
                setQuestionResponse('Incorrect!');
                setIncorrectQuestions(prev => [...prev, exerciseData]);
              }
            } else {
              if (rightAttempts >= questionWordsArray?.length / 2) {
                setQuestionResponse('Correct!');
                setCorrectAnswersCount(prev => prev + 1);
              } else {
                setQuestionResponse('Incorrect!');
                setIncorrectQuestions(prev => [...prev, exerciseData]);
              }
            }
            setRecordingStatus('stop');
          }, 5000);
        } else {
          setTimeout(() => {
            setIsDelay(false);
            handleNextWord(isMatched);
            setQuestionExpressions(prev => [...prev, expression]);
          }, 5000);
        }
      } else {
        setTimeout(() => {
          setIsDelay(false);
          handleNextTry(isMatched);
          setQuestionExpressions(prev => [...prev, expression]);
        }, 5000);
      }
    }
  };

  const handleNextWord = (isMatched) => {
    setQuestionExpressions(prev => [...prev, expression]);
    fetchAvatarPath(questionWordsArray?.[wordCount + 1]);

    if (isMatched) {
      setQuestionResponse('Incorrect!');
      setRightWords(prev => prev + 1);
      if (rightWords + 1 >= 2) setRightAttempts(prev => prev + 1);
    } else {
      setQuestionResponse('Incorrect!');
      if (rightWords >= 2) setRightAttempts(prev => prev + 1);
    }

    setIsDelay(true);
    setTimeout(() => {
      setIsDelay(false);
      setMispronouncedWord("");
      setQuestionResponse('');
      setExpression(null);
      setRecordingStatus('idle');
      setIsVideoEnd(false);
      setWordCount(prev => prev + 1);
      setTries(1);
    }, 2000);
  };

  const handleNextTry = (isMatched) => {
    setQuestionExpressions(prev => [...prev, expression]);
    setTimeout(() => {
      fetchAvatarPath(questionWordsArray?.[wordCount]);
    }, 5000);

    if (isMatched) {
      setQuestionResponse('Incorrect!');
      setRightWords(prev => prev + 1);
    } else {
      setQuestionResponse('Incorrect!');
    }

    setIsDelay(true);
    setTimeout(() => {
      setIsDelay(false);
      setMispronouncedWord("");
      setQuestionResponse('');
      setExpression(null);
      setRecordingStatus('idle');
      setIsVideoEnd(false);

      // Update tries counter
      const nextTries = tries + 1;
      setTries(nextTries);

      // Only navigate to report if we've exhausted all tries
      // and we're on the last word
      if (nextTries >= 3 && wordCount + 1 >= questionWordsArray?.length) {
        navigateToReport();
      }
    }, 5000);
  };
  useEffect(() => {
    if (exerciseCount <= 5) {
      setQuestionResponse('');
      setExerciseData(null);
      fetchExerciseData(exerciseCount);
    } else {
      // Ensure all data is properly set before navigation
      setExercisesReport(incorrectQuestions);
      const finalState = {
        correctAnswers: correctAnswersCount,
        incorrectAnswers: incorrectQuestions.length,
        incorrectQuestions,
        expressionsArray,
        isExercise: true,
        incorrectExpressions,
        correctExpressions,
        SessiontypId,
        sessionId,
        startTime
      };
      navigateToReport(finalState);
    }
  }, [exerciseCount]);

  // Navigate to report page
  const navigateToReport = () => {
    const state = {
      SessiontypId,
      sessionId,
      startTime,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectQuestions?.length,
      incorrectQuestions,
      expressionsArray,
      isExercise: true,
      incorrectExpressions,
      correctExpressions,

      totalAttempts: tries,
      rightWords,
      rightAttempts,
      wordCount
    };

    console.log("Navigation Data", state);
    navigate('/stammeringReport', { state });
  };
  useEffect(() => {
    let interval;
    if (recordingStatus === 'recording') {
      interval = setInterval(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        }
        if (counter > 0) {
          setCounter(prevCounter => prevCounter - 20);
        }
        if (timer === 0) {
          onStopRecord();
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [timer, recordingStatus]);

  // Exercise progression effect
  useEffect(() => {
    if (exerciseCount <= 5) {
      setQuestionResponse('');
      setExerciseData(null)
      fetchExerciseData(exerciseCount);
    } else {
      setExercisesReport(incorrectQuestions);
      navigateToReport();
    }
  }, [exerciseCount]);

  // Calculate progress
  const percentageCompleted = (exerciseCount / 5) * 100;

  return (
    <div className="bg-gray-100 mb-0 overflow-hidden min-h-screen">
    <CustomHeader title="Stammering Exercise" goBack={navigateBack} />

    <div className="max-w-4xl mx-auto">
      <div className="mb-0 overflow-hidden">
        <main className="">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-600 text-center mb-2 mt-4"
          >
            Take a deep long breath and say the answer while exhaling/breathing out
          </motion.p>

          <p className="text-left ml-0 mb-4">
            Exercise <span className="font-bold">{exerciseCount}</span> out of <span className="font-bold">5</span>
          </p>

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
              {percentageCompleted.toFixed(1)}%
            </span>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            {/* Left Box: Question and Response */}
            <div className="w-48 flex flex-col gap-2 justify-center">
              <LogoQuestionView
                first_text={"Say this..."}
                second_text={(isWrong ? capitalize(questionWordsArray?.[wordCount]) : capitalize(exerciseData?.Sentence)) || 'Loading...'}
              />
              
              {expression && (
                <div className="text-sm text-center">
                  Facial Expression: {expression}
                </div>
              )}

              {questionResponse && (
                <div className={`text-sm text-center ${
                  questionResponse.includes('Correct') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {questionResponse}
                </div>
              )}

              {/* {mispronouncedWord && (
                <div className="text-sm text-center">
                  Mispronounced Word: <span className="text-red-600">{mispronouncedWord}</span>
                </div>
              )} */}
            </div>

            {/* Right Box: Video Player */}
            <div className="w-48 h-48 rounded-xl overflow-hidden">
              {avatarPath && (
                <VideoPlayer
                  source={`${IMAGE_BASE_URL}${avatarPath}`}
                  onEnd={() => setIsVideoEnd(true)}
                  onStart={() => setIsVideoEnd(false)}
                />
              )}
            </div>
          </div>

          {isDelay && (
            <div className="text-center mb-4">
              <p className="text-gray-700">
                Please be ready for next attempt
              </p>
            </div>
          )}

          <div className="flex flex-row justify-center items-center gap-4 mt-7">
            {/* Webcam Box */}
            <div className="rounded-2xl overflow-hidden flex justify-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "user",
                  width: 192,
                  height: 192,
                }}
                className="rounded-2xl shadow-lg"
              />
            </div>

            {/* Controls Box */}
            <div className="w-48">
              <div className="flex justify-center items-center">
                {recordingStatus === 'idle' && isVideoEnd && (
                  <button
                    onClick={onStartRecord}
                    className="w-full rounded-full bg-slate-900 py-2 px-3 h-10 flex items-center justify-center mt-16 mb-4 transition-all hover:bg-slate-800 active:bg-slate-700"
                  >
                    <span className="text-white font-semibold flex items-center gap-2 text-sm">
                      <span className="text-red-500">●</span> Record
                    </span>
                  </button>
                )}

                {recordingStatus === 'recording' && (
                  <div className="mt-16 mb-4 w-full">
                    <div className="border-2 border-red-500 rounded-full p-1">
                      <button
                        disabled={isStopButtonDisabled}
                        onClick={onStopRecord}
                        className="w-full rounded-full bg-red-500 py-2 px-3 h-10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 active:bg-red-700"
                      >
                        <WaveIcon />
                      </button>
                    </div>
                  </div>
                )}

                {recordingStatus === 'stop' && (
                  <div className="space-y-4 w-full mt-16">
                    {exerciseCount < 5 && (
                      <button
                        onClick={() => {
                          setExerciseCount(prev => prev + 1);
                          setRecordingStatus('idle');
                          setQuestionResponse('');
                          setIsVideoEnd(false);
                          setTries(0);
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                      >
                        Next Exercise
                      </button>
                    )}
                    <button
                      onClick={navigateToReport}
                      className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                    >
                      Finish
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    
    <Loader loading={loading} />
  </div>
  );
};

export default StammeringExercisePage;