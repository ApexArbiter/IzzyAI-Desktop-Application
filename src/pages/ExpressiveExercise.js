import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ReactMic } from 'react-mic';
import { Camera } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import Loader from '../components/Loader';
import LogoQuestionView from '../components/LogoQuestionView';
import WaveIcon from '../assets/Wave';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import { getExpressiveExerciseQuestions, detectExpression, matchExpressiveAnswer, getExpressiveAllExerciseQuestions, authenticateFace } from "../utils/functions";

// Button Components
const RecordButton = ({ onPress, title, disabled }) => (
  <button
    onClick={onPress}
    disabled={disabled}
    className={`w-full rounded-full bg-slate-900 py-3 px-4 h-12 flex items-center justify-center mt-5 mb-[10%] transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 active:bg-slate-700'}`}
  >
    <span className="text-white font-semibold flex items-center gap-2">
      <span className="text-red-500">●</span> {title}
    </span>
  </button>
);

const EndButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-full rounded-full bg-red-500 py-3 px-4 h-12 flex items-center justify-center transition-all hover:bg-red-600 active:bg-red-700"
  >
    <span className="text-white font-semibold">{title}</span>
  </button>
);

const NextButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-full rounded-full bg-green-400 py-3 px-4 h-12 flex items-center justify-center transition-all hover:bg-green-500 active:bg-green-600"
  >
    <span className="text-slate-900 font-semibold">{title}</span>
  </button>
);

const PlayButton = ({ onPress, disabled }) => (
  <div className="border-2 border-red-500 mb-[10%] p-1 rounded-full mt-5">
    <button
      disabled={disabled}
      onClick={onPress}
      className={`w-full rounded-full bg-red-500 py-3 px-4 h-12 flex items-center justify-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600 active:bg-red-700'}`}
    >
      <WaveIcon />
    </button>
  </div>
);

