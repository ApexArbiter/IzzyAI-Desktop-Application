import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
// import VideoPlayer from './VideoPlayer';
import { getToken, detectExpression, getStammeringWords, capitalize } from '../utils/functions';
import VideoPlayer from '../components/VideoPlayer';
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

  const navigate = useNavigate();
  const sentenceID = [1, 3, 4, 9, 11, 12];

  // Fetch exercise data
  const fetchExerciseData = useCallback(async (id) => {
    const token = await getToken();
    try {
      setLoading(true)
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
        fetchAvatarPath(data.Sentence);
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
    console.log('userDetail.AvatarID', userDetail.AvatarID)
    const token = await getToken();
    try {
      const response = await fetch(
        `${BaseURL}/get_avatar_path/${wordtext?.toLowerCase()}/1`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setAvatarPath(data.AvatarPath);
      }
    } catch (error) {
      console.error('Failed to fetch avatar path:', error);
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
      setAvatarPath(null);
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
    <Box sx={{ padding: 2, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Stammering Exercise
      </Typography>

      <Typography variant="body1" paragraph>
        Take a deep long breath and say the answer while exhaling/breathing out.
      </Typography>

      <Typography variant="body2" color="textSecondary" paragraph>
        Exercise {exerciseCount} out of 5
      </Typography>

      <LinearProgress
        variant="determinate"
        value={percentageCompleted}
        sx={{ marginBottom: 2 }}
      />

      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {isWrong
          ? capitalize(questionWordsArray?.[wordCount])
          : capitalize(exerciseData?.Sentence || 'Loading...')
        }
      </Typography>

      {/* Video Player */}
      {avatarPath && (
        <VideoPlayer
          source={`${IMAGE_BASE_URL}${avatarPath}`}
          onEnd={() => setIsVideoEnd(true)}
          onStart={() => setIsVideoEnd(false)}
          videoHeight={300}
        />
      )}
      {/* Text showing Ready
      {isDelay && (
  <Typography 
    variant="body1" 
    align="center" 
    sx={{ 
      mt: 8, 
      color: 'text.primary' 
    }}
  >
    Please be ready for next attempt
  </Typography>
)} */}
      {/* Expression Display */}
      {expression && (
        <Typography variant="body1" align="center" sx={{ marginBottom: 2 }}>
          Facial Expression: {expression}
        </Typography>
      )}

      {/* Question Response */}
      {questionResponse && (
        <Typography
          variant="body1"
          color={questionResponse.includes('Correct') ? 'success.main' : 'error.main'}
          align="center"
          sx={{ marginBottom: 2 }}
        >
          {questionResponse}
        </Typography>
      )}

      {mispronouncedWord && (
        <p className='text-center' >
          Mispronounced Word: <strong className='text-red-600'  >{mispronouncedWord}</strong>
        </p>
      )}

      {isDelay && (
        <Typography
          variant="body1"
          align="center"
          sx={{
            mt: 2,
            mb: 2,
            padding: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 1
          }}
        >
          {questionResponse ? `Result: ${questionResponse}` : 'Please wait for next attempt...'}
        </Typography>
      )}

      {/* Webcam */}
      <Box sx={{ marginTop: 2, marginBottom: 2 }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: 'user' }}
          width="100%"
          height={300}
        />
      </Box>



      {/* Recording Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {recordingStatus === 'idle' && isVideoEnd && (
          <Button
            variant="contained"
            color="primary"
            onClick={onStartRecord}
          >
            Start Recording
          </Button>
        )}

        {recordingStatus === 'recording' && (
          <Button
            variant="contained"
            color="secondary"
            onClick={onStopRecord}
          >
            Stop Recording
          </Button>
        )}

        {recordingStatus === 'stop' && (
          <>
            {exerciseCount < 5 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setExerciseCount(prev => prev + 1);
                  setRecordingStatus('idle');
                  setQuestionResponse('');
                  setIsVideoEnd(false);
                  setTries(0);
                }}
              >
                Next Exercise
              </Button>
            )}
            <Button
              variant="contained"
              color="success"
              onClick={navigateToReport}
            >
              Finish
            </Button>
          </>
        )}
      </Box>

      {/* Loading Indicator */}

    </Box>
  );
};

export default StammeringExercisePage;