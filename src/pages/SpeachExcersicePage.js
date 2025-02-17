import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { useDataContext } from '../contexts/DataContext';
import CustomHeader from '../components/CustomHeader';
import WaveSVG from '../assets/Wave';
import { detectExpression, getToken } from "../utils/functions";
import { useNavigate, useLocation } from 'react-router-dom';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import Loader from '../components/Loader';
import dynamicfunctions from '../utils/dynamicfunctions';
import html2canvas from 'html2canvas';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import LogoQuestionView from '../components/LogoQuestionView';
import WaveIcon from '../assets/Wave';
const RecordButton = (props) => {
  return (
    <button
      disabled={props.disabled}
      onClick={() => props.onPress()}
      style={styles.recordButton}
      aria-label="Record"
    >
      {'\u2B24'} {props.title}
    </button>
  );
};

const EndButton = (props) => {
  return (
    <button onClick={() => props.onPress()} style={styles.endButton}>
      {props.title}
    </button>
  );
};

const NextButton = (props) => {
  return (
    <button onClick={() => props.onPress()} style={styles.nextButton}>
      {props.title}
    </button>
  );
};

const PrevButton = (props) => {
  return (
    <button onClick={() => props.onPress()} style={styles.prevBtn}>
      {props.title}
    </button>
  );
};

const PlayButton = (props) => {
  return (
    <div
      style={{
        borderWidth: '2px',
        borderColor: '#FC4343',
        marginBottom: '10%',
        padding: '5px',
        borderRadius: '100%',
        marginTop: '20px',
        display: 'inline-block',
      }}
    >
      <button
        disabled={props.disabled}
        onClick={() => props.onPress()}
        style={styles.playButton}
        aria-label="Play"
      >
        <WaveSVG />
      </button>
    </div>
  );
};

