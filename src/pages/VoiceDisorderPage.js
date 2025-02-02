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
    <div className="h-screen flex flex-col bg-gray-50">
      <CustomHeader title="Voice Disorder Assessment" goBack={navigateBack} />
      <div className="flex-grow overflow-hidden flex flex-col">
        <p className="text-center mt-2 text-sm">
          Place your face in the middle of the camera frame while speaking
        </p>
        <div className="flex-grow overflow-auto px-4 pb-4">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className=" p-3 rounded-xl shadow">
              <p className="text-lg text-center">
                Assessment <strong className="">{exerciseCount}</strong> out of{" "}
                <strong className="">3</strong>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <LinearProgress variant="determinate" value={percentageCompleted} className="flex-1" />
                <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                  {percentageCompleted.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow h-[250px] flex justify-center flex-col items-center overflow-auto">
                <LogoQuestionView
                  first_text={"Say this..."}
                  second_text={exerciseData?.[exerciseCount - 1]?.WordText || "loading"}
                />
                {expression && (
                  <div className="bg-green-50 text-green-800 p-2  rounded-xl text-center text-sm mt-4">
                    Facial Expression: {expression.expression}
                  </div>
                )}
                {/* {recordingStatus === "stop" && voiceResponse?.predictions && (
                  <div className="bg-gray-50 p-2 rounded-xl mt-2">
                    <p className="text-sm font-medium">Label: Normal</p>
                    <p className="text-green-600 text-sm">Score: {voiceResponse.predictions.Normal}</p>
                  </div>
                )} */}
              </div>
              <div className="bg-white rounded-xl shadow overflow-hidden h-[250px]">
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

            <div className="bg-white p-4 rounded-xl shadow w-[400px] mx-auto  flex justify-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "user",
                }}
                className=" rounded-lg w-[400px]"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 p-2 rounded-xl text-sm">
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-center items-center h-16">
              {recordingStatus === "idle" && isVideoEnd && (
                <Button
                  onClick={onStartRecord}
                  variant="contained"
                  color="primary"
                  className="w-full max-w-xs py-2 text-base font-semibold rounded-full"
                >
                  Record
                </Button>
              )}

              {recordingStatus === "recording" && (
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-500 mb-2">
                    0:0{timer > 0 ? timer : 0} Seconds Left
                  </p>
                  <CircularProgress variant="determinate" value={counter} color="error" size={40} thickness={4} />
                </div>
              )}

              {recordingStatus === "stop" && voiceResponse?.predictions && (
                <Button
                  onClick={handleNextExercise}
                  variant="contained"
                  color="primary"
                  className="w-full max-w-xs py-2 text-base font-semibold rounded-full"
                >
                  {exerciseCount < 3 ? "Next Exercise" : "Finish"}
                </Button>
              )}
            </div>

            <div className="flex justify-center">
              <Loader loading={loader} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDisorderPage;