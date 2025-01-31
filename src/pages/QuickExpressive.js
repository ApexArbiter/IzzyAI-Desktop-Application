import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { useDataContext } from '../contexts/DataContext';
import { getQuickExpressiveQuestions, getToken } from "../utils/functions";
import CustomHeader from '../components/CustomHeader';
import Loader from '../components/Loader';
import LogoQuestionView from '../components/LogoQuestionView';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';

// Button Components with styling matching React Native version
const EndButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-[42%] rounded-full bg-red-500 py-3 px-4 h-12 flex items-center justify-center"
  >
    <span className="text-white font-semibold">{title}</span>
  </button>
);

const NextButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-[42%] rounded-full bg-[#71D860] py-3 px-4 h-12 flex items-center justify-center"
  >
    <span className="text-slate-900 font-semibold">{title}</span>
  </button>
);

const PrevButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-[42%] rounded-full border border-slate-900 py-3 px-4 h-12 flex items-center justify-center"
  >
    <span className="text-slate-900 font-semibold">{title}</span>
  </button>
);

function QuickExpressive() {
  const navigate = useNavigate();
  const { sessionId } = useLocation().state || {};
  const { setExpressiveReport } = useDataContext();
  const userId = localStorage.getItem('userId');

  // State management matching React Native version
  const [startTime, setStartTime] = useState('');
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [questionResponse, setQuestionResponse] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [correctQuestions, setCorrectQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Initialize start time
  useEffect(() => {
    const currentStartTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    setStartTime(currentStartTime);
  }, []);

  // Handle back button - using browser history instead of Android back handler
  useEffect(() => {
    const handlePopState = () => {
      navigate(-1);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch questions
  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        const response = await getQuickExpressiveQuestions(userId);
        if (response) {
          setQuestions(response);
        }
      } catch (error) {
        console.error('Network request failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, []);

  // Navigation function
  const navigateTo = () => {
    setExpressiveReport(incorrectQuestions);
    navigate('/result-expressive-language', {
      state: {
        sessionId,
        startTime,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: incorrectQuestions?.length,
        incorrectQuestions,
        isExpressive: true,
        totalQuestions: questions?.length,
        isQuick: true
      }
    });
  };

  // Audio recording functions adapted for web
  const onStartRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudio(audioBlob);

        // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingStatus('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingStatus('idle');
    }
  };
  const onStopRecord = () => {
    try {
      setRecordingStatus('loading');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();

        // Request data from the MediaRecorder
        mediaRecorderRef.current.requestData();
      } else {
        // If there's no active recording, reset the status
        setRecordingStatus('idle');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordingStatus('idle');
    }
  };

  // Answer handling functions
  const onCorrectAnswer = (ques) => {
    setQuestionResponse('Correct!');
    setCorrectAnswersCount(prevCount => prevCount + 1);
    if (!correctQuestions.includes(ques + questionCount)) {
      setCorrectQuestions(prevQuestions => [
        ...prevQuestions,
        ques + questionCount,
      ]);
    }
    if (incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
      setIncorrectQuestions(prevQuestions =>
        prevQuestions.filter(q => q?.questiontext !== ques + questionCount),
      );
    }
    setRecordingStatus("stop");
  };

  const onWrongAnswer = (ques) => {
    if (!incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
      setIncorrectQuestions(prevQuestions => [
        ...prevQuestions,
        { ...questions?.[questionCount - 1], questiontext: ques + ques + questionCount },
      ]);
    }
    if (correctQuestions.includes(ques + ques + questionCount)) {
      setCorrectAnswersCount(prevCount => prevCount - 1);
      setCorrectQuestions(prevQuestions =>
        prevQuestions.filter(q => q !== ques + questionCount),
      );
    }
    setQuestionResponse('Incorrect!');
  };

  const sendAudio = async (audioBlob) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('audio', audioBlob, 'sound.wav');

    try {
      setLoading(true)
      const response = await fetch(`${BaseURL}/api/voice_to_text`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          Authorization: "Bearer " + token
        },
        // Remove Content-Type header to let the browser set it with the boundary
      });
      console.log(response)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      const data = JSON.parse(result);
      console.log(data);

      const answers = questions?.[questionCount - 1]?.answers?.split(";");
      const isMatched = answers?.find((item) =>
        item?.trim()?.toLowerCase() === data?.transcription?.toLowerCase() + "."
      );

      if (isMatched) {
        onCorrectAnswer(questions?.[questionCount - 1]?.question);
      } else {
        onWrongAnswer(questions?.[questionCount - 1]?.question);
      }
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setRecordingStatus("stop");
      setLoading(false)
    }
  };

  const percentageCompleted = ((questionCount) / questions?.length) * 100;


  return (

    <div className="min-h-screen flex flex-col bg-white">
      <CustomHeader
        title="Quick Expressive Language Disorder Assessment"
        goBack={() => navigate(-1)}
      />

      <div className="flex-1 px-5">
        <div className="max-w-6xl mx-auto w-full pb-8">
          <div className="mt-8">
            <p className="text-lg text-slate-900">
              Question{' '}
              <span className="font-bold">
                {questionCount > questions?.length ? questions?.length : questionCount}{' '}
              </span>
              out of
              <span className="font-bold"> {questions?.length}</span>
            </p>

            {percentageCompleted.toString() !== "Infinity" && (
              <div className="flex items-center mt-3">
                {(questionCount > 0 && questions?.length > 0) && (
                  <LinearProgress
                    className="flex-1 rounded-full h-2"
                    value={percentageCompleted / 100}
                    variant="determinate"
                    color="primary"
                  />
                )}
                <span className="ml-4 text-sm font-medium">
                  {percentageCompleted > 0 ? percentageCompleted.toFixed(1) : 0}%
                </span>
              </div>
            )}

            <div className="border border-cyan-500 rounded-2xl flex justify-center items-center mt-5 px-5">
              {questions?.[questionCount - 1] && (
                <img
                  className="my-5 w-52 h-52 object-contain"
                  src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_label}`}
                  alt="Question"
                />
              )}
            </div>

            {questions?.[questionCount - 1] && (
              <LogoQuestionView
                first_text="Answer this..."
                second_text={questions[questionCount - 1]?.question}
              />
            )}

            {recordingStatus === 'stop' && questionResponse && (
              <LogoQuestionView
                second_text={null}
                first_text={questionResponse}
                questionResponse={questionResponse}
              />
            )}

            <Loader loading={recordingStatus === 'loading'} />

            {/* Recording UI */}
            {recordingStatus !== 'stop' && (
              <div className="flex items-center justify-center gap-4 mt-5 border-t border-gray-200 pt-4">
                <div className="w-3/4 h-12 flex items-center justify-center">
                  <div className={`h-2 w-full bg-gray-200 rounded-full ${recordingStatus === 'recording' ? 'animate-pulse' : ''
                    }`} />
                </div>

                <button
                  onClick={() => {
                    if (recordingStatus === 'idle') {
                      onStartRecord();
                    } else {
                      onStopRecord();
                    }
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full"
                >
                  {recordingStatus === 'recording' ? (
                    <div className="w-5 h-5 bg-black" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            {recordingStatus === 'stop' && (
              <div className="flex justify-between items-center mt-5 gap-3">
                {questionCount !== 1 && (
                  <PrevButton
                    onPress={() => {
                      setRecordingStatus('idle');
                      setQuestionResponse('');
                      if (questionCount >= 1) {
                        setQuestionCount(prev => prev - 1);
                      }
                    }}
                    title="Previous"
                  />
                )}

                {questionCount < questions?.length && (
                  <NextButton
                    onPress={() => {
                      setRecordingStatus('idle');
                      setQuestionResponse('');
                      if (questionCount < questions?.length) {
                        setQuestionCount(prev => prev + 1);
                      } else {
                        navigateTo();
                      }
                    }}
                    title="Next"
                  />
                )}

                <EndButton
                  onPress={() => navigateTo()}
                  title={questionCount < questions?.length ? "End Now" : "Finish"}
                />
              </div>
            )}
            <Loader loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickExpressive;