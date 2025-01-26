import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from "../utils/functions";
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import Loader from '../components/Loader';

// Button Components
const EndButton = ({ onPress, title }) => (
  <button onClick={onPress} className="w-[42%] rounded-3xl flex items-center justify-center bg-red-500 p-3 h-[50px]">
    <span className="text-white font-semibold">{title}</span>
  </button>
);

const NextButton = ({ onPress, title }) => (
  <button onClick={onPress} className="w-[42%] rounded-[50px] flex items-center justify-center bg-[#71D860] p-3 h-[50px]">
    <span className="text-[#111920] font-semibold">{title}</span>
  </button>
);

const PrevButton = ({ onPress, title }) => (
  <button onClick={onPress} className="w-[42%] rounded-[50px] flex items-center justify-center border border-solid p-3 h-[50px]">
    <span className="text-[#111920] font-semibold">{title}</span>
  </button>
);

// Progress Bar Component
const LinearProgress = ({ value }) => (
  <div className="relative w-full h-2 bg-gray-200 rounded-2xl overflow-hidden">
    <div
      className="absolute top-0 left-0 h-full bg-[#FF7A2F] transition-all duration-300 ease-in-out rounded-2xl"
      style={{ width: `${value * 100}%` }}
    />
  </div>
);

// Loader Wave Component
const LoaderWave = ({ isAnimation, isDark }) => (
  <div className={`flex items-center justify-center gap-1 ${isAnimation ? 'animate-pulse' : ''}`}>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`w-1 h-4 ${isDark ? 'bg-gray-800' : 'bg-gray-400'} rounded-full transform transition-all duration-150`}
        style={{
          animation: isAnimation ? `wave 1s infinite ${i * 0.1}s` : 'none'
        }}
      />
    ))}
  </div>
);

const VoiceDisorderPage = () => {
  const location = useLocation();
  const { sessionId } = location.state || {};
  const navigate = useNavigate();
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [startTime, setStartTime] = useState(null);
  const [exerciseData, setExerciseData] = useState(null);
  const [exerciseCount, setExerciseCount] = useState(1);
  const [questionScores, setQuestionScores] = useState([]);
  const [error, setError] = useState(null);
  const [voiceResponse, setVoiceResponse] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
  const storedUserDetail = localStorage.getItem("userDetails");
  const percentageCompleted = exerciseCount / 3;

  useEffect(() => {
    const currentStartTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setStartTime(currentStartTime);
    localStorage.setItem('startTime', currentStartTime);
    fetchExerciseData();
  }, []);

  const fetchExerciseData = async () => {
    try {
      const token = await getToken();
      const userDetail = JSON.parse(storedUserDetail);
      const response = await fetch(
        `${BaseURL}/get_voice_disorders/${userDetail?.AvatarID}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      if (data) setExerciseData(data?.voice_disorders);
    } catch (error) {
      setError('Failed to fetch exercise data');
      console.error('Error:', error);
    }
  };

  const onStartRecord = async () => {
    try {
      setRecordingStatus('recording');
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start(100);
    } catch (error) {
      setError('Failed to start recording');
      setRecordingStatus('idle');
    }
  };

  const onStopRecord = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          await checkVoiceDisorder(audioBlob);
        } catch (error) {
          console.error('Error:', error);
        }
        resolve();
      };
      mediaRecorderRef.current.stop();
      setRecordingStatus('stop');
    });
  };

  const checkVoiceDisorder = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', new File([audioBlob], 'sound.wav', { type: 'audio/wav' }));

      const token = await getToken();
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

      const data = await response.json();
      setVoiceResponse(data);
      console.log('Voice Response:', data);

      if (data.predictions?.Normal) {
        setQuestionScores(prev => [...prev, parseFloat(data.predictions.Normal)]);
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    } finally {
      setRecordingStatus('result');
    }
  };

  const handleNextExercise = () => {
    localStorage.setItem('questionScores', JSON.stringify(questionScores));
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('startTime', startTime);

    if (exerciseCount < 3) {
      setExerciseCount(prev => prev + 1);
      setRecordingStatus('idle');
      setVoiceResponse(null);
    } else {
      navigate('/voiceReport', {
        state: {
          date: formattedDate,
          isQuick: true,
          questionScores,
          sessionId, startTime
        }
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-white py-4 px-6 border-b">
        <h1 className="text-xl font-semibold text-[#111920]">
          Voice Disorder Assessment
        </h1>
      </header>

      <main className="flex-1 p-5">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-lg mb-4">
              Assessment <span className="font-bold">{exerciseCount}</span> out of <span className="font-bold">3</span>
            </p>

            <div className="flex items-center gap-4">
              <LinearProgress value={percentageCompleted} />
              <span className="text-sm font-medium">{(percentageCompleted * 100).toFixed(1)}%</span>
            </div>
          </div>

          {exerciseData && (
            <div className="border border-[#0CC8E8] rounded-2xl p-5 flex justify-center mb-8 mx-auto w-1/2">
              <video
                className="w-full h-auto"
                controls
                autoPlay
                src={`${IMAGE_BASE_URL}${exerciseData[exerciseCount - 1]?.VideoUrl}`}
                onEnded={() => setRecordingStatus('idle')}
              />
            </div>
          )}

          <div className="mb-8">
            <p className="text-lg mb-2">Say this...</p>
            <p className="text-xl font-semibold">
              {exerciseData?.[exerciseCount - 1]?.WordText || 'Loading...'}
            </p>
          </div>

          {/* {voiceResponse?.predictions && (
            <div className="p-4 rounded-lg mb-8 bg-green-100">
              <p className="text-lg font-semibold">
                Score: {voiceResponse.predictions.Normal}
              </p>
            </div>
          )} */}

          {recordingStatus !== 'stop' && recordingStatus !== 'result' && (
            <div className="flex items-center justify-center gap-4 border-t pt-4 mt-8">
              <LoaderWave isAnimation={recordingStatus === 'recording'} isDark={true} />

              <button
                onClick={() => recordingStatus === 'idle' ? onStartRecord() : onStopRecord()}
                className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full"
              >
                {recordingStatus === 'recording' ? (
                  <div className="w-5 h-5 bg-black rounded-sm" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {recordingStatus === 'result' && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex justify-between w-full gap-4">
                {exerciseCount !== 1 && (
                  <PrevButton
                    onPress={() => {
                      setRecordingStatus('idle');
                      setExerciseCount(prev => prev - 1);
                      setVoiceResponse(null);
                    }}
                    title="Previous"
                  />
                )}
                <NextButton
                  onPress={handleNextExercise}
                  title={exerciseCount < 3 ? "Next" : "Finish"}
                />
              </div>
              <EndButton
                onPress={() => navigate('/voiceReport', {
                  state: {
                    date: formattedDate,
                    questionScores,
                    sessionId,
                    startTime,
                    totalQuestions: 3
                  }
                })}
                title="End Now"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VoiceDisorderPage;