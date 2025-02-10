import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ReactMic } from 'react-mic';
import { LinearProgress } from '@mui/material';
import { useDataContext } from '../contexts/DataContext';
import { getExpressiveQuestions, evaluateExpressiveQuestion, getToken, authenticateFace } from "../utils/functions";
import CustomHeader from '../components/CustomHeader';
import VideoPlayer from '../components/VideoPlayer';
import Loader from '../components/Loader';
import LogoQuestionView from '../components/LogoQuestionView';
import WaveIcon from '../assets/Wave'; // Make sure to convert your WaveSVG to React component
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import { motion } from 'framer-motion';
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
    className="w-[42%] rounded-full bg-red-500 py-3 px-4 h-12 flex items-center justify-center transition-all hover:bg-red-600 active:bg-red-700"
  >
    <span className="text-white font-semibold">{title}</span>
  </button>
);

const NextButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-[42%] rounded-full bg-green-400 py-3 px-4 h-12 flex items-center justify-center transition-all hover:bg-green-500 active:bg-green-600"
  >
    <span className="text-slate-900 font-semibold">{title}</span>
  </button>
);

const PrevButton = ({ onPress, title }) => (
  <button
    onClick={onPress}
    className="w-[42%] rounded-full border border-slate-900 py-3 px-4 h-12 flex items-center justify-center transition-all hover:bg-slate-50 active:bg-slate-100"
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

function ExpressiveAssessment() {
  const location = useLocation();
  const { sessionId, isAll } = location.state || {};
  // console.log(location.state)
  const navigate = useNavigate();
  const { setExpressiveReport } = useDataContext();
  const webcamRef = useRef(null);
  const videoRef = useRef(null);

  // // Get params from router state or localStorage
  // const sessionId = localStorage.getItem("sessionId");
  // const isAll = localStorage.getItem("isAll") === "true";

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
  const [disableRecordingButton, setDisableRecordingButton] = useState(false);
  const [correctExpressions, setCorrectExpressions] = useState([]);
  const [expressionsArray, setExpressionsArray] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(false);
  let question = [];
  const [expression, setExpression] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [isVideoEnd, setIsVideoEnd] = useState(false);
  const [categorywiseReport, setCategoryWiseReport] = useState({
    category1: 0,
    category2: 0,
    category3: 0,
    category4: 0
  });

  // Get user details from localStorage
  const userId = localStorage.getItem("userId");
  const userDetail = JSON.parse(localStorage.getItem("userDetails"));

  useEffect(() => {
    const currentStartTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setStartTime(currentStartTime);


    // Add beforeunload event listener
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  useEffect(() => {
    if (questions.length > 0) {
      console.log("Questions state updated:", questions);
    }
  }, [questions]);

  const fetchQuestionData = async () => {
    try {
      setIsLoading(true);
      const response = await getExpressiveQuestions(userId, userDetail?.AvatarID);
      if (response) {
        console.log("Questions from response", response?.[questionCount - 1]?.question);
        question = response;
        setQuestions(response);
      }
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchQuestionData
  useEffect(() => {
    fetchQuestionData();
  }, []);
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
        categorywiseReport,
        expressionsArray,
        correctExpressions,
        incorrectExpressions
      }
    });
  };

  const onStartRecord = async () => {
    try {
      setRecordingStatus('recording');
      setIsStopButtonDisabled(true);
      if (!webcamRef.current) {
        console.error('Webcam reference not available');
        setRecordingStatus('idle');
        return;
      }
      setTimeout(() => {
        setIsStopButtonDisabled(false);
      }, 5000);
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
        console.error('No image captured');
        return;
      }

      // // Convert base64 to blob and create a File object
      // const blob = await fetch(imageSrc).then(r => r.blob());
      // console.log("blob",blob)
      // setSnapshot(blob);
      // console.log("",snapshot)



      setDisableRecordingButton(false);

    } catch (error) {
      console.error('Error capturing image:', error);
      setRecordingStatus('idle');
    }
  };

  const processImage = async () => {
    if (!webcamRef.current) {
      console.error('Webcam reference not available');
      setRecordingStatus('idle');
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      console.error('No image captured');
      return;
    }

    // Convert base64 to blob and create a File object
    const blob = await fetch(imageSrc).then(r => r.blob());

    const file = new File([blob], 'webcam-snapshot.jpg', { type: 'image/jpeg' });

    console.log(file)
    console.log("snapshot", snapshot)
    return file
  }

  const onStopRecord = async () => {
    setRecordingStatus('loading');
    // Stop recording will trigger ReactMic's onStop callback
  };

  const evaluateQuestion = async (transcription) => {
    const file = await processImage()
    console.log(file)

    const formData = new FormData();
    formData.append('image', file, 'webcam-snapshot.jpg');
    formData.append('transcription', transcription);
    formData.append('answers', questions?.[questionCount - 1]?.answers);
    formData.append('expected_expression', questions?.[questionCount - 1]?.expression);

    try {
      const response = await evaluateExpressiveQuestion(formData);
      console.log(response)

      // let response2 =  await authenticateFace(userDetail?.UserID, file);
      // console.log(response2)
      setRecordingStatus("stop");

      if (response?.expression) {
        setExpression(response.expression);
        return response.expression;
      }
    } catch (error) {
      console.error('Error evaluating question:', error);
    }

    return null;
  };

  const handleAudioStop = async (recordedBlob) => {
    // if (!snapshot) {
    //   console.error('No snapshot available');
    //   return;
    // }

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('audio', recordedBlob.blob, 'sound.wav');

      const response = await fetch(`${BaseURL}/api/voice_to_text`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const result = await response.text();
      const data = JSON.parse(result);

      const answers = questions[questionCount - 1]?.answers?.split(";");
      const detectedExpression = await evaluateQuestion(data?.transcription);

      setExpressionsArray(prev => [...prev, detectedExpression]);

      // Handle expression evaluation
      if (detectedExpression?.toLowerCase() === questions[questionCount - 1]?.expression?.toLowerCase()) {
        onCorrectExpression(questions[questionCount - 1]?.question, detectedExpression);
      } else {
        onWrongExpression(questions[questionCount - 1]?.question, detectedExpression);
      }

      // Handle answer evaluation
      const isMatched = answers?.find(item =>
        item?.trim()?.toLowerCase() === data?.transcription?.toLowerCase() + "."
      );

      if (isMatched) {
        onCorrectAnswer(question[questionCount - 1]?.question);
      } else {
        console.log("Question", question)
        console.log("Questions", questions)
        console.log("Wrong answer", questions?.[questionCount - 1]?.question)

        onWrongAnswer(question?.[questionCount - 1]?.question);
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      setRecordingStatus('idle');
    }
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
    setRecordingStatus("stop");
  };

  const onWrongAnswer = (ques) => {
    console.log("onWrongAnswer:",ques)
    if (!incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
      setIncorrectQuestions(prevQuestions => [
        ...prevQuestions,
        { ...question?.[questionCount - 1], questiontext: ques + ques + questionCount },
      ]);
    }
    if (correctQuestions.includes(ques + ques + questionCount)) {
      setCorrectAnswersCount(prevCount => prevCount - 1);
      setCorrectQuestions(prevQuestions =>
        prevQuestions.filter(q => q !== ques + questionCount),
      );
    }

    setQuestionResponse('Incorrect!');

    let obj = { ...categorywiseReport }
    if (questionCount > 0 && questionCount <= 10) obj.category1 = obj.category1 + 1
    else if (questionCount > 10 && questionCount <= 18) obj.category2 = obj.category2 + 1
    setCategoryWiseReport(obj)
  }

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
    if (correctExpressions.includes(question + exp)) {
      setCorrectExpressions(prev =>
        prev.filter(q => q !== (question + exp + questionCount))
      );
    }
  };

  const endAssessment = () => {
    setExpressiveReport(incorrectQuestions);
    navigateTo();
  };

  const percentageCompleted = ((questionCount) / questions?.length) * 100;

  return (
    <div className="bg-gray-100 mb-0 overflow-hidden min-h-screen">
    <CustomHeader
      title="Expressive Language Disorder"
      goBack={() => navigate(-1)}
    />

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
            Question{' '}
            <span className="font-bold">
              {questionCount > questions?.length ? questions?.length : questionCount}{' '}
            </span>
            out of
            <span className="font-bold"> {questions?.length}</span>
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
              {percentageCompleted > 0 ? percentageCompleted.toFixed(1) : 0}%
            </span>
          </div>

          {/* Question Image and Video */}
          {questions?.[questionCount - 1] && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="flex justify-center mb-6"
            >
              <div className="flex gap-4">
                <div className="px-6 py-3 border border-sky-400 rounded-xl">
                  <img
                    className="w-48 h-48 rounded-lg shadow-lg object-cover"
                    src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_label}`}
                    alt="Question"
                  />
                </div>
                <div className="w-48 h-48 ">
                  <VideoPlayer
                    source={`${IMAGE_BASE_URL}${questions?.[questionCount - 1]?.avatar_assessment}`}
                    onEnd={() => setIsVideoEnd(true)}
                    onStart={() => setIsVideoEnd(false)}
                    ref={videoRef}
                    videoHeight={192}
                    className="rounded-xl shadow-lg object-cover mt-6 "
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-center items-center">
            <div className="w-48">
              {/* Question Text */}
              <div className="flex justify-start">
                <LogoQuestionView
                  first_text="Answer this..."
                  second_text={questions?.[questionCount - 1]?.question}
                />
              </div>
            </div>

            {/* Response and Expression */}
            <div className="flex flex-col gap-2 justify-center items-center p-3 w-56 h-20">
              {recordingStatus === 'stop' && questionResponse && (
                <LogoQuestionView
                  second_text={null}
                  first_text={questionResponse}
                  questionResponse={questionResponse}
                />
              )}
              {recordingStatus === 'stop' && expression && (
                <p className="text-center">
                  Facial Expression: {expression}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-center items-center gap-4 mt-7">
            {/* Camera View */}
            <div className="">
              <div className="rounded-2xl overflow-hidden flex justify-center">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "user",
                    width: 192,
                    height: 192
                  }}
                  className="rounded-2xl shadow-lg"
                />
              </div>
            </div>

            {/* Recording and Navigation Controls */}
            <div className="w-48">
              <ReactMic
                record={recordingStatus === 'recording'}
                className="sr-only"
                onStop={handleAudioStop}
                strokeColor="#000000"
                backgroundColor="#FF4081"
              />

              {/* Record Button */}
              {recordingStatus === 'idle' && isVideoEnd && (
                <button
                  onClick={onStartRecord}
                  className="w-full rounded-full bg-slate-900 py-2 px-3 h-10 flex items-center justify-center mt-16 mb-4 transition-all hover:bg-slate-800 active:bg-slate-700"
                >
                  <span className="text-white font-semibold flex items-center gap-2 text-sm">
                    <span className="text-red-500">●</span> Record
                  </span>
                </button>
              )}

              {/* Recording Wave Button */}
              {recordingStatus === 'recording' && (
                <div className="border-2 border-red-500 mb-4 p-1 rounded-full mt-16">
                  <button
                    disabled={isStopButtonDisabled}
                    onClick={onStopRecord}
                    className="w-full rounded-full bg-red-500 py-2 px-3 h-10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 active:bg-red-700"
                  >
                    <WaveIcon />
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              {recordingStatus === 'stop' && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {questionCount !== 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setRecordingStatus('idle');
                          setExpression(null);
                          setQuestionResponse('');
                          if (questionCount >= 1) {
                            setIsVideoEnd(false);
                            if (videoRef.current) {
                              videoRef.current.stop();
                              videoRef.current.seek(0.1);
                              videoRef.current.resume();
                            }
                            setQuestionCount(prev => prev - 1);
                          }
                        }}
                        className="flex-1 border border-gray-300 hover:bg-gray-50 rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                      >
                        Previous
                      </motion.button>
                    )}

                    {questionCount < questions?.length && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setRecordingStatus('idle');
                          setExpression(null);
                          setQuestionResponse('');
                          if (questionCount < questions?.length) {
                            setIsVideoEnd(false);
                            if (videoRef.current) {
                              videoRef.current.stop();
                              videoRef.current.seek(0.1);
                              videoRef.current.resume();
                            }
                            setQuestionCount(prev => prev + 1);
                          } else {
                            navigateTo();
                          }
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                      >
                        Next
                      </motion.button>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={endAssessment}
                    className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-2 px-4 font-semibold transition-colors flex items-center justify-center"
                  >
                    {questionCount < questions?.length ? "End Now" : "Finish"}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          <Loader loading={isLoading || recordingStatus === 'loading'} />
        </main>
      </div>
    </div>
  </div>
  );
};

export default ExpressiveAssessment;