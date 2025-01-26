import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LinearProgress, Button, CircularProgress } from '@mui/material';
import Webcam from 'react-webcam';
import { detectExpression, getToken } from "../utils/functions";
import Loader from '../components/Loader';
import VideoPlayer from '../components/VideoPlayer';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import { useDataContext } from '../contexts/DataContext';
import axios from 'axios';
import dynamicfunctions from '../utils/dynamicfunctions';

const VoiceDisorderPage = () => {
  const location = useLocation();
  const { sessionId, isAll } = location.state || {};
  console.log(location.state)
  const history = useNavigate();
  const [timer, setTimer] = useState(5);
  const [counter, setCounter] = useState(100);
  const [exerciseData, setExerciseData] = useState(null);
  const [exerciseCount, setExerciseCount] = useState(1);
  const [isVideoEnd, setIsVideoEnd] = useState(false);
  const [disableRecordingButton, setDisableRecordingButton] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [expressionArray, setExpressionArray] = useState([]);
  const [expression, setExpression] = useState('');
  const [questionScores, setQuestionScores] = useState([]);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState(null);
  const [voiceResponse, setVoiceResponse] = useState(null);
  const [startTime, setStartTime] = useState(null);



  // Formated Date
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const mins = String(currentDate.getMinutes()).padStart(2, '0');
  const secs = String(currentDate.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const storedUserDetail = localStorage.getItem("userDetails");

  const {
    incorrectExpressions,
    onCorrectExpression,
    onWrongExpression,
    correctExpressions,
    // recordingStatus,
    // setRecordingStatus
  } = dynamicfunctions({})
  useEffect(() => {
    const currentStartTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    setStartTime(currentStartTime);
  }, []);


  // Timer effect for recording
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
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, recordingStatus]);

  // Initial data fetch
  useEffect(() => {
    localStorage.setItem('startTime', startTime);
    fetchExerciseData();
  }, []);

  // Monitor scores
  useEffect(() => {
    console.log('Updated question scores:', questionScores);
  }, [questionScores]);

  const fetchExerciseData = async () => {
    try {
      const token = await getToken();
      const userDetail = JSON.parse(storedUserDetail);

      if (exerciseCount <= 3) {
        const response = await axios.get(
          `${BaseURL}/get_voice_disorders/${userDetail?.AvatarID}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data) {
          setExerciseData(response.data?.voice_disorders);
          setVideoUrl(response.data?.voice_disorders?.[0]?.VideoUrl);
        }
      }
    } catch (error) {
      setError('Failed to fetch exercise data');
      console.error('Error fetching exercise data:', error);
    }
  };

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
    } catch (error) {
      setError('Failed to start recording');
      console.error('Error starting recording:', error);
      setRecordingStatus('idle');
    }
  };

  const sendSnapshot = async () => {
    if (!webcamRef.current) return null;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return null;

      const base64Response = await fetch(imageSrc);
      const blob = await base64Response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'snapshot.jpg');

      const token = await getToken();
      const response = await axios.post(
        `${BaseURL}/detect_expression`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error capturing/sending snapshot:', error);
      return null;
    }
  };

  const onStopRecord = async () => {
    try {
      if (!mediaRecorderRef.current) return;

      return new Promise((resolve) => {
        mediaRecorderRef.current.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            console.log('Audio blob created:', audioBlob.size, 'bytes');

            const expressionResponse = await sendSnapshot();
            console.log('Expression response:', expressionResponse);

            if (expressionResponse) {
              setExpression(expressionResponse);
              setExpressionArray(prevArray => [...prevArray, expressionResponse])
              if (expressionResponse.expression?.toLowerCase() === 'happy') {
                onCorrectExpression(exerciseData?.[exerciseCount - 1]?.WordText, expressionResponse)
              } else {
                onWrongExpression(exerciseData?.[exerciseCount - 1]?.WordText, expressionResponse)
              }
            }

            const [videoResponse, audioResponse] = await Promise.all([
              sendVideo(),
              sendAudio(audioBlob)
            ]);

            console.log('Complete audio response:', audioResponse);
            console.log('Complete video response:', videoResponse);

            if (videoResponse && audioResponse) {
              const voiceResponse = await checkVoiceDisorder(audioBlob);
              console.log('Complete voice disorder response:', voiceResponse);
            }

            resolve();
          } catch (error) {
            console.error('Detailed error in stop recording process:', error);
            resolve();
          }
        };

        mediaRecorderRef.current.stop();
        setRecordingStatus('stop');
      });
    } catch (error) {
      console.error('Detailed error stopping recording:', error);
      setRecordingStatus('stop');
    }
  };

  const sendVideo = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return null;

      const base64Response = await fetch(imageSrc);
      const blob = await base64Response.blob();

      const formData = new FormData();
      formData.append('file', blob, 'video.webm');

      const token = await getToken();
      const response = await axios.post(
        `${BaseURL}/upload_video_voice`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading video:', error);
      return null;
    }
  };

  const sendAudio = async (audioBlob) => {
    if (!audioBlob) return null;

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');

      const token = await getToken();
      const response = await axios.post(
        `${BaseURL}/upload_audio_voice`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading audio:', error);
      return null;
    }
  };

  const checkVoiceDisorder = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', new File([audioBlob], 'sound.wav', {
        type: 'audio/wav'
      }));

      const token = await getToken();
      console.log('Sending voice disorder check request...');

      const response = await fetch(
        `${BaseURL}/predict_voice_disorder`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: formData
        }
      );

      if (!response.ok) {
        console.log('Response not OK:', await response.text());
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Voice disorder prediction data:', data);
      setVoiceResponse(data);

      if (data.predictions?.Normal) {
        const score = parseFloat(data.predictions.Normal);
        setQuestionScores(prevScores => [...prevScores, score]);
      }

      return data;
    } catch (error) {
      console.error('Error checking voice disorder:', error);
      return null;
    }
  };

  // In handleNextExercise function of VoiceDisorderPage
  const handleNextExercise = () => {
    // Save scores to localStorage before navigating
    localStorage.setItem('questionScores', JSON.stringify(questionScores));
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('startTime', startTime);

    if (exerciseCount < 3) {
      setExerciseCount(exerciseCount + 1);
      setRecordingStatus('idle');
      setIsVideoEnd(false);
      setVoiceResponse(null);
      setExpression('');
      setTimer(5);
      setCounter(100);
    } else {
      // Navigate to results page
      history('/voiceReport', {
        state: {
          date: formattedDate,
          expressionArray,
          questionScores,
          sessionId,
          startTime,
          totalQuestions: 3,
          incorrectExpressions,
          correctExpressions
        }
      });
      console.log({
        date: formattedDate,
        expressionArray,
        questionScores,
        sessionId,
        startTime,
        totalQuestions: 3,
        incorrectExpressions,
        correctExpressions
      })
    }
  };

  const navigateBack = () => {
    history(-1);
  };

  const percentageCompleted = (exerciseCount / 3) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <Button
              onClick={navigateBack}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Back
            </Button>
            <h1 className="text-2xl font-semibold">Voice Disorder Assessment</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <p className="text-gray-600 text-center text-lg">
            Place your face in the middle of the camera frame while speaking
          </p>

          {/* Assessment Progress */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xl text-center mb-4">
              Assessment <strong className="text-blue-600">{exerciseCount}</strong> out of <strong className="text-blue-600">3</strong>
            </p>

            <div className="flex items-center gap-4">
              <LinearProgress
                variant="determinate"
                value={percentageCompleted}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-600 min-w-[4rem]">
                {percentageCompleted.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Video Player */}
          {exerciseData && (
            <div className="rounded-xl overflow-hidden shadow-lg">
              <VideoPlayer
                ref={videoRef}
                onEnd={() => {
                  setIsVideoEnd(true);
                  setRecordingStatus('idle');
                }}
                onStart={() => {
                  setIsVideoEnd(false);
                  setRecordingStatus('idle');
                }}
                source={`${IMAGE_BASE_URL}${exerciseData[exerciseCount - 1]?.VideoUrl}`}
              />
            </div>
          )}

          {/* Exercise Text */}
          <div className="text-center space-y-2 bg-blue-50 p-6 rounded-xl">
            <p className="text-blue-600 font-medium">Say this...</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {exerciseData?.[exerciseCount - 1]?.WordText || 'loading'}
            </h3>
          </div>

          {/* Expression Display */}
          {expression && (
            <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center text-lg font-medium">
              Facial Expression: {typeof expression === 'object' ? JSON.stringify(expression) : expression}
            </div>
          )}

          {/* Voice Disorder Prediction Display */}
          {recordingStatus === 'stop' && voiceResponse?.predictions && (
            <div className="bg-white p-4 rounded-xl shadow-sm border mt-4">
              <div className="space-y-2">
                <p className="text-lg font-medium">Label: Normal</p>
                <p className="text-green-600 font-medium">
                  Score: {voiceResponse.predictions.Normal}
                </p>
              </div>
            </div>
          )}

          {/* Camera View */}
          <div className="camera-view rounded-xl overflow-hidden shadow-lg mx-auto max-w-2xl">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: 'user',
              }}
              className="w-full"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl">
              <p>{error}</p>
            </div>
          )}

          {/* Recording Controls */}
          <div className="space-y-4">
            {recordingStatus === 'idle' && isVideoEnd && (
              <Button
                onClick={() => {
                  setDisableRecordingButton(true);
                  setExpression('');
                  onStartRecord();
                }}
                variant="contained"
                color="primary"
                className="w-full py-4 text-lg font-semibold rounded-xl"
              >
                Record
              </Button>
            )}

            {recordingStatus === 'recording' && (
              <div className="text-center space-y-4">
                <p className="text-xl font-semibold text-red-500">
                  0:0{timer > 0 ? timer : 0} Seconds Left
                </p>
                <CircularProgress
                  variant="determinate"
                  value={counter}
                  color="error"
                  size={60}
                  thickness={4}
                />
              </div>
            )}
            {recordingStatus === 'stop' && voiceResponse?.predictions && (
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    if (exerciseCount < 3) {
                      handleNextExercise();
                    } else {
                      history('/voiceReport', {
                        state: {
                          date: formattedDate,
                          expressionArray,
                          questionScores,
                          sessionId,
                          startTime,
                          totalQuestions: 3,
                          incorrectExpressions,
                          correctExpressions
                        }
                      });
                      console.log({
                        date: formattedDate,
                        expressionArray,
                        questionScores,
                        sessionId,
                        startTime,
                        totalQuestions: 3,
                        incorrectExpressions,
                        correctExpressions
                      })
                    }
                  }}
                  variant="contained"
                  color="primary"
                  className="w-full py-3 text-lg font-semibold rounded-xl"
                >
                  {exerciseCount < 3 ? 'Next Exercise' : 'Finish'}
                </Button>
              </div>
            )}
          </div>

          {/* Loader */}
          <div className="p-4 flex justify-center">
            <Loader loading={recordingStatus === 'loading'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDisorderPage;