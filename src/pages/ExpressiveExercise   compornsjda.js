import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ReactMic } from 'react-mic';
import { LinearProgress } from '@mui/material';
import { useDataContext } from '../contexts/DataContext';
import { getExpressiveQuestions, evaluateExpressiveQuestion, getToken, authenticateFace, getExpressiveAllExerciseQuestions, getExpressiveExerciseQuestions } from "../utils/functions";
import CustomHeader from '../components/CustomHeader';
import VideoPlayer2 from '../components/VideoPlayer2';
import Loader from '../components/Loader';
import LogoQuestionView from '../components/LogoQuestionView';
import WaveIcon from '../assets/Wave'; // Make sure to convert your WaveSVG to React component
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';

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
  console.log(location.state)
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
  const [isComplete, setIsComplete] = useState(false);
  // Add these new states at the start of your component
  const [answerCount, setAnswerCount] = useState(1);  // Tracks which part of the answer we're on
  const [recordCount, setRecordCount] = useState(2);  // Tracks number of attempts
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0); // Tracks correct attempts
  const [isNextAnswer, setIsNextAnswer] = useState(false); // Indicates moving to next answer part
  const [isDelay, setIsDelay] = useState(false); // Controls delay between attempts
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
      const response = isAll
        ? await getExpressiveAllExerciseQuestions(userId, userDetail?.AvatarID)
        : await getExpressiveExerciseQuestions(userId, userDetail?.AvatarID);

      if (response && Array.isArray(response)) {
        console.log("Questions loaded:", response.length);
        setQuestions(response);
      } else {
        console.error("Invalid response format:", response);
      }
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Add this at the component level
  useEffect(() => {
    const resetAndPlayVideo = () => {
      if (videoRef.current) {
        videoRef.current.stop();
        videoRef.current.seek(0.1);
        setTimeout(() => {
          // Only restart video if we haven't reached max attempts
          if (recordCount < 3) {
            videoRef.current.resume();
            setIsVideoEnd(false);
          }
        }, 200);
      }
    };

    // Only reset and play video when in idle state and not at max attempts
    if (recordingStatus === 'idle' && !isDelay && recordCount < 3) {
      resetAndPlayVideo();
    }
  }, [recordingStatus, isDelay, recordCount]);

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
        isExercise: true, // Add this
        expressionsArray,
        incorrectExpressions,
        correctExpressions
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
      console.log('Sending data:', Object.fromEntries(formData));
      console.log("formData", formData);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await evaluateExpressiveQuestion(formData);
      console.log("Evaluate question", response)

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
      console.log("Answers", answers);
      const detectedExpression = await evaluateQuestion(data?.transcription);

      setExpressionsArray(prev => [...prev, detectedExpression]);

      // Modify the record count and attempt logic
      setRecordCount(prevCount => {
        const newCount = prevCount + 1;

        // Determine if we should move to the next answer part or question
        const shouldMoveToNextAnswerPart = newCount >= 3 && answerCount === 0;
        const shouldMoveToNextQuestion = newCount >= 3 && answerCount === 1;

        if (shouldMoveToNextAnswerPart) {
          // Move to second answer part
          setTimeout(() => {
            setAnswerCount(1);
            setRecordCount(1);
            setConsecutiveCorrect(0);
            setIsDelay(true);
            setIsNextAnswer(true);

            setTimeout(() => {
              setIsDelay(false);
              setExpression(null);
              setRecordingStatus('idle');
              setIsVideoEnd(false);

              if (videoRef.current) {
                videoRef.current.stop();
                videoRef.current.seek(0.1);
                videoRef.current.resume();
              }
            }, 2000);
          }, 0);
        } else if (shouldMoveToNextQuestion) {
          // Evaluate current question and move to next question
          setRecordingStatus('stop');
          setIsVideoEnd(true);

          if (videoRef.current) {
            videoRef.current.stop();
          }

          // Evaluate current question
          if (consecutiveCorrect > (answers?.length / 2)) {
            onCorrectExpression(questions[questionCount - 1]?.question, detectedExpression);
            onCorrectAnswer(questions[questionCount - 1]?.question);
          } else {
            onWrongAnswer(questions[questionCount - 1]?.question);
            onWrongExpression(questions[questionCount - 1]?.question, detectedExpression);
          }

          // Move to next question after delay
          setTimeout(() => {
            if (questionCount < questions.length) {
              // Reset all states for the next question
              setQuestionCount(prev => prev + 1);
              setAnswerCount(0);
              setRecordCount(0);
              setConsecutiveCorrect(0);
              setIsDelay(false);
              setExpression(null);
              setQuestionResponse('');
              setRecordingStatus('idle');
              setIsVideoEnd(false);
              setDisableRecordingButton(true);
            } else {
              // If all questions are complete, navigate to results
              navigateTo();
            }
          }, 2000);
        }

        return newCount;
      });

      // Handle matched answers
      const isMatched = answers?.find(item =>
        item?.trim()?.toLowerCase() === data?.transcription?.toLowerCase() + "."
      );

      if (isMatched) {
        setConsecutiveCorrect(prev => prev + 1);
      }

      // Reset for next attempt if not at max attempts
      if (recordCount < 3) {
        setIsDelay(true);
        setTimeout(() => {
          setIsDelay(false);
          setExpression(null);
          setRecordingStatus('idle');
          setIsVideoEnd(false);

          if (videoRef.current) {
            videoRef.current.stop();
            videoRef.current.seek(0.1);
            videoRef.current.resume();
          }
        }, 2000);
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      setRecordingStatus('idle');
    }
  };

  const getCurrentAnswer = () => {
    let answers = questions?.[questionCount - 1]?.answers?.split(";")
    return answers?.[answerCount]?.trim()
  }



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
    <div className="min-h-screen flex flex-col bg-white">
      <CustomHeader
        title="Expressive Language Disorder Excercise"
        goBack={() => navigate(-1)}
      />

      <div className="flex-1 px-5">
        <div className="max-w-6xl mx-auto w-full pb-8">
          <p className="text-center mt-4 text-slate-900 text-sm">
            Place your face in the middle of the camera frame while speaking
          </p>

          <div className="mt-5">
            <p className="text-lg text-slate-900">
              Excercise{' '}
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

          <div className="border border-cyan-500 rounded-2xl flex justify-center items-center mt-3 px-5">
            {questions?.[questionCount - 1] && (
              <img
                className="my-5 w-56 h-56 object-contain"
                src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_label}`}
                alt="Question"
              />
            )}
          </div>
          {/* Add this after the progress bar */}
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm font-medium text-slate-900">
              Attempt: {Math.min(recordCount, 3)}
            </p>
            <p className="text-sm font-medium text-slate-900">Answer Part: {answerCount + 1}</p>
          </div>

          {/* Add this to show the delay message */}
          {isDelay && (
            <p className="text-center mt-5 text-slate-900">
              {isNextAnswer ? "Please be ready for next answer part" : "Please be ready for next attempt"}
            </p>
          )}


          <div className="flex gap-5 mt-5 justify-center">
            <div className="flex align-center">
              {questions?.[questionCount - 1] && (
                <LogoQuestionView
                  first_text={questions?.[questionCount - 1] && questions?.[questionCount - 1]?.question}
                  second_text={getCurrentAnswer()}
                />
              )}
            </div>
            {console.log(`${IMAGE_BASE_URL}/${questions?.[questionCount - 1]?.avatar_exercise?.split(",")?.[answerCount]?.trim()}`)}
            <div className="">
              <VideoPlayer2
                source={`${IMAGE_BASE_URL}/${questions?.[questionCount - 1]?.avatar_exercise?.split(",")?.[answerCount]?.trim()}`}
                onEnd={() => {
                  setIsVideoEnd(true);
                  if (!isDelay && recordCount < 3) {
                    setDisableRecordingButton(false);
                  }
                }}
                onStart={() => {
                  setIsVideoEnd(false);
                  setDisableRecordingButton(true);
                }}
                ref={videoRef}
                style={{ width: '100%' }}
                videoHeight={200}
              />
            </div>
          </div>

          <Loader loading={isLoading || recordingStatus === 'loading'} />

          {recordingStatus === 'stop' && questionResponse && (
            <LogoQuestionView
              className="mt-5"
              second_text={null}
              questionResponse={questionResponse}
              first_text={questionResponse}
            />
          )}

          {recordingStatus === 'stop' && expression && (
            <p className="text-base text-center mt-3 font-semibold text-slate-900">
              Facial Expression: {expression}
            </p>
          )}

          <div className="w-1/2 h- mt-5 rounded-2xl mx-auto mb-2 overflow-hidden">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover "
              videoConstraints={{
                facingMode: "user"
              }}
            />
          </div>

          <ReactMic
            record={recordingStatus === 'recording'}
            className="sound-wave mx-auto border rounded-3xl"
            onStop={handleAudioStop}
            strokeColor="#000000"
            backgroundColor="#FF4081"
          />

          <div className="mt-5">
            {/* Only show Record button when in idle state AND not reached 3 attempts */}
            {recordingStatus === 'idle' && isVideoEnd && recordCount < 3 && (
              <RecordButton
                onPress={onStartRecord}
                title="Record"
                disabled={disableRecordingButton}
              />
            )}

            {/* Only show Play button during recording */}
            {recordingStatus === 'recording' && (
              <PlayButton onPress={onStopRecord} disabled={false} />
              // <PlayButton onPress={onStopRecord} disabled={isStopButtonDisabled} />
            )}

            {/* Show navigation buttons only after 3 attempts or when evaluation is complete */}
            {((recordingStatus === 'stop' && recordCount >= 3) || recordCount >= 3) && (
              <div className="flex justify-between items-center mt-5 gap-3">
                {questionCount !== 1 && (
                  <PrevButton
                    onPress={() => {
                      setRecordingStatus('idle');
                      setExpression(null);
                      setQuestionResponse('');
                      setRecordCount(0); // Reset attempt count when going back
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
                    title="Previous"
                  />
                )}

                {questionCount < questions?.length && (
                  <NextButton
                    onPress={() => {
                      setRecordingStatus('idle');
                      setExpression(null);
                      setQuestionResponse('');
                      setAnswerCount(0);
                      setRecordCount(0);
                      setConsecutiveCorrect(0);
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
                    title="Next"
                  />
                )}

                <EndButton
                  onPress={endAssessment}
                  title={questionCount < questions?.length ? "End Now" : "Finish"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpressiveAssessment;