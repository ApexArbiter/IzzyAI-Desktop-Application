import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam'; // Using react-webcam for webcam functionality
import { ReactMic } from 'react-mic'; // Using react-mic for audio recording
import LoaderWave from '../components/LoaderWave';
import CustomHeader from '../components/CustomHeader';
import Loader from '../components/Loader';
import { useDataContext } from '../contexts/DataContext';
import { analyzeUserAudio, getToken } from "../utils/functions"; // Placeholder for audio recording
import BaseURL from '../components/ApiCreds';
import { FFmpeg } from '@ffmpeg/ffmpeg'; // Correct import
import BarFilled from '../assets/BarFilled';
import Bar from '../assets/Bar';

const ProgressCenter = () => {
  return (
    <div
      style={{
        backgroundColor: '#FC4343',
        height: '40px',
        width: '40px',
        borderRadius: '100%',
      }}
    />
  );
};

const videoCodecs = ['h264', 'vp8', 'vp9']; // Define the video codecs you're interested in

// Function to request permissions for camera and microphone
const requestPermissions = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    return true; // Permissions granted
  } catch (error) {
    console.error('Permission request failed', error);
    return false; // Permissions denied
  }
};

function SetupProfilePage2({ navigation, route }) {
  const [timer, setTimer] = useState(5);
  const [counter, setCounter] = useState(100);
  const [playStart, setPlayStart] = useState(false);
  const { userId } = useDataContext();
  const [isRecording, setIsRecording] = useState(false);
  const [videoPath, setVideoPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hack, doHack] = useState(0);
  const newCameraInit = () => {
    setTimeout(() => {
      doHack(1);
    }, 100);
  };

  const cameraRef = useRef(null);

  const handlePress = async (audioResult, videoResult) => {
    const formData = new FormData();
    const token = await getToken();

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(
      '0' +
      (date.getMonth() + 1)
    ).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

    formData.append('UserID', userId);
    formData.append('MicQualityPrecent', audioResult?.toString());
    formData.append('CamQualityPrecent', videoResult?.toString());
    formData.append('TestDate', formattedDate);

    fetch(BaseURL + '/add_mic_camera_test_report', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData,
    })
      .then((response) => {
        setIsLoading(false);
        navigation.navigate('setupProfile3', {
          ...route.params,
          videoQualityPercentage: videoResult,
          audioQualityPercentage: audioResult,
        });
      })
      .catch((error) => {
        console.error('here', error);
        setIsLoading(false);
      })
      .finally(() => {
        setTimer(5);
        setCounter(100);
        setPlayStart(false);
        setIsRecording(false);
        setVideoPath('');
      });
  };
  const analyzeAudio = async (result) => {
    const formdata = new FormData()

    formdata.append('audio', {
      uri: result,
      type: 'audio/wav',
      name: 'sound.wav',
    });
    const response = await analyzeUserAudio(formdata)
    return response?.speech_percentage
  }
  const saveAndAnalyze = async (newVideoPath) => {
    setIsLoading(true);

    try {
      const result = await analyzeUserAudio(newVideoPath); // Assuming analyzeAudio is refactored to work in browser
      let audioResult = await analyzeAudio(result);

      const cleanedVideoPath = `${newVideoPath.replace('.mp4', '_cleaned.mp4')}`;

      // Perform noise reduction (using ffmpeg.js)
      const { createFFmpeg, fetchFile } = FFmpeg;
      const ffmpegInstance = createFFmpeg({ log: true });
      await ffmpegInstance.load();

      await ffmpegInstance.run('-i', newVideoPath, '-af', 'afftdn', '-c:v', 'libx264', '-c:a', 'aac', cleanedVideoPath);

      // Use ffmpeg.js to extract media info (could be more complex based on needs)
      const { streams } = await ffmpegInstance.ffprobe(newVideoPath);
      const videoStream = streams.find((stream) => videoCodecs.includes(stream.codec));

      let bitrate, frameRate, resolution, videoCodec, duration;

      if (videoStream) {
        bitrate = videoStream.bitrate;
        frameRate = videoStream.frame_rate;
        resolution = `${videoStream.width}x${videoStream.height}`;
        videoCodec = videoStream.codec;
        duration = videoStream.duration;
      }

      evaluateMediaQuality(
        {
          bitrate: bitrate,
          duration: duration,
          frameRate: frameRate,
          resolution: resolution,
          videoCodec: videoCodec,
        },
        audioResult
      );
    } catch (err) {
      console.error('Error stopping recording or FFmpeg analysis:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateQualityScore = (metric, minQualityIndex, maxQualityIndex) => {
    if (metric < minQualityIndex) {
      return 0;
    }
    if (metric > maxQualityIndex) {
      return 100;
    }

    return ((metric - minQualityIndex) / (maxQualityIndex - minQualityIndex)) * 100;
  };

  const evaluateMediaQuality = (videoMetrics, audioResult) => {
    const videoQualityScore = calculateQualityScore(videoMetrics.bitrate, 500000, 5000000);

    const frameRate =
      parseFloat(videoMetrics.frameRate.split('/')[0]) / parseFloat(videoMetrics.frameRate.split('/')[1]);
    const frameRateScore = calculateQualityScore(frameRate, 24, 60);

    const resolutionScore = calculateQualityScore(videoMetrics.resolution.split('x')[0], 480, 1080);

    const overallVideoQuality = (videoQualityScore + frameRateScore + resolutionScore) / 3;
    handlePress(audioResult, overallVideoQuality);
  };

  const startRecording = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        return;
      }
      setPlayStart(true);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    setPlayStart(false);
    setIsRecording(false);
    setIsLoading(true);

    // You can stop the mic here
  };

  const tick = () => {
    setTimer((prevTimer) => prevTimer - 1);
    setCounter((prevCounter) => prevCounter - 20);
  };

  useEffect(() => {
    if (timer === 0) {
      stopRecording();
    }
  }, [timer]);

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <div style={{ padding: '20px' }}>
      <CustomHeader title="Setup Profile" goBack={navigateBack} />
      <div style={{ textAlign: 'center' }}>
        <img
          src="../assets/images/logo.png"
          alt="Logo"
          style={{ width: '40%', margin: 'auto' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <BarFilled />
        <BarFilled />
        <BarFilled />
        <Bar />
        <Bar />
      </div>

      {isLoading && <Loader loading={isLoading} />}

      <h2 style={{ fontSize: '24px', fontWeight: '500', textAlign: 'center' }}>
        Test your microphone & camera
      </h2>

      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '16px', fontWeight: '500', textAlign: 'center' }}>
          Record yourself saying: <br />
          "The quick brown fox jumps over the lazy dog"
        </p>

        <div style={{ height: '230px', width: '100%', marginTop: '5px', position: 'relative' }}>
          <Webcam
            ref={cameraRef}
            video={true}
            audio={true}
            style={{ width: '100%', height: '100%' }}
            onInitialized={newCameraInit}
          />
        </div>

        <LoaderWave isAnimation={playStart} isDark={true} />

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '500' }}>
            <span style={{ color: '#FC4343' }}>0:0{timer > 0 ? timer : 0}</span> Seconds Left
          </h3>

          <button
            onClick={startRecording}
            disabled={isRecording}
            style={{
              marginTop: '20px',
              borderRadius: '100%',
              border: 'none',
              padding: '20px',
              backgroundColor: '#FC4343',
            }}
          >
           
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupProfilePage2;
