import React, { useState, useEffect, useRef } from 'react';
import ReactWebcam from 'react-webcam';
import { useDataContext } from '../contexts/DataContext'; // Assuming this context exists
import VideoPlayer from '../components/VideoPlayer'; // Assuming VideoPlayer is already web-compatible
import { useLocation, useNavigate } from 'react-router-dom'; // React Router for navigation
import WaveSVG from '../assets/Wave';
import CustomHeader from '../components/CustomHeader';
import { getToken, detectExpression, getStammeringAvatar } from '../utils/functions';
import BaseURL from '../components/ApiCreds';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IMAGE_BASE_URL } from '../components/ApiCreds';
import Loader from '../components/Loader';
import WaveIcon from '../assets/Wave';

const PlayButton = (props) => {
  return (
    <div style={styles.playButtonContainer}>
      <button
        disabled={props.disabled}
        onClick={props.onPress}
        style={styles.playButton}>
        <WaveSVG />
      </button>
    </div>
  );
};

const DarkButton = (props) => {
  return (
    <button onClick={props.onPress} style={styles.recordButton}>
      <span style={styles.recordButtonText}>{props.children}</span>
    </button>
  );
};


const PassagePage = () => {
  const { userId } = useDataContext(); // Assuming you have a data context
  const storedUserDetail = localStorage.getItem("userDetails");
  const location = useLocation();
  const { sessionId, isAll } = location.state || {};
  console.log("State:", location.state)
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [initialExpression, setInitialExpression] = useState(null);
  const [middleExpression, setMiddleExpression] = useState(null);
  const [lastExpression, setLastExpression] = useState(null);
  const [isVideoEnd, setIsVideoEnd] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [stutter, setStutter] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(false);


  const chunks = useRef([]);
  const webcamRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null); // For controlling the video recording (if necessary)

  useEffect(() => {
    getAvatar();
  }, []);
  useEffect(() => {
    initializeRecording();

    // Cleanup function
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Run once on component mount

  // Fetch avatar video URL
  const getAvatar = async () => {
    try {
      setLoading(true)
      const userDetail = JSON.parse(storedUserDetail);
      const response = await getStammeringAvatar(userDetail?.AvatarID);
      const video = response?.find(item => item?.avatar_name === 'passsage_1');
      // console.log(video);
      setVideoUrl(video?.path);
    } catch (error) {
      console.error('Error fetching avatar:', error);
    } finally { setLoading(false) }
  };

  // Handle snapshot and send to API for expression detection
  const takeSnapshot = (expressionType) => {
    const webcam = webcamRef.current;
    if (webcam) {
      const imageSrc = webcam.getScreenshot();
      setExpressionFn(expressionType, imageSrc);
    }
  };

  // Function to handle setting expressions and triggering the snapshot
  const setExpressionFn = async (expressionType, image) => {
    if (expressionType === 'initial') {
      // setInitialExpression(image);
      await sendSnapshot(image, setInitialExpression);
    }
    if (expressionType === 'middle') {
      // setMiddleExpression(image);
      await sendSnapshot(image, setMiddleExpression);
    }
    if (expressionType === 'last') {
      // setLastExpression(image);
      await sendSnapshot(image, setLastExpression);
    }
  };

  // Handle snapshot and send to API for expression detection
  const sendSnapshot = async (imageUrl, setExpression) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('Invalid image URL:', imageUrl);
      return;
    }
    try {
      if (imageUrl) {
        // console.log(imageUrl);

        // Convert base64 string to Blob
        const base64Data = imageUrl.split(',')[1];
        const blob = base64ToBlob(imageUrl, 'image/jpeg');

        // Create a File object from the Blob
        const file = new File([blob], 'snapshot.jpg', { type: 'image/jpeg' });

        // Prepare the FormData
        const formData = new FormData();
        formData.append('image', file);

        // Send the request to detect the expression
        const response = await detectExpression(formData);

        if (response?.expression) {
          console.log(response.expression);
          setExpression(response?.expression);
        }
      }
    } catch (error) {
      console.error('Error sending snapshot:', error);
    }
  };

  // Helper function to convert base64 string to Blob
  const base64ToBlob = (base64Data, contentType) => {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset++) {
      const byte = byteCharacters.charCodeAt(offset);
      byteArrays.push(byte);
    }

    return new Blob([new Uint8Array(byteArrays)], { type: contentType });
  };
  useEffect(() => {
    const currentStartTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    setStartTime(currentStartTime);
  }, []);

  // Function to detect the expression
  useEffect(() => {
    if (stutter !== null && status === 'stop' && initialExpression && middleExpression && lastExpression) {
      setTimeout(() => {
        const { no_stuttering, stuttering } = stutter;
        navigate('/passage-results', {
          state: {
            sessionId,
            isAll,
            startTime,
            result: stutter,
            isQuick: false,
            isExercise: false,
            initialExpression,
            middleExpression,
            lastExpression,
            expressionsArray: [initialExpression, middleExpression, lastExpression],
            incorrectExpressions: [initialExpression, middleExpression, lastExpression]?.filter(item => item?.toLowerCase() !== 'happy'),
            correctExpressions: [initialExpression, middleExpression, lastExpression]?.filter(item => item?.toLowerCase() === 'happy'),
            stutteringScore: {
              noStuttering: no_stuttering,
              stuttering: stuttering
            }
          },
        })
      }, 5000);
    }
  }, [stutter, status, initialExpression, middleExpression, lastExpression]);




  const detectExpression = async (formData) => {
    try {
      const token = await getToken(); // Get the authorization token
      const response = await fetch(`${BaseURL}/detect_expression`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Expression API full response:", data);

      // if (data) {
      //   // Increment the detection count
      //   setDetectionCount((prevCount) => {
      //     const newCount = prevCount + 1;

      //     // Check if the count reaches 3
      //     if (newCount === 3) {
      //       const { no_stuttering, stuttering } = stutter;
      //       setTimeout(() => {
      //         console.log(sessionId,
      //           isAll,
      //           initialExpression,
      //           middleExpression,
      //           lastExpression,)
      //         navigate('/passage-results', {
      //             state: {
      //               sessionId,
      //               isAll,
      //               initialExpression,
      //               middleExpression,
      //               lastExpression,
      //               stutteringScore: {
      //                 noStuttering: no_stuttering,
      //                 stuttering: stuttering
      //               }
      //             },
      //             replace: true
      //           });;
      //       }, 2000); // Navigate after 2 seconds
      //     }

      //     return newCount;
      //   });
      // }

      return data;
    } catch (error) {
      console.error('Error detecting expression:', error);
      return null;
    }
  };






  const initializeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      });

      // Collect data chunks as they become available
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      setMediaRecorder(recorder);

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  // Start recording video and take snapshots at specific intervals
  const onStartRecord = () => {
    setStatus('recording');
    setIsVideoEnd(false);
    setIsStopButtonDisabled(true);

    // Clear previous chunks
    chunks.current = [];

    // Start recording
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      mediaRecorder.start();

      // Take snapshots at intervals
      setTimeout(() => takeSnapshot('initial'), 1000);
      setTimeout(() => takeSnapshot('middle'), 3000);
      setTimeout(() => takeSnapshot('last'), 5000);
      setTimeout(() => {
        setIsStopButtonDisabled(false);
      }, 5000);
    }
  };


  // Stop recording video and audio
  const onStopRecord = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      setStatus('idle');
      setLoading(true);

      mediaRecorder.onstop = async () => {
        try {
          if (chunks.current.length > 0) {
            const videoBlob = new Blob(chunks.current, { type: 'video/webm' });
            const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });

            // Send video and audio first
            await sendVideo(videoBlob);
            await sendAudio(audioBlob);

            // Get stutter analysis separately
            const stutterResponse = await CheckAudio(audioBlob);
            console.log("Stutter Analysis Response:", stutterResponse);

            // Destructure the values from the response
            setStutter(stutterResponse)
            const { no_stuttering, stuttering } = stutterResponse;

            // Store data in localStorage
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('initialExpression', initialExpression || 'undefined');
            localStorage.setItem('middleExpression', middleExpression || 'undefined');
            localStorage.setItem('lastExpression', lastExpression || 'undefined');
            localStorage.setItem('stutteringScore', JSON.stringify({
              noStuttering: no_stuttering,
              stuttering: stuttering
            }));


            console.log("No Stuttering Percentage:", no_stuttering);
            console.log("Stuttering Percentage:", stuttering);


            // Navigate to results page
            // navigate('/passage-results', {
            //   state: {
            //     sessionId,
            //     isAll,
            //     initialExpression,
            //     middleExpression,
            //     lastExpression,
            //     stutteringScore: {
            //       noStuttering: no_stuttering,
            //       stuttering: stuttering
            //     }
            //   },
            //   replace: true
            // });

            setStatus('stop');
          }
        } catch (error) {
          console.error('Error processing recording:', error);
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.stop();
    }
  };
  // Send video to the server
  const sendVideo = async (videoBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', videoBlob, `${userId}_1.mp4`);

      const token = await getToken();
      const response = await axios.post(`${BaseURL}/upload_video_stammering`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        console.log('Video uploaded successfully');
        console.log(response);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  // Send audio to the server
  const sendAudio = async (audioBlob) => {
    try {
      console.log('audioBlob', audioBlob)
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav'); // Adjust file name as needed

      const token = await getToken(); // Replace with actual token fetching logic
      const response = await axios.post(`${BaseURL}/upload_audio_stammering`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        console.log('Audio uploaded successfully');
        console.log("response", response);
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  // Check the audio stuttering

  const CheckAudio = async (audioBlob) => {
    // Create a proper File object from the Blob
    const audioFile = new File([audioBlob], 'sound.wav', {
      type: 'audio/wav'
    });
    const token = await getToken()
    const formData = new FormData();
    // Append the File directly to FormData
    formData.append('audio', audioFile);

    const options = {
      method: 'POST',
      body: formData,
      // Remove the Content-Type header - browser will set it automatically with boundary
      headers: {
        'Authorization': `Bearer ${token}`,
        Accept: 'application/json'

      }
    };

    try {
      const response = await fetch(`${BaseURL}/predict_stutter`, options);
      console.log('Response status:', response.status);

      if (!response.ok) {
        // Log the error response for debugging
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Audio uploaded successfully');
      console.log("response data:", data);
      return data;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  };


  const navigateBack = () => {
    navigate(-2); // Navigate back 2 pages
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <CustomHeader title="Stammering Assessment" goBack={navigateBack} />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto  flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-4">
        {/* Instructions */}
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center text-gray-600 mb-6 mt-4"
        >
          Place your face in the middle of the camera frame while speaking
        </motion.p>

        {/* First Row: Passage and Video */}
        <div className=" grid grid-cols-2 gap-4 mb-4">
          {/* Left Column: Passage */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Read this Paragraph:</h2>
              <div
                className="prose max-w-none h-[180px] overflow-y-auto custom-scrollbar"
                style={{
                  fontSize: '16px',
                  lineHeight: '1.5',
                  paddingRight: '10px'
                }}
              >
                <p className="text-gray-700 text-lg">
                  Well, he is nearly 93 years old, yet he still thinks as
                  swiftly as ever. He dresses himself in an old black frock
                  coat, usually several buttons missing. A long beard clings to
                  his chin, giving those who observe him a pronounced feeling of
                  the utmost respect. When he speaks, his voice is just a bit
                  cracked and quivers a bit. Twice each day he plays skillfully
                  and with zest upon a small organ. Except in the winter when
                  the snow or ice prevents, he slowly takes a short walk in the
                  open air each day. We have often urged him to walk more and
                  smoke less, but he always answers, "Banana oil!" Grandfather
                  likes to be modern in his language.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Video Player */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className=" rounded-xl  overflow-hidden h-64"
          >
            <div className="h-full w-full ">
              <VideoPlayer
                className="rounded-xl  h-[192px] "
                source={`${IMAGE_BASE_URL}${videoUrl}`}
                onEnd={() => setIsVideoEnd(true)}
              />
            </div>
          </motion.div>
        </div>




        {/* Second Row: Webcam and Controls */}
        <div className="grid grid-cols-2 gap-4 mt-4 ">
          {/* Left Column: Webcam */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-md  overflow-hidden h-[250px]"
          >
            <div className=" ">
              <ReactWebcam
                ref={webcamRef}
                videoConstraints={{ facingMode: 'user' }}
                audio={false}
                screenshotFormat="image/jpeg"
                height={"20px"}
              // className="w-auto h-full object-center"
              />
            </div>
          </motion.div>

          {/* Right Column: Controls */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className=" rounded-xl overflow-hidden flex items-center justify-center"
          >
            {(isVideoEnd && status === 'idle' || status === 'recording') && (
              <div className="p-8 flex flex-col items-center gap-4">
                {isVideoEnd && status === 'idle' && (
                  <button
                    onClick={onStartRecord}
                    className=" rounded-full bg-slate-900 py-2 px-32 w-4/5 h-10 flex items-center justify-center mt-16  transition-all hover:bg-slate-800 active:bg-slate-700"
                  >
                    <span className="text-white font-semibold flex items-center gap-2 text-sm">
                      <span className="text-red-500">●</span> Record
                    </span>
                  </button>
                )}
                {status === 'recording' && (
                  <div className="border-2 border-red-500  p-1 rounded-full w-4/5  mt-16">
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
            )}

            {/* Expressions */}

            {status === 'stop' && (
              <div className='w-full h-full flex flex-col items-center justify-center p-8 gap-4'>
                <p className="text-gray-700  font-medium">
                  {initialExpression ? `Initial Expression: ${initialExpression}` : 'Waiting for initial expression...'}
                </p>

                <p className="text-gray-700 font-medium">
                  {middleExpression ? `Middle Expression: ${middleExpression}` : 'Waiting for middle expression...'}
                </p>

                <p className="text-gray-700 font-medium">
                  {lastExpression ? `Last Expression: ${lastExpression}` : 'Waiting for last expression...'}
                </p>
              </div>
            )}

          </motion.div>
        </div>

        {/* Loading Indicator */}
        <Loader loading={loading} />
      </main>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `}</style>
    </motion.div >

  );
}
export default PassagePage;
