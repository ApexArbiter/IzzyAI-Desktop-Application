import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ReactMic } from 'react-mic';
import { LinearProgress } from '@mui/material';
import { useDataContext } from '../contexts/DataContext';
import { getExpressiveQuestions, evaluateExpressiveQuestion, getToken, authenticateFace, getExpressiveAllExerciseQuestions, getExpressiveExerciseQuestions, detectExpression, matchExpressiveAnswer } from "../utils/functions";
import CustomHeader from '../components/CustomHeader';
import VideoPlayer2 from '../components/VideoPlayer2';
import Loader from '../components/Loader';
import LogoQuestionView from '../components/LogoQuestionView';
import WaveIcon from '../assets/Wave'; // Make sure to convert your WaveSVG to React component
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import { useExpressiveExercise } from '../hooks/useExpressiveExercise';

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
  const { sessionId, isAll, navigate, setExpressiveReport, webcamRef, videoRef, startTime, setStartTime, correctAnswersCount, setCorrectAnswersCount, isLoading, setIsLoading, questionResponse, setQuestionResponse, questionCount, setQuestionCount, recordingStatus, setRecordingStatus, incorrectQuestions, setIncorrectQuestions, correctQuestions, setCorrectQuestions, incorrectExpressions, setIncorrectExpressions, correctExpressions, setCorrectExpressions, expressionsArray, setExpressionsArray, questionExpressions, setQuestionExpressions, questions, setQuestions, disableRecordingButton, setDisableRecordingButton, isWrongAnswer, setInWrongAnswer, wrongWord, setWrongWord, answerCount, setAnswerCount, recordCount, setRecordCount, consecutiveCorrect,setConsecutiveCorrect, isNextAnswer, setIsNextAnswer, isDelay, setIsDelay, expression, setExpression, snapshot, setSnapshot, isVideoEnd, setIsVideoEnd, response, setResponse, expressionResponse, setExpressionResponse, transcript, setTranscript, incorrectWord, setIncorrectWord, updatedQuestionExpression, setUpdatedQuestionExpression } = useExpressiveExercise();
  let question = [];

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

  const fetchQuestionData = async () => {
    try {
      setIsLoading(true);
      console.log("isALL", isAll)
      const response = isAll ? await getExpressiveAllExerciseQuestions(userId, userDetail?.AvatarID) : await getExpressiveExerciseQuestions(userId, userDetail?.AvatarID)
      console.log(response)
      if (response) {
        console.log("Questions from response", response?.[questionCount - 1]?.question);
        setQuestions(prevQuestions => [...prevQuestions, ...response]);
        // questions.push(response)
        question = response
        console.log(question)

      }
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Call fetchQuestionData
  useEffect(() => {
    const func = async () => {
      await fetchQuestionData();
    }
    func();
  }, []);
  // Add this at the component level
  useEffect(() => {
    const resetAndPlayVideo = () => {
      if (videoRef.current) {
        videoRef.current.stop();
        videoRef.current.seek(0.1);
        setTimeout(() => {
          if (recordCount < 3 && !isDelay && recordingStatus === 'idle') {
            videoRef.current.resume();
            setIsVideoEnd(false);
          }
        }, 200);
      }
    };

    if (recordingStatus === 'idle' && !isDelay) {
      resetAndPlayVideo();
    }
  }, [recordingStatus, isDelay, recordCount]);
  const endAssessment = () => {
    setExpressiveReport(incorrectQuestions);
    navigateTo();
  };

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

  const getCurrentAnswer = () => {
    let answers = questions?.[questionCount - 1]?.answers?.split(";")
    return answers?.[answerCount]?.trim()
  }

  const onStartRecord = async () => {
    try {
      setRecordingStatus('recording');

      if (!webcamRef.current) {
        console.error('Webcam reference not available');
        setRecordingStatus('idle');
        return;
      }

      const imageSrc = webcamRef.current.getScreenshot();
      setSnapshot(imageSrc)
      if (!imageSrc) {
        console.error('No image captured');
        
        return;
      }


      // setDisableRecordingButton(false);

    } catch (error) {
      console.error('Error capturing image:', error);
      setRecordingStatus('idle');
    }
  };
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
    setRecordingStatus("stop")
    setWrongWord(null)
    setInWrongAnswer(null)
}
const onWrongAnswer = (ques) => {
    if (!incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
        setIncorrectQuestions(prevQuestions => [
            ...prevQuestions,
            { ...questions?.[questionCount - 1], questiontext: ques + questionCount },
        ]);
    }
    if (correctQuestions.includes(ques + questionCount)) {
        setCorrectAnswersCount(prevCount => prevCount - 1);
        setCorrectQuestions(prevQuestions =>
            prevQuestions.filter(q => q !== ques + questionCount),
        );
    }
    setQuestionResponse('Incorrect!');
    setWrongWord(null)
    setInWrongAnswer(null)
}
const onCorrectExpression = (ques, exp) => {
    if (!correctExpressions.includes(ques + exp + questionCount)) {
        setCorrectExpressions(prevQuestions => [
            ...prevQuestions,
            ques + exp + questionCount,
        ]);
    }
    if (incorrectExpressions.some(q => q === ques + exp + questionCount)) {
        setIncorrectExpressions(prevQuestions =>
            prevQuestions.filter(q => q !== ques + exp + questionCount),
        );
    }
}
const onWrongExpression = (ques, exp) => {
    if (!incorrectExpressions.some(q => q === ques + exp + questionCount)) {
        setIncorrectExpressions(prevQuestions => [
            ...prevQuestions,
            ques + exp + questionCount,
          ]);
        }
    if (correctExpressions.includes(ques + exp + questionCount)) {
      setCorrectExpressions(prevQuestions =>
            prevQuestions.filter(q => q !== (ques + exp + questionCount)),
          );
    }
}

const sendSnapshot = async () => {
  if (!webcamRef.current) return null;

  try {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return null;

    const base64Response = await fetch(imageSrc);
    const blob = await base64Response.blob();

    const formData = new FormData();
    formData.append('image', blob, 'snapshot.jpg');

    const response = await detectExpression(formData)
    if (response?.expression) {
      setExpression(response?.expression)
      return response?.expression
  }
  console.log(response.expression)
  return null

   
  } catch (error) {
    console.error('Error capturing/sending snapshot:', error);
    return null;
  }
};



const getSingleExpression = (arr) => {
  const countMap = arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
  }, {});

  // Step 2: Find the element with the highest count
  const maxElement = Object.keys(countMap).reduce((a, b) =>
      countMap[a] > countMap[b] ? a : b
  );

  // Step 3: Filter out the most frequent element
  const filteredArray = arr.find(item => item === maxElement);
  return filteredArray
}

const updateValuesToInitial = (updatedQuestionExpression) => {
  setExpressionsArray(prevArray => [...prevArray, getSingleExpression(updatedQuestionExpression) || ""])
  // setConsecutiveCorrect(0)
  // setAnswerCount(0)
  // setRecordCount(0)
}




  const onStopRecord = async () => {
    setRecordingStatus('loading');
    // Stop recording will trigger ReactMic's onStop callback
  };

  // const evaluateQuestion = async (transcription) => {
  //   const file = await processImage()
  //   console.log(file)

  //   const formData = new FormData();
  //   formData.append('image', file, 'webcam-snapshot.jpg');
  //   formData.append('transcription', transcription);
  //   formData.append('answers', question?.[questionCount - 1]?.answers);
  //   formData.append('expected_expression', question?.[questionCount - 1]?.expression);

  //   try {
  //     const response = await evaluateExpressiveQuestion(formData);
  //     console.log(response)

  //     setRecordingStatus("stop");

  //     if (response?.expression) {
  //       setExpression(response.expression);
  //       return response.expression;
  //     }
  //   } catch (error) {
  //     console.error('Error evaluating question:', error);
  //   }

  //   return null;
  // };

  const handleAudioStop = async (recordedBlob) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('audio', recordedBlob.blob, 'sound.wav');
    const answer = getCurrentAnswer()?.replace(/\.$/, "")?.toLowerCase();

        formData.append("answer", answer)
    
        try {
          const res = await matchExpressiveAnswer(formData)
          setResponse(res)
          
          const expResponse = await sendSnapshot();
          setExpressionResponse(expResponse)

          setTranscript(response?.transcription?.trim()?.toLowerCase())
          setIncorrectWord(response?.first_incorrect_word?.trim()?.toLowerCase())
          setUpdatedQuestionExpression([...questionExpressions, expressionResponse])
          setRecordCount(prev => prev + 1)
          console.log(response, updatedQuestionExpression)
          // if (expressionResponse?.toLowerCase() === questions?.[questionCount - 1]?.expression?.toLowerCase()) {
            
          // } else {
            
          // }
          console.log("Hello recording stop")

          
      
  // } else {
  // setQuestionExpressions(prevArray => [...prevArray, expressionResponse || ""])
  // if (incorrectWord !== transcript && transcript !== null && incorrectWord?.toLowerCase() !== 'none') {
  //     setIsDelay(true)
  //     setTimeout(() => {
  //         setIsDelay(false)
  //         setExpression(null)
  //         setRecordingStatus("idle")
  //         setInWrongAnswer(true)
  //         setWrongWord(response?.first_incorrect_word)
  //         setRecordCount(0)
  //         setIsVideoEnd(false)
  //     }, 2000);
  // }
  //     } else {
  //         updateValuesToInitial(updatedQuestionExpression)
  //         onCorrectExpression(questions?.[questionCount - 1]?.question, expressionResponse)
  //         onCorrectAnswer(questions?.[questionCount - 1]?.question)
  //     }
  // }
} catch (error) {
  console.error('Network request failed When sending audio:', error);
}
};


  const percentageCompleted = ((questionCount) / questions?.length) * 100;

  useEffect(() => {
  console.log("record Count:", recordCount)
  if (recordCount === 2) {
    console.log("mango")
    if (questions?.[questionCount - 1]?.answers?.split(";")?.[answerCount + 1]) {
        setAnswerCount(answerCount + 1)
        setQuestionExpressions(prevArray => [...prevArray, expressionResponse || ""])
        setIsDelay(true)
        setIsNextAnswer(true)
        setTimeout(() => {
          setIsDelay(false);
          setExpression(null);
          videoRef.current.stop();
          videoRef.current.seek(0.1);
          videoRef.current.resume();
          setRecordingStatus("idle");
          setIsNextAnswer(false);
          setRecordCount(0);
          setIsVideoEnd(false);
        }, 2000);
    } else {
        setRecordingStatus("stop")
        updateValuesToInitial(updatedQuestionExpression)
        if (consecutiveCorrect > (questions?.[questionCount - 1]?.answers?.split(";")?.length / 2)) {
            onCorrectExpression(questions?.[questionCount - 1]?.question, expressionResponse)
            onCorrectAnswer(questions?.[questionCount - 1]?.question)
        } else {
            onWrongAnswer(questions?.[questionCount - 1]?.question)
            onWrongExpression(questions?.[questionCount - 1]?.question, expressionResponse)
        }
    }
}else {
  setQuestionExpressions(prevArray => [...prevArray, expressionResponse || ""])
  if (incorrectWord === transcript || transcript === null || incorrectWord?.toLowerCase() === 'none') {
      setConsecutiveCorrect(consecutiveCorrect + 1)
      setIsDelay(true)
      setTimeout(() => {
          setIsDelay(false)
          setExpression(null)
          setRecordingStatus("idle")
          setIsVideoEnd(false)
      }, 2000);
  } else {
      setInWrongAnswer(true)
      setWrongWord(response?.first_incorrect_word)
      setIsDelay(true)
      setTimeout(() => {
          setIsDelay(false)
          setExpression(null)
          setRecordingStatus("idle")
          setIsVideoEnd(false)
      }, 2000);
  }
}

  
}, [recordCount])

  

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CustomHeader
        title="Expressive Language Disorder"
        goBack={() => navigate(-1)}
      />

      <div className="flex-1 px-5">
        <div className="max-w-6xl mx-auto w-full pb-8">
          <p className="text-center mt-4 text-slate-900 text-sm">
            Place your face in the middle of the camera frame while speaking
          </p>

          <div className="mt-5">
            <p className="text-lg text-slate-900">
              Question{' '}
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
              Attempt: {Math.min(recordCount + 1, 3)}/3
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
            {/* {console.log(`${IMAGE_BASE_URL}/${questions?.[questionCount - 1]?.avatar_exercise?.split(",")?.[answerCount]?.trim()}`)} */}
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
            className="sr-only"
            onStop={handleAudioStop}
            strokeColor="#000000"
            backgroundColor="#FF4081"
          />

          <div className="mt-5">
            {/* Only show Record button when in idle state AND not reached 3 attempts */}
            {recordingStatus === 'idle' && isVideoEnd && recordCount < 3 && !isDelay && (
              <RecordButton
                onPress={onStartRecord}
                title="Record"
                disabled={disableRecordingButton}
              />
            )}

            {/* Only show Play button during recording */}
            {recordingStatus === 'recording' && (
              <PlayButton onPress={onStopRecord} disabled={false} />
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
                      setIsDelay(false);
                      setIsNextAnswer(false);
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