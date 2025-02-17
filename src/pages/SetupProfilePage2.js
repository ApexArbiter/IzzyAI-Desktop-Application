import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { getToken } from '../utils/functions';
import CustomHeader from '../components/CustomHeader';
import Loader from '../components/Loader';

// Existing components remain the same
const BarFilled = () => (
  <div className="h-1.5 w-[12%] bg-gray-900 rounded-full"></div>
);

const Bar = () => (
  <div className="h-1.5 w-[12%] bg-gray-200 rounded-full"></div>
);

// Adjusted LoaderWave for better scaling
const LoaderWave = ({ isAnimation }) => {
  if (!isAnimation) return null;
  
  return (
    <div className="flex justify-center items-center gap-0.5 h-6 my-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-0.5 bg-gray-900 rounded-full animate-sound-wave"
          style={{
            height: '100%',
            animation: `soundWave 1s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

const CircularProgress = ({ progress, size = 48, strokeWidth = 4, onClick, disabled }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className={`relative cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#DADADA"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FC4343"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300"
        />
      </svg>
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   w-8 h-8 bg-[#FC4343] rounded-full"
      />
    </div>
  );
};


const SetupProfilePage2 = () => {
  const { userId } = useDataContext();
  const [timer, setTimer] = useState(5);
  const [counter, setCounter] = useState(100);
  const [playStart, setPlayStart] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false)
  
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);

  // Timer effect from VoiceDisorderPage
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
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setLoader(true)
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Failed to access camera');
      }finally{
        setLoader(false)
      }
    };
  
    initializeCamera();
  
    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const onStartRecord = async () => {
    try {
      setRecordingStatus('recording');
      setTimer(5);
      setCounter(100);
      setPlayStart(true);
      audioChunksRef.current = [];
      videoChunksRef.current = []; // Reset video chunks

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Separate video and audio data based on their MIME types
          if (event.data.type.includes('video')) {
            videoChunksRef.current.push(event.data);
          }
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(100);
    } catch (error) {
      setError('Failed to start recording');
      console.error('Error starting recording:', error);
      setRecordingStatus('idle');
      setPlayStart(false);
    }
  };

  const onStopRecord = async () => {
    try {
      setLoader(true);
      if (!mediaRecorderRef.current) return;

      return new Promise((resolve) => {
        mediaRecorderRef.current.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
            
            const quality = await analyzeMediaQuality(audioBlob, videoBlob);
            await handleQualityResults(quality);

            resolve();
          } catch (error) {
            console.error('Error in stop recording process:', error);
            setError('Failed to process recording');
            resolve();
          }
        };

        mediaRecorderRef.current.stop();
        setRecordingStatus('stop');
        setPlayStart(false);
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Failed to stop recording');
      setRecordingStatus('stop');
      setPlayStart(false);
    } finally {
      setLoader(false);
    }
  };

  const analyzeMediaQuality = async (audioBlob, videoBlob) => {
    // Audio quality calculation remains the same
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioData = await audioContext.decodeAudioData(audioBuffer);
    const samples = audioData.getChannelData(0);
    
    const volume = calculateVolumeLevel(samples);
    const snr = calculateSignalToNoise(samples);
    
    const audioQuality = Math.min(
      ((volume * 0.6) + (snr * 0.4)) * 100, 
      100
    );
    
    // Improved video quality calculation
    const videoSize = videoBlob.size;
    
    // Check if video data is present and valid
    if (!videoSize || videoSize < 1000) { // If size is too small or zero
        return {
            audioQuality: Math.round(audioQuality),
            videoQuality: 0 // Return 0 for no video
        };
    }
    
    // Base quality on file size - typical 5 second video should be between 500KB and 2MB
    const minSize = 500 * 1024; // 500KB
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    // Calculate quality percentage based on size range
    let videoQuality = ((videoSize - minSize) / (maxSize - minSize)) * 100;
    
    // Clamp between 0 and 100
    videoQuality = Math.max(0, Math.min(100, videoQuality));
    
    // If quality is extremely low, it might indicate no real video data
    if (videoQuality < 10) {
        videoQuality = 0;
    }
    
    return {
        audioQuality: Math.round(audioQuality),
        videoQuality: Math.round(videoQuality)
    };
};
  
  
  const calculateVolumeLevel = (samples) => {
  
    const rms = Math.sqrt(
      samples.reduce((sum, sample) => sum + (sample * sample), 0) / samples.length
    );
    
    
    return Math.min(rms * 10, 1); 
  };
  
  const calculateSignalToNoise = (samples) => {
   
    const chunkSize = 1024;
    const chunks = [];
    
    for (let i = 0; i < samples.length; i += chunkSize) {
      chunks.push(samples.slice(i, i + chunkSize));
    }
    
    
    const variances = chunks.map(chunk => {
      const mean = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
      return chunk.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / chunk.length;
    });
    
    const signalPower = Math.max(...variances);
    const noisePower = Math.min(...variances);
    
    const snr = signalPower / (noisePower + 1e-10);
    return Math.min(snr / 100, 1); 
  };

  const handleQualityResults = async (quality) => {
    try {
      const token = await getToken();
      const formData = new FormData();
      
      formData.append('UserID', userId);
      formData.append('MicQualityPrecent', quality.audioQuality.toString());
      formData.append('CamQualityPrecent', quality.videoQuality.toString());
      formData.append('TestDate', new Date().toISOString().split('T')[0]);
      console.log(formData);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(`${BaseURL}/add_mic_camera_test_report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
     
      if (!response.ok) throw new Error('Failed to submit test results');

      navigate('/setupProfile3', {
        state: {
          ...location.state,
          videoQualityPercentage: quality.videoQuality,
          audioQualityPercentage: quality.audioQuality,
        }
      });
    } catch (error) {
      console.error('Error submitting results:', error);
      setError('Failed to submit test results');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col">
      <CustomHeader title="Setup Profile" goBack={handleBack} />
      
      <div className="flex-1 flex flex-col">
        {/* Main content container with dynamic padding */}
        <div className="flex-1 px-4 py-2 md:px-6 lg:px-8 max-w-3xl mx-auto w-full flex flex-col">
          {/* Logo section - reduced vertical space */}
          <div className="h-12 w-32 mx-auto mb-4">
            <img
              src={require("../assets/images/logo.png")}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Progress bar - made more compact */}
          <div className="flex justify-between items-center gap-1 mb-4">
            <BarFilled />
            <BarFilled />
            <BarFilled />
            <Bar />
            <Bar />
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
            </div>
          )}

          {/* Main content area with flexible spacing */}
          <div className="flex-1 flex flex-col justify-between min-h-0">
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-medium text-gray-900 text-center">
                Test your microphone & camera
              </h1>

              <p className="text-center text-base md:text-lg font-medium">
                Record yourself saying:
                <br />
                "The quick brown fox jumps over the lazy dog"
              </p>
            </div>

            {/* Video container with dynamic sizing */}
            <div className="flex-1 min-h-0 my-4">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-100">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom section */}
            <div className="space-y-2">
              {/* <LoaderWave isAnimation={playStart} /> */}

              {error && (
                <div className="bg-red-50 text-red-800 p-2 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center space-y-2">
                <p className="text-xl font-medium">
                  <span className="text-[#FC4343]">0:0{timer > 0 ? timer : 0}</span>
                  {' '}Seconds Left
                </p>

                <CircularProgress
                  progress={counter}
                  onClick={recordingStatus === 'idle' ? onStartRecord : undefined}
                  disabled={recordingStatus === 'recording'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <AlertModal
          isOpen={isAlertOpen}
          onConfirm={() => {
            data.navigate && navigate("/settings"); 
            setIsAlertOpen(false); 
          }}
          onClose={() => {
           
            data.navigate && navigate("/settings");
            setIsAlertOpen(false); 
          }}
          type="success"
          title={data.title}
          message={data.message}
          confirmText="OK"
        /> */}
      <Loader loading={loader} />
    </div>
  );
};

export default SetupProfilePage2;