const ExpressiveExercise = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const videoRef = useRef(null);

  // Get params from localStorage
  const sessionId = localStorage.getItem("sessionId");
  const isAll = localStorage.getItem("isAll") === "true";
  const userId = localStorage.getItem("userId");
  const userDetail = JSON.parse(localStorage.getItem("userDetails"));

  // State management
  const [startTime, setStartTime] = useState('');
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [questionResponse, setQuestionResponse] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [correctQuestions, setCorrectQuestions] = useState([]);
  const [incorrectExpressions, setIncorrectExpressions] = useState([]);
  const [correctExpressions, setCorrectExpressions] = useState([]);
  const [expressionsArray, setExpressionsArray] = useState([]);
  const [questionExpressions, setQuestionExpressions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [expression, setExpression] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [disableRecordingButton, setDisableRecordingButton] = useState(false);
  const [isWrongAnswer, setInWrongAnswer] = useState(false);
  const [wrongWord, setWrongWord] = useState(null);
  const [answerCount, setAnswerCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [isDelay, setIsDelay] = useState(false);
  const [isVideoEnd, setIsVideoEnd] = useState(false);
  const [isNextAnswer, setIsNextAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const currentStartTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setStartTime(currentStartTime);
    fetchQuestionData();

    // Cleanup function
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const fetchQuestionData = async () => {
    try {
      setIsLoading(true);
      const response = isAll
        ? await getExpressiveAllExerciseQuestions(userId, userDetail?.AvatarID)
        : await getExpressiveAllExerciseQuestions(userId, userDetail?.AvatarID);
      if (response) {
        console.log(response)
        setQuestions(response);
      }
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = () => {
    navigate('/resultExpressiveLanguage', {
      state: {
        sessionId,
        startTime,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: incorrectQuestions?.length,
        incorrectQuestions,
        isExpressive: true,
        totalQuestions: questions?.length,
        isExercise: true,
        expressionsArray,
        incorrectExpressions,
        correctExpressions
      }
    });
  };

  const getCurrentAnswer = () => {
    let answers = questions?.[questionCount - 1]?.answers?.split(";");
    return answers?.[answerCount]?.trim();
  };

  const captureSnapshot = async () => {
    if (!webcamRef.current) {
      console.error('Webcam not initialized');
      return null;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      console.error('Failed to capture snapshot');
      return null;
    }

    try {
      const blob = await fetch(imageSrc).then(res => res.blob());
      return new File([blob], 'snapshot.jpg', { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error converting snapshot:', error);
      return null;
    }
  };



  // Add the audio stop handler
  // Add logging to debug video URL
  useEffect(() => {
    const videoPath = questions?.[questionCount - 1]?.avatar_exercise?.split(",")?.[answerCount]?.trim();
    console.log('Video path:', videoPath);
    if (!videoPath) {
      console.error('Invalid video path for question:', questionCount - 1, 'answer:', answerCount);
    }
  }, [questionCount, answerCount, questions]);

  // Add this state to manage the ReactMic component

  // Modify the recording section


  // Modify onStartRecord to include the recording state
  const onStartRecord = async () => {
    try {
      setRecordingStatus('recording');
      setIsRecording(true);
      setDisableRecordingButton(true);

      // Take initial snapshot
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        console.error('No image captured');
        return;
      }

      // Convert base64 to blob for later use
      const blob = await fetch(imageSrc).then(r => r.blob());
      setSnapshot(new File([blob], 'snapshot.jpg', { type: 'image/jpeg' }));

      setDisableRecordingButton(false);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingStatus('idle');
      setIsRecording(false);
    }
  };




  // Add error handling to handleAudioStop
  // const handleAudioStop = async (recordedBlob) => {
  //   console.log("HandleAudioStop")
  //   try {
  //     if (!recordedBlob || !recordedBlob.blob) {
  //       console.error('No audio recorded');
  //       setRecordingStatus('idle');
  //       return;
  //     }

  //     setRecordingStatus('loading');

  //     // Prepare form data for audio
  //     const formData = new FormData();
  //     formData.append('audio', recordedBlob.blob, 'recording.wav');

  //     // Get the current answer
  //     const answer = getCurrentAnswer()?.replace(/\.$/, "")?.toLowerCase();
  //     if (!answer) {
  //       console.error('No answer available');
  //       setRecordingStatus('idle');
  //       return;
  //     }
  //     formData.append("answer", answer);

  //     // Send audio for transcription and matching
  //     const audioResponse = await matchExpressiveAnswer(formData);

  //     if (!snapshot) {
  //       console.error('No snapshot available');
  //       setRecordingStatus('idle');
  //       return;
  //     }

  //     // Process the snapshot for expression detection
  //     const expressionFormData = new FormData();
  //     expressionFormData.append('image', snapshot);
  //     const expressionResponse = await detectExpression(expressionFormData);

  //     // Update expression state
  //     const detectedExpression = expressionResponse?.expression;
  //     setExpression(detectedExpression);
  //     setQuestionExpressions(prev => [...prev, detectedExpression || ""]);

  //     // Handle recording count and validation
  //     setRecordCount(prevCount => {
  //       const newCount = prevCount + 1;
  //       const transcript = audioResponse?.transcription?.trim()?.toLowerCase();
  //       const incorrectWord = audioResponse?.first_incorrect_word?.trim()?.toLowerCase();

  //       if (newCount === 3) {
  //         if (questions?.[questionCount - 1]?.answers?.split(";")[answerCount + 1]) {
  //           handleNextAnswer(detectedExpression);
  //         } else {
  //           handleFinalAttempt(detectedExpression);
  //         }
  //         return 0;
  //       }

  //       // Handle attempt result
  //       if (incorrectWord === transcript || transcript === null || incorrectWord?.toLowerCase() === 'none') {
  //         handleCorrectAttempt(detectedExpression);
  //       } else {
  //         handleIncorrectAttempt(incorrectWord, detectedExpression);
  //       }

  //       return newCount;
  //     });
  //   } catch (error) {
  //     console.error('Error processing recording:', error);
  //     setRecordingStatus('idle');
  //   }
  // };

  const onStopRecord = () => {
    setIsRecording(false);
    setRecordingStatus('loading');
  };

  // Update handleAudioStop to be more robust
  const handleAudioStop = async (recordedBlob) => {
    console.log("HandleAudioStop");
    try {
      if (!recordedBlob?.blob) {
        console.error('No audio recorded');
        setRecordingStatus('idle');
        return;
      }

      // Additional logging to debug
      console.log('Recorded blob:', recordedBlob);

      // Prepare form data for audio
      const formData = new FormData();
      formData.append('audio', recordedBlob.blob, 'recording.wav');

      // Get the current answer
      const answer = getCurrentAnswer()?.replace(/\.$/, "")?.toLowerCase();
      if (!answer) {
        console.error('No answer available');
        setRecordingStatus('idle');
        return;
      }
      formData.append("answer", answer);

      // Send audio for transcription and matching
      const audioResponse = await matchExpressiveAnswer(formData);

      if (!snapshot) {
        console.error('No snapshot available');
        setRecordingStatus('idle');
        return;
      }

      // Process the snapshot for expression detection
      const expressionFormData = new FormData();
      expressionFormData.append('image', snapshot);
      const expressionResponse = await detectExpression(expressionFormData);

      // Update expression state
      const detectedExpression = expressionResponse?.expression;
      setExpression(detectedExpression);
      setQuestionExpressions(prev => [...prev, detectedExpression || ""]);

      // Handle recording count and validation
      setRecordCount(prevCount => {
        const newCount = prevCount + 1;
        const transcript = audioResponse?.transcription?.trim()?.toLowerCase();
        const incorrectWord = audioResponse?.first_incorrect_word?.trim()?.toLowerCase();

        if (newCount === 3) {
          if (questions?.[questionCount - 1]?.answers?.split(";")[answerCount + 1]) {
            handleNextAnswer(detectedExpression);
          } else {
            handleFinalAttempt(detectedExpression);
          }
          return 0;
        }

        // Handle attempt result
        if (incorrectWord === transcript || transcript === null || incorrectWord?.toLowerCase() === 'none') {
          handleCorrectAttempt(detectedExpression);
        } else {
          handleIncorrectAttempt(incorrectWord, detectedExpression);
        }

        return newCount;
      });
    } catch (error) {
      console.error('Error processing recording:', error);
      setRecordingStatus('idle');
    }
  };

  const handleNextAnswer = (expression) => {
    setAnswerCount(prev => prev + 1);
    setIsDelay(true);
    setIsNextAnswer(true);
    setTimeout(() => {
      resetForNextAnswer();
    }, 2000);
  };

  const handleFinalAttempt = (expression) => {
    setRecordingStatus("stop");
    if (consecutiveCorrect > (questions?.[questionCount - 1]?.answers?.split(";")?.length / 2)) {
      onCorrectExpression(questions?.[questionCount - 1]?.question, expression);
      onCorrectAnswer(questions?.[questionCount - 1]?.question);
    } else {
      onWrongAnswer(questions?.[questionCount - 1]?.question);
      onWrongExpression(questions?.[questionCount - 1]?.question, expression);
    }
  };

  const handleCorrectAttempt = (expression) => {
    setConsecutiveCorrect(prev => prev + 1);
    setIsDelay(true);
    setTimeout(() => {
      resetForNextAttempt();
    }, 2000);
  };

  const handleIncorrectAttempt = (incorrectWord, expression) => {
    setInWrongAnswer(true);
    setWrongWord(incorrectWord);
    setIsDelay(true);
    setTimeout(() => {
      resetForNextAttempt();
    }, 2000);
  };

  const resetForNextAnswer = () => {
    setIsDelay(false);
    setExpression(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setRecordingStatus("idle");
    setIsNextAnswer(false);
    setRecordCount(0);
    setIsVideoEnd(false);
  };

  const resetForNextAttempt = () => {
    setIsDelay(false);
    setExpression(null);
    setRecordingStatus("idle");
    setIsVideoEnd(false);
  };

  const onCorrectAnswer = (question) => {
    setQuestionResponse('Correct!');
    setCorrectAnswersCount(prev => prev + 1);
    if (!correctQuestions.includes(question + questionCount)) {
      setCorrectQuestions(prev => [...prev, question + questionCount]);
    }
    if (incorrectQuestions.some(q => q?.questiontext === question + questionCount)) {
      setIncorrectQuestions(prev =>
        prev.filter(q => q?.questiontext !== question + questionCount)
      );
    }
  };

  const onWrongAnswer = (question) => {
    if (!incorrectQuestions.some(q => q?.questiontext === question + questionCount)) {
      setIncorrectQuestions(prev => [
        ...prev,
        { ...questions[questionCount - 1], questiontext: question + questionCount },
      ]);
    }
    if (correctQuestions.includes(question + questionCount)) {
      setCorrectAnswersCount(prev => prev - 1);
      setCorrectQuestions(prev =>
        prev.filter(q => q !== question + questionCount)
      );
    }
    setQuestionResponse('Incorrect!');
  };

  const onCorrectExpression = (question, exp) => {
    if (!correctExpressions.includes(question + exp + questionCount)) {
      setCorrectExpressions(prev => [...prev, question + exp + questionCount]);
    }
    if (incorrectExpressions.some(q => q === question + exp + questionCount)) {
      setIncorrectExpressions(prev =>
        prev.filter(q => q !== question + exp + questionCount)
      );
    }
  };

  const onWrongExpression = (question, exp) => {
    if (!incorrectExpressions.includes(question + exp + questionCount)) {
      setIncorrectExpressions(prev => [...prev, question + exp + questionCount]);
    }
    if (correctExpressions.includes(question + exp + questionCount)) {
      setCorrectExpressions(prev =>
        prev.filter(q => q !== question + exp + questionCount)
      );
    }
  };

  const percentageCompleted = ((questionCount) / questions?.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 px-5">
        <div className="max-w-6xl mx-auto w-full pb-8">
          <p className="text-center mt-4 text-slate-900 text-sm">
            Place your face in the middle of the camera frame while speaking
          </p>

          <div className="mt-5">
            <p className="text-lg text-slate-900">
              Exercise{' '}
              <span className="font-bold">
                {questionCount > questions?.length ? questions?.length : questionCount}{' '}
              </span>
              out of
              <span className="font-bold"> {questions?.length}</span>
            </p>
          </div>

          {percentageCompleted.toString() !== "Infinity" && (
            <div className="flex items-center mt-3">
              {(questionCount > 0 && questions?.length > 0) && (
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentageCompleted}%` }}
                  />
                </div>
              )}
              <span className="ml-4 text-sm font-medium text-slate-900">
                {percentageCompleted > 0 ? percentageCompleted.toFixed(1) : 0}%
              </span>
            </div>
          )}

          <div className="border border-cyan-500 rounded-2xl p-5 mt-5">
            {questions?.[questionCount - 1] && (
              <img
                className="w-56 h-56 object-contain mx-auto"
                src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_label}`}
                alt="Question"
              />
            )}
          </div>

          <div className="flex justify-between mt-5">
            <span className="text-sm text-slate-900">Attempt: {recordCount}</span>
            <span className="text-sm text-slate-900">Answer Count: {answerCount + 1}</span>
          </div>

          {questions?.[questionCount - 1] && (
            <div className="mt-5">
              {isWrongAnswer && wrongWord ? (
                <LogoQuestionView
                  first_text="Say the sentence again."
                  second_text={getCurrentAnswer()}
                />
              ) : (
                <LogoQuestionView
                  first_text={questions[questionCount - 1]?.question}
                  second_text={getCurrentAnswer()}
                />
              )}
            </div>
          )}

          {recordingStatus !== 'stop' && (
            <VideoPlayer
              ref={videoRef}
              onEnd={() => setIsVideoEnd(true)}
              onStart={() => setIsVideoEnd(false)}
              source={`${IMAGE_BASE_URL}/${questions?.[questionCount - 1]?.avatar_exercise?.split(",")?.[answerCount]?.trim()}`}
            />
          )}

          {isDelay && (
            <p className="text-center mt-20 text-slate-900">
              {isNextAnswer ? "Please be ready for next answer" : "Please be ready for next attempt"}
            </p>
          )}

          {recordingStatus === 'stop' && questionResponse && (
            <LogoQuestionView
              second_text={null}
              first_text={questionResponse}
              questionResponse={questionResponse}
            />
          )}

          {expression !== null && (
            <p className="text-base text-center mt-3 font-semibold text-slate-900">
              Facial Expression: {expression}
            </p>
          )}

          <Loader loading={(recordingStatus === 'loading' || (recordingStatus === 'stop' && expression === null)) && !isDelay} />

          <div className="relative h-64 w-full mx-auto mt-5 rounded-2xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user"
              }}
            />
          </div>

          {recordingStatus === 'idle' && isVideoEnd && (
            <RecordButton
              onPress={() => {
                setRecordingStatus('recording');
                setDisableRecordingButton(true);
                onStartRecord();
              }}
              title="Record"
            />
          )}

          {recordingStatus === 'recording' && (
            <div className="relative">
              <PlayButton
                disabled={disableRecordingButton}
                onPress={onStopRecord}
              />
              <ReactMic
                record={isRecording}
                onStop={handleAudioStop}
                strokeColor="#000000"
                backgroundColor="#FF4444"
                className="hidden"
              />
            </div>
          )}

          {recordingStatus === 'stop' && (
            <div className="flex flex-col items-center mt-5 w-full gap-4">
              <div className="flex w-full gap-2">
                {questionCount < questions?.length && (
                  <NextButton
                    onPress={() => {
                      setRecordingStatus('idle');
                      setExpression(null);
                      setAnswerCount(0);
                      setConsecutiveCorrect(0);
                      setRecordCount(0);
                      setQuestionResponse('');
                      setQuestionExpressions([]);
                      setIsVideoEnd(false);
                      if (videoRef.current) {
                        videoRef.current.pause();
                        videoRef.current.currentTime = 0.1;
                        videoRef.current.play();
                      }
                      if (questionCount < questions?.length) {
                        setQuestionCount(prevCount => prevCount + 1);
                      } else {
                        navigateTo();
                      }
                    }}
                    title="Next Exercise"
                  />
                )}
              </div>
              <EndButton
                onPress={() => navigateTo()}
                title={questionCount < questions?.length ? "End Now" : "Finish"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpressiveExercise;