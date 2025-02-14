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
import LogoQuestionView from '../components/LogoQuestionView';
import CustomHeader from '../components/CustomHeader';
import { motion } from 'framer-motion';
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
  const [loader, setLoader] = useState(false)



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
      setLoader(true);
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
    } finally {
      setLoader(false);
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
      setLoader(true);
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
              setExpressionArray(prevArray => [...prevArray, expressionResponse.expression])
              if (expressionResponse.expression?.toLowerCase() === 'happy') {
                onCorrectExpression(exerciseData?.[exerciseCount - 1]?.WordText, expressionResponse)
              } else {
                onWrongExpression(exerciseData?.[exerciseCount - 1]?.WordText, expressionResponse)
              }
            }

            // const [videoResponse, audioResponse] = await Promise.all([
            //   sendVideo(),
            //   sendAudio(audioBlob)
            // ]);

            // console.log('Complete audio response:', audioResponse);
            // console.log('Complete video response:', videoResponse);

            // if (videoResponse && audioResponse) {
              const voiceResponse = await checkVoiceDisorder(audioBlob);
              console.log('Complete voice disorder response:', voiceResponse);
            // }

            // resolve();
          } catch (error) {
            console.error('Detailed error in stop recording process:', error);
            // resolve();
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
        let array = [...questionScores]
        let filteredArray = array?.filter(item => item?.wordtext !== exerciseData?.[exerciseCount - 1]?.WordText)
        filteredArray?.push({ ...data?.predictions, wordtext: exerciseData?.[exerciseCount - 1]?.WordText })
        setQuestionScores(filteredArray);
        console.log(filterArray)
      }

      return data;
    } catch (error) {
      console.error('Error checking voice disorder:', error);
      return null;
    } finally {
      setLoader(false);
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
    <div className="bg-gray-100 mb-0 overflow-hidden min-h-screen">
    <CustomHeader title="Voice Disorder Assessment" goBack={navigateBack} />

    <div className="max-w-4xl mx-auto">
      <div className="mb-0 overflow-hidden">
        <main className="">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-600 text-center mb-2 mt-4"
          >
            Place your face in the middle of the camera frame while speaking
          </motion.p>

          <p className="text-left ml-0 mb-4">
            Assessment <span className="font-bold">{exerciseCount}</span> out of <span className="font-bold">3</span>
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
            {/* Box 1: Question, Expression, Voice Response */}
            <div className="w-48 flex flex-col gap-2 justify-center  ">
              <LogoQuestionView
                first_text={"Say this..."}
                second_text={exerciseData?.[exerciseCount - 1]?.WordText || "loading"}
              />
              {expression && (
                <div className="text-sm text-center">
                  Facial Expression: {expression.expression}
                </div>
              )}
              {/* {recordingStatus === "stop" && voiceResponse?.predictions && (
                <div className="text-sm text-center">
                  <p>Label: Normal</p>
                  <p className="text-green-600">Score: {voiceResponse.predictions.Normal}</p>
                </div>
              )} */}
            </div>

            {/* Box 2: Video Player */}
            <div className="w-48 h-48 rounded-xl overflow-hidden">
              {exerciseData && (
                <VideoPlayer
                  ref={videoRef}
                  onEnd={() => {
                    setIsVideoEnd(true);
                    setRecordingStatus("idle");
                  }}
                  onStart={() => {
                    setIsVideoEnd(false);
                    setRecordingStatus("idle");
                  }}
                  source={`${IMAGE_BASE_URL}${exerciseData[exerciseCount - 1]?.VideoUrl}`}
                />
              )}
            </div>
          </div>

          <div className="flex flex-row justify-center items-center gap-4 mt-7">
            {/* Box 3: Webcam */}
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

            {/* Box 4: Controls */}
            <div className="w-48">
              <div className="flex justify-center items-center">
                {recordingStatus === "idle" && isVideoEnd && (
                  <button
                    onClick={onStartRecord}
                    className="w-full rounded-full bg-slate-900 py-2 px-3 h-10 flex items-center justify-center mt-16 mb-4 transition-all hover:bg-slate-800 active:bg-slate-700"
                  >
                    <span className="text-white font-semibold flex items-center gap-2 text-sm">
                      <span className="text-red-500">●</span> Record
                    </span>
                  </button>
                )}

                {recordingStatus === "recording" && (
                  <div className="mt-16 mb-4 text-center">
                    <p className="text-lg font-semibold text-red-500 mb-2">
                      0:0{timer > 0 ? timer : 0} Seconds Left
                    </p>
                    <CircularProgress variant="determinate" value={counter} color="error" size={40} thickness={4} />
                  </div>
                )}

                {recordingStatus === "stop" && voiceResponse?.predictions && (
                  <div className="space-y-4 w-full mt-16">
                    <button
                      onClick={handleNextExercise}
                      className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                    >
                      {exerciseCount < 3 ? "Next Exercise" : "Finish"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Loader loading={loader} />
        </main>
      </div>
    </div>
  </div>
  );
};

export default VoiceDisorderPage;