const SpeechArticulationPage = () => {
  const location = useLocation(); // Get the location object
  const { sessionId, isAll } = location?.state || {}; // Use fallback if state is undefined
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const { setArticulationReport } = useDataContext();
  const [startTime, setStartTime] = useState('');
  const [hack, doHack] = useState(0);
  const [questionData, setQuestionData] = useState(null);
  const [isVideoEnd, setIsVideoEnd] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [disableRecordingButton, setDisableRecordingButton] = useState(false);
  const [expression, setExpression] = useState(null);
  const [expressionsArray, setExpressionsArray] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const cameraRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [tries, setTries] = useState(1);
  const [audioBlobMain, setAudioBlobMain] = useState('');
  const [voiceResult, setVoiceResult] = useState('');
  const [lipUrl, setLipUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(false);
  const userDetail = JSON.parse(localStorage.getItem("userDetails"))
  // Ref for camera
  const mediaRecorderRef = useRef(null); // Ref for the MediaRecorder API
  const audioChunksRef = useRef([]);
  const User = () => localStorage.getItem("userId");
  const storedUserDetail = () => localStorage.getItem("userDetails");
  useEffect(() => {
    const fetchData = () => {
      try {
        setLoading(true)
        // Retrieve user details and userId from localStorage
        const storedUserDetail = localStorage.getItem("userDetails");
        const storedUserId = User(); // This is synchronous, no need for await

        // Check if user details exist in localStorage
        if (storedUserDetail) {
          setUserDetail(JSON.parse(storedUserDetail)); // Parse JSON and set in state
        }

        if (storedUserId) {
          setUserId(storedUserId); // Set userId (no need to parse if it's a string)
        }
      } catch (error) {
        console.error("Error retrieving or parsing userDetails from localStorage", error);
      } finally {
        setLoading(false)
      }
    };

    fetchData(); // Call the function inside useEffect
    console.log(User());
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const togglePlayPause = () => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  useEffect(() => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      const updateProgress = () => {
        if (videoElement.duration) {
          setVideoProgress((videoElement.currentTime / videoElement.duration) * 100);
        }
      };

      videoElement.addEventListener('timeupdate', updateProgress);
      videoElement.addEventListener('play', () => setIsPlaying(true));
      videoElement.addEventListener('pause', () => setIsPlaying(false));
      videoElement.addEventListener('ended', () => setIsPlaying(false));

      return () => {
        videoElement.removeEventListener('timeupdate', updateProgress);
        videoElement.removeEventListener('play', () => setIsPlaying(true));
        videoElement.removeEventListener('pause', () => setIsPlaying(false));
        videoElement.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [videoUrl]);
  const {
    correctAnswersCount,
    correctExpressions,
    correctQuestions,
    incorrectExpressions,
    incorrectQuestions,
    onCorrectAnswer,
    onCorrectExpression,
    onWrongAnswer,
    onWrongExpression,
    questionCount,
    questionResponse,
    recordingStatus,
    setQuestionCount,
    setQuestionResponse,
    setRecordingStatus,
    setIncorrectQuestions
  } = dynamicfunctions({})

  const webcamRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const percentageCompleted = (questionCount / 44) * 100;
  useEffect(() => {
    const currentStartTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    setStartTime(currentStartTime);
  }, []);



  // Update the navigateTo function in SpeechArticulationPage
  const navigateTo = () => {
    const navigationState = {
      SessiontypId: 2,
      sessionId: sessionId,
      startTime: startTime,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectQuestions.length,
      incorrectQuestions: incorrectQuestions,
      expressionsArray,
      incorrectExpressions,
      correctExpressions,
      totalQuestions: 30,
      isQuick: false
    };

    navigate('/resultReport', {
      state: navigationState,
      replace: true  // Use replace to prevent going back to the assessment
    });
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const fetchQuestionData = async (id) => {
    const token = await getToken();
    const userDetail = JSON.parse(storedUserDetail());
    setLoading(true)
    try {

      console.log("userId:", id, ",AvatarID:", userDetail?.AvatarID)
      if (questionCount <= 44) {
        const response = await fetch(`${BaseURL}/${isAll ? "articulation_show_full_exercise" : "get_word_texts"}/${12}/1/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let data = await response.json();
        if (data) {
          console.log(Object.values(data)[0][0]);
          data = Object.values(data)[0][0]


          setLipUrl(data?.LipUrl);

          setVideoUrl(data?.VideoUrl);

          setQuestionData(data);
        }
      }
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setLoading(false)
    }
  };
  useEffect(() => {
    // Only play video when URL changes (initial load or lip video switch)
    const videoElement = document.querySelector('video');
    if (videoElement && videoUrl) {
      videoElement.currentTime = 0;
      videoElement.play();
    }
  }, [videoUrl]);

  useEffect(() => {
    if (questionCount <= 44) {
      fetchQuestionData(questionCount);
    }
  }, [questionCount]);

  const handleWrongAnswer = () => {
    onWrongAnswer(questionData, questionData?.WordText);
    setVoiceResult("UnMatched");

    // Show the response for 2 seconds, then reset for next try
    if (tries < 4) {  // Change from <= 3 to < 4
      setTimeout(() => {
        setVoiceResult('');
        setRecordingStatus('idle');
        setExpression(null);

        // Set lip video URL only on the 3rd try
        if (tries === 3) {
          setVideoUrl(lipUrl);
        }

        // Only now play the video once
        const videoElement = document.querySelector('video');
        if (videoElement) {
          videoElement.currentTime = 0;
          videoElement.play();
        }
      }, 2000);
    } else {
      // On the last try (4th), just show the response without replaying
      setRecordingStatus('stop');
    }
  };


  const onStartRecord = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        setIsStopButtonDisabled(true);
        setTimeout(() => {
          setIsStopButtonDisabled(false);
        }, 2000);

        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(audioStream);
        const audioChunks = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          setLoading(true);
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          setAudioBlobMain(audioBlob);
          setAudioUrl(URL.createObjectURL(audioBlob));
          audioChunks.length = 0;

          const expression = await checkExpression();
          const result = await sendAudio(audioBlob);

          if (!result) {
            setVoiceResult("Failed to process speech");
            handleWrongAnswer();
            setLoading(false);
            return;
          }



          if (result.message?.toLowerCase() === 'matched' || tries >= 4) {
            setRecordingStatus('stop');
            if (tries >= 4) {
              handleWrongAnswer();
            } else {
              onCorrectAnswer(questionData?.WordText);
              setVoiceResult("Matched");
            }
            setExpressionsArray(prev => [...prev, expression]);
          } else {
            handleWrongAnswer();
            setTries(prev => prev + 1);
          }
          setLoading(false);
        };

        mediaRecorderRef.current.start();
        setRecordingStatus('recording');

        // Start video recording
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraRef.current = new MediaRecorder(videoStream);

        cameraRef.current.ondataavailable = (e) => {
          sendVideo(e.data);
        };

        cameraRef.current.start();
      } catch (error) {
        console.error('Error starting media recording:', error);
      }
    }
  };
  // Stop recording both audio and video
  const onStopRecord = async () => {
    try {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        throw new Error('No active recording found');
      }

      mediaRecorderRef.current.stop();
      if (cameraRef.current?.state === 'recording') {
        cameraRef.current.stop();
      }
      setRecordingStatus('stopped');


    } catch (error) {
      console.error('Error stopping recording:', error);
      setVoiceResult("Recording failed. Please try again.");
      setRecordingStatus('idle');
    }
  };

  // Send the recorded video file to the server
  const sendVideo = async (videoBlob) => {
    const token = await getToken();
    const fileName = `${sessionId}_${questionCount}.mp4`;

    try {
      const formData = new FormData();
      // Append the actual Blob object, not the URL
      formData.append('file', videoBlob, fileName);

      const response = await fetch(`${BaseURL}/upload_video_articulation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      // Check if the response is successful (status 200-299)
      if (!response.ok) {
        // If the response is not OK, read the response as text to log the error
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        return;
      }

      // Check if the response is JSON
      const contentType = response.headers.get('Content-Type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        // If the response is JSON, parse it
        result = await response.json();
        console.log('Video uploaded successfully:', result);
      } else {
        // If it's not JSON, treat it as plain text
        const text = await response.text();
        console.log('Server response (non-JSON):', text);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };
  const cameraContainerRef = useRef(null); // Create a reference for the container of the Webcam

  // Capture the snapshot when the button is clicked using html2canvas
  const capture = () => {
    return new Promise((resolve, reject) => {
      if (cameraContainerRef.current) {
        html2canvas(cameraContainerRef.current)
          .then((canvas) => {
            const imageSrc = canvas.toDataURL('image/jpeg');
            console.log("imageSrc", imageSrc);
            setSnapshot(imageSrc); // Still set the snapshot in state if needed
            resolve(imageSrc); // Resolve the promise with the image data
          })
          .catch((error) => {
            console.error('Failed to capture image with html2canvas:', error);
            reject(error);
          });
      } else {
        reject(new Error('Camera reference not found'));
      }
    });
  };
  // Snapshot function
  const sendSnapshot = async () => {
    try {
      const image = await capture(); // Now waits for the image data
      console.log("Captured image:", image); // Should show the base64 string

      if (image && image.includes('base64')) { // Verify we have valid base64 data
        // Convert base64 string to a blob for sending as form data
        const byteString = atob(image.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const view = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
          view[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([view], { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('image', blob, 'snapshot.jpg');

        console.log("Sending formData to API...");
        const response = await detectExpression(formData);
        console.log("Response from expression api:", response);

        if (response?.expression) {
          setExpression(response.expression);
          console.log('Expression detected:', response.expression);
          return response.expression;
        }
      } else {
        console.error('Invalid image data received:', image);
      }
      return null;
    } catch (error) {
      console.error('Failed to take snapshot or detect expression:', error);
      return null;
    }
  };

  // Function to detect the expression (Assumed API function)
  const detectExpression = async (formData) => {
    try {

      const token = await getToken(); // Get the authorization token
      const response = await fetch(`${BaseURL}/detect_expression`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Add the authorization header
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Expression API full response:", data);
      return data;
    } catch (error) {
      console.error('Error detecting expression:', error);
      return null;
    }
  };

  // Function to send audio
  const sendAudio = async (audioBlob) => {
    if (!audioBlob) {
      console.error('No audio blob available');
      setVoiceResult('No audio recorded');
      return null;
    }

    try {
      const token = await getToken();
      const formData = new FormData();

      // Ensure proper audio format and size
      formData.append('audio', audioBlob, 'recorded_audio.wav');
      formData.append('text', questionData?.WordText || '');

      const response = await fetch(`${BaseURL}/process_speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 500) {
          setVoiceResult('Unmatched');
          return { message: 'Unmatched' };
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Audio processing failed:', error);
      setVoiceResult('Unmatched'); // Set to Unmatched for any processing failure
      return { message: 'Unmatched' };
    }
  };
  const checkExpression = async () => {
    try {
      const expressionResponse = await sendSnapshot();
      if (!expressionResponse || expressionResponse.expression === 'undefined') {
        setExpression('Expression not detected');
        return null;
      }

      setExpression(expressionResponse);

      // Check expression and update state
      const isHappy = expressionResponse.toLowerCase() === 'happy';
      if (isHappy) {
        onCorrectExpression(questionData?.WordText, expressionResponse);
      } else {
        onWrongExpression(questionData?.WordText, expressionResponse);
      }

      return expressionResponse;
    } catch (error) {
      console.error('Expression check failed:', error);
      setExpression('Failed to detect expression');
      return null;
    }
  };


  const endAssessment = () => {
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('startTime', startTime);
    localStorage.setItem('correctAnswers', correctAnswersCount);
    localStorage.setItem('incorrectQuestions', JSON.stringify(incorrectQuestions));
    localStorage.setItem('expressionsArray', JSON.stringify(expressionsArray));
    localStorage.setItem('correctExpressions', JSON.stringify(correctExpressions));
    localStorage.setItem('incorrectExpressions', JSON.stringify(incorrectExpressions));

    navigateTo();
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.stop();
      videoRef.current.seek(0.1);
      videoRef.current.play();
    }
  }, [videoUrl]);

  return (
    <div className="bg-gray-100 mb-0 overflow-hidden min-h-screen">
      <CustomHeader title="Articulation Disorder Exercise" goBack={() => navigate(-1)} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-0 overflow-hidden">
          <main className="">
            {/* Instructions */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-600 text-center mb-2 mt-4"
            >
              Place your face in the middle of the camera frame while speaking
            </motion.p>

            {/* Question Counter */}
            <p className="text-left ml-0 mb-4">
              Question <span className="font-bold">{questionCount}</span> out of <span className="font-bold">{userDetail.totalQuestion}</span>
            </p>

            {/* Progress Bar */}
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

            {/* Question Image and Video */}
            {/* Question Image and Video */}
            {questionData && questionData.PictureUrl && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="flex justify-center mb-6"
              >
                <div className="flex gap-4">
                  <img
                    className="w-48 h-48 border-sky-400 border rounded-xl shadow-lg object-cover"
                    src={`${IMAGE_BASE_URL}${questionData.PictureUrl}`}
                    alt="Question"
                  />
                  <div className="relative">
                    <video
                      key={`${videoUrl}-${tries}`}
                      className="rounded-xl  object-cover"
                      width={192}
                      height={192}
                      playsInline
                    >
                      <source src={`${IMAGE_BASE_URL}${videoUrl}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute bottom-[-34px] left-0 right-0 flex items-center space-x-2">
                    <button
                      onClick={togglePlayPause}
                      className="text-[#2DEEAA] hover:text-cyan-300 transition-colors z-10"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-[#2DEEAA] stroke-[#2DEEAA]" />
                      ) : (
                        <Play className="w-6 h-6 fill-[#2DEEAA] stroke-[#2DEEAA]" />
                      )}
                    </button>

                    <div
                      className="relative w-full h-1 bg-gray-200 cursor-pointer rounded-full"

                    >
                      <div
                        className="h-full bg-[#2DEEAA] rounded-full "
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                  </div>

                   
                  </div>
                </div>
              </motion.div>
            )}
                 

            <div className="flex justify-center items-center">
              <div className="w-48">
                {/* Question Text */}
                <div className="flex justify-start">
                  <LogoQuestionView
                    first_text="Say this..."
                    second_text={questionData?.WordText}
                    highlighted={questionData?.code_color?.[0]
                      ? JSON.parse(questionData.code_color[0])
                      : []}
                  />
                </div>
              </div>

              {/* Expression and Voice Result */}
              <div className="flex flex-col gap-2 justify-center items-center p-3 w-56 h-20">
                {voiceResult && (
                  <LogoQuestionView
                    second_text={null}
                    first_text={voiceResult}
                    questionResponse={voiceResult}
                  />
                )}
                {expression && (
                  <p className="text-center">
                    Facial Expression: {expression}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-row justify-center items-center gap-4 mt-7">
              {/* Camera View */}
              <div ref={cameraContainerRef}>
                <div className="rounded-2xl overflow-hidden flex justify-center">
                  <Webcam
                    audio={false}
                    ref={cameraRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "user",
                      width: 192,
                      height: 192,
                    }}
                    className="rounded-2xl shadow-lg"
                  />
                </div>
              </div>

              <div className="w-48">
                {/* Recording Controls */}
                <div className="flex justify-center items-center">
                  {recordingStatus === 'idle' && tries <= 4 && (
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
                    <div className="border-2 border-red-500 mb-4 p-1 rounded-full mt-16 w-full">
                      <button
                        disabled={isStopButtonDisabled}
                        onClick={onStopRecord}
                        className="w-full rounded-full bg-red-500 py-2 px-3 h-10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 active:bg-red-700"
                      >
                        <WaveIcon />
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                {recordingStatus === 'stop' && (
                  <div className="space-y-4">
                    {questionCount < 271 && (
                      <div className="flex gap-4">
                        {questionCount !== 1 && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setRecordingStatus('idle');
                              setExpression(null);
                              setVoiceResult('');
                              setTries(1);
                              if (questionCount >= 1) {
                                setQuestionCount(prevCount => prevCount - 1);
                              }
                            }}
                            className="flex-1 border border-gray-300 hover:bg-gray-50 rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                          >
                            Previous
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setRecordingStatus('idle');
                            setExpression(null);
                            setVoiceResult('');
                            setTries(1);
                            if (questionCount <= 271) {
                              setQuestionCount(prevCount => prevCount + 1);
                            } else {
                              endAssessment();
                            }
                          }}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                        >
                          Next
                        </motion.button>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={endAssessment}
                      className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                    >
                      {questionCount < 271 ? 'End Now' : 'Finish'}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            <Loader loading={loading} />
          </main>
        </div>
      </div>
    </div>
  );
}
export default SpeechArticulationPage