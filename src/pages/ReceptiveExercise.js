import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import axios from 'axios'; // To replace network requests
import { getReceptiveAllExerciseQuestions, getReceptiveExerciseQuestions, getToken, shuffleArray } from '../utils/functions'; // Assuming these are defined
import VideoPlayer from '../components/VideoPlayer';
import Loader from '../components/Loader'; // Custom loader component
import LogoQuestionView from '../components/LogoQuestionView'; // Custom component
// Custom button component
import { LinearProgress } from '@mui/material'; // React Material UI Progress Bar
import { IMAGE_BASE_URL } from '../components/ApiCreds';
import { useDataContext } from '../contexts/DataContext';
const EndButton = (props) => {
  return (
    <button onClick={props.onClick} style={styles.endButton}>
      <span style={styles.endButtonText}>{props.title}</span>
    </button>
  );
};

const NextButton = (props) => {
  return (
    <button onClick={props.onClick} style={styles.nextButton}>
      <span style={styles.nextButtonText}>{props.title}</span>
    </button>
  );
};

const initialObj = {
  firstturn: { correct: 0, incorrect: 0 },
  secondturn: { correct: 0, incorrect: 0 },
  thirdturn: { correct: 0, incorrect: 0 }
};

function ReceptiveExercise() {
  // const { sessionId, isAll } = useParams();
  const location = useLocation();
  const { sessionId, isAll } = location.state || {};
  console.log(location.state)
  const [startTime, setStartTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [questionResponse, setQuestionResponse] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [answerTurn, setAnswerTurn] = useState("first");
  const [answersReport, setAnswersReport] = useState(initialObj);
  const [isVideoEnd, setIsVideoEnd] = useState(false);
  const [correctQuestions, setCorrectQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [currentImages, setCurrentImages] = useState(null);
  const [showVideo, setShowVideo] = useState(true);
  const history = useNavigate();
  const [videoKey, setVideoKey] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const videoRef = useRef(null);

  const { userId, setExpressiveReport, userDetail } = useDataContext();

  useEffect(() => {
    const currentStartTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setStartTime(currentStartTime);
  }, []);
  useEffect(() => {
    if (questions[questionCount - 1]?.coordinates) {
      console.log('Current question coordinates:', JSON.parse(questions[questionCount - 1].coordinates));
    }
  }, [questionCount, questions]);
  const parseCoordinates = (coordString) => {
    try {
      return JSON.parse(coordString);
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return [0, 0, 0, 0];
    }
  };


  const fetchQuestionData = async () => {
    try {
      const token = await getToken()
      console.log("Token", token)

      setIsLoading(true);
      console.log("user Details", userId, userDetail?.AvatarID)
      // console.log("isAll", isAll)
      const response = isAll ? await getReceptiveAllExerciseQuestions(12, 1) : await getReceptiveAllExerciseQuestions(12, 1)
      // const response = await getReceptiveAllExerciseQuestions(353, 1)
      // console.log("response", response)

      // if (Array.isArray(response) && response.length >= 16) {
      //   // Slice the array to start from the 15th question (index 14)
      //   const slicedQuestions = response.slice(15);

      //   setQuestions(slicedQuestions);

      //   // Set current images for the first question after index 14
      //   if (slicedQuestions[0]?.images) {
      //     setCurrentImages(shuffleArray(slicedQuestions[0].images));
      //   }
      // } else {
      //   console.log("Not enough questions to start from 15")
      // }


      if (Array.isArray(response) && response.length > 0) {

        console.log("1")
        if (Array.isArray(response) && response.length > 0) {
          console.log("1")
          setQuestions(response);

          // Check if first item has images property
          if (response[0]?.images) {
            console.log("3")
            setCurrentImages(shuffleArray(response[0].images));
          }
        } else {
          console.log("no data")
        }
      }
      console.log("questions", questions)
      console.log("currentImages", currentImages)
    } catch (error) {
      console.error('Network request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionData();
  }, []);

  const onCorrectAnswer = (ques) => {
    setQuestionResponse('Correct!');
    setCorrectAnswersCount(prevCount => prevCount + 1);
    if (!correctQuestions.includes(ques)) {
      setCorrectQuestions(prevQuestions => [...prevQuestions, ques]);
    }
    if (incorrectQuestions.includes(questions[questionCount - 1])) {
      setIncorrectQuestions(prevQuestions => prevQuestions.filter(q => q.question !== ques));
    }
  };

  const onWrongAnswer = (ques) => {
    if (!incorrectQuestions.includes(questions[questionCount - 1])) {
      setIncorrectQuestions(prevQuestions => [...prevQuestions, questions[questionCount - 1]]);
    }
    if (correctQuestions.includes(ques)) {
      setCorrectAnswersCount(prevCount => prevCount - 1);
      setCorrectQuestions(prevQuestions => prevQuestions.filter(q => q !== ques));
    }
    setQuestionResponse('Incorrect!');
  };
  const isCorrectImage = (image, answers, evt) => {
    if (image?.image_url) {
      const rect = evt.target.getBoundingClientRect();
      const xAxis = Math.round(evt.clientX - rect.left);
      const yAxis = Math.round(evt.clientY - rect.top);

      // Get the image's natural dimensions
      const imgElement = evt.target;
      const scaleX = imgElement.naturalWidth / imgElement.width;
      const scaleY = imgElement.naturalHeight / imgElement.height;

      // Scale the click coordinates
      const scaledX = xAxis * scaleX;
      const scaledY = yAxis * scaleY;

      // Get the coordinates from the image data
      const coordinates = JSON.parse(image?.coordinates);
      const min_x = coordinates[0];
      const min_y = coordinates[1];
      const max_x = coordinates[2];
      const max_y = coordinates[3];

      console.log('Scaled coordinates:', { scaledX, scaledY });
      console.log('Target area:', { min_x, min_y, max_x, max_y });

      // Check if scaled click is within the correct area
      return scaledX >= min_x && scaledX <= max_x &&
        scaledY >= min_y && scaledY <= max_y;
    } else {
      // Handle non-coordinate based images
      let splitted = image?.split("/");
      let splitted2 = splitted[splitted.length - 1]?.split(".");
      const correctImage = answers[0];
      return correctImage === splitted2[0];
    }
  };

  const onPressImage = async (item, evt) => {
    const currentQuestion = questions[questionCount - 1];
    let obj = { ...answersReport };

    // Function to reset and replay video
    const resetAndPlayVideo = () => {
      setVideoKey(prev => prev + 1); // Force video remount
      setIsVideoEnd(false);
      setShowVideo(true);
    };

    if (answerTurn === 'first') {
      let report = { ...obj.firstturn };
      if (isCorrectImage(item, currentQuestion.correct_answers, evt)) {
        report.correct = report.correct + 1;
      } else {
        report.incorrect = report.incorrect + 1;
      }
      obj.firstturn = report;
      setAnswersReport(obj);

      if ((obj.firstturn.correct + obj.firstturn.incorrect) === 3) {
        if (obj.firstturn.correct > obj.firstturn.incorrect) {
          onCorrectAnswer(currentQuestion.question_text);
        } else {
          setTimeout(() => {
            setAnswerTurn("second");
            resetAndPlayVideo();
          }, 500);
        }
      } else {
        resetAndPlayVideo();
      }
    } else if (answerTurn === 'second') {
      let report = { ...obj.secondturn };
      if (isCorrectImage(item, currentQuestion.correct_answers, evt)) {
        report.correct = report.correct + 1;
      } else {
        report.incorrect = report.incorrect + 1;
      }
      obj.secondturn = report;
      setAnswersReport(obj);

      if ((obj.secondturn.correct + obj.secondturn.incorrect) === 3) {
        setTimeout(() => {
          setAnswerTurn("third");
          resetAndPlayVideo();
        }, 500);
      } else {
        resetAndPlayVideo();
      }
    } else if (answerTurn === 'third') {
      let report = { ...obj.thirdturn };
      if (isCorrectImage(item, currentQuestion.correct_answers, evt)) {
        report.correct = report.correct + 1;
      } else {
        report.incorrect = report.incorrect + 1;
      }
      obj.thirdturn = report;
      setAnswersReport(obj);

      if ((obj.thirdturn.correct + obj.thirdturn.incorrect) === 3) {
        if (obj.thirdturn.correct > obj.thirdturn.incorrect) {
          onCorrectAnswer(currentQuestion.question_text);
        } else {
          onWrongAnswer(currentQuestion.question_text);
        }
      } else {
        resetAndPlayVideo();
      }
    }
  };

  const getRightObjectDiv = () => {
    const image = questions?.[questionCount - 1]
    const min_x = JSON.parse(image?.coordinates)?.[0]
    const min_y = JSON.parse(image?.coordinates)?.[1]
    const max_x = JSON.parse(image?.coordinates)?.[2]
    const max_y = JSON.parse(image?.coordinates)?.[3]

    return (
      <div
        style={{
          borderWidth: 3,
          borderColor: "green",
          position: "absolute",
          zIndex: 1,
          left: min_x,
          width: (max_x - min_x) + 2,
          height: (max_y - min_y) + 2,
          top: min_y,
        }}
      />

    )
  }

  const navigateTo = () => {
    // Your custom navigation method (useNavigate)
    history(`/result-expressive-language/`, {
      state:
      {
        sessionId: sessionId,
        startTime: startTime,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: incorrectQuestions?.length,
        incorrectQuestions: incorrectQuestions,
        isExpressive: false,
        totalQuestions: questions?.length,
        isExercise: true
      }
    });
  };

  const navigateBack = () => {
    history(-1);
  };

  useEffect(() => {
    const backAction = () => {
      navigateBack();
      return true;
    };
    window.onpopstate = backAction;
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const endAssessment = () => {
    setExpressiveReport(incorrectQuestions);
    navigateTo();
  };

  const percentageCompleted = questions?.length ? (questionCount / questions.length) * 100 : 0;

  const getCorrectImage = () => {
    const currentQuestion = questions[questionCount - 1];
    if (currentQuestion.image_url) {
      return currentQuestion.image_url;
    } else {
      let image = '';
      currentQuestion.images.forEach(element => {
        let splitted = element.split("/");
        let splitted2 = splitted[splitted.length - 1]?.split(".");
        const correctImage = currentQuestion.correct_answers[0];
        if (correctImage === splitted2[0]) {
          image = element;
        }
      });
      return image;
    }
  };
  const getAnswerStats = () => {
    let obj = {
      attempt: 0,
      correct: 0,
      incorrect: 0
    }
    if (answerTurn === 'first') {
      obj.attempt = 1
      obj.correct = answersReport?.firstturn?.correct
      obj.incorrect = answersReport?.firstturn?.incorrect
    } else if (answerTurn === 'second') {
      obj.attempt = 2
      obj.correct = answersReport?.secondturn?.correct
      obj.incorrect = answersReport?.secondturn?.incorrect
    } else {
      obj.attempt = 3
      obj.correct = answersReport?.thirdturn?.correct
      obj.incorrect = answersReport?.thirdturn?.incorrect
    }
    return obj
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Receptive Language Disorder Exercise
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Exercise {questionCount} of {questions.length}</span>
              <span className="text-blue-600 font-medium">
                {percentageCompleted.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Progress Bar */}
            {percentageCompleted.toString() !== "Infinity" && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <LinearProgress
                  className="rounded-full h-2"
                  value={percentageCompleted}
                  variant="determinate"
                  color="primary"
                />
              </div>
            )}

            {/* Question */}
            {questions[questionCount - 1] && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-xl text-gray-900 font-medium">
                  {questions[questionCount - 1]?.question_text}
                </p>
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Attempt</p>
                  <p className="text-2xl font-semibold">{getAnswerStats().attempt}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Correct</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {getAnswerStats().correct}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Incorrect</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {getAnswerStats().incorrect}
                  </p>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {questions[questionCount - 1]?.image_url ? (
                <div className="relative inline-block">
                  <button
                    disabled={(questionResponse !== '' || getAnswerStats().correct + getAnswerStats().incorrect >= 3) || !isVideoEnd}
                    onClick={(evt) => onPressImage(questions[questionCount - 1], evt)}
                    className="relative w-full"
                  >
                    {!isImageLoading && questions[questionCount - 1]?.coordinates && (
                      <div
                        className="absolute pointer-events-none border-2 border-green-500"
                        style={{
                          left: `${JSON.parse(questions[questionCount - 1].coordinates)[0] + 22}px`,
                          top: `${JSON.parse(questions[questionCount - 1].coordinates)[1] + 22}px`,
                          width: `${JSON.parse(questions[questionCount - 1].coordinates)[2] - JSON.parse(questions[questionCount - 1].coordinates)[0] + 10}px`,
                          height: `${JSON.parse(questions[questionCount - 1].coordinates)[3] - JSON.parse(questions[questionCount - 1].coordinates)[1] + 27}px`,
                        }}
                      />
                    )}
                    <img
                      className="w-full h-auto rounded-lg "
                      src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_url}`}
                      alt="Exercise"
                      onLoad={() => setIsImageLoading(false)}
                      onClick={(evt) => {
                        // Prevent default button click
                        evt.stopPropagation();
                        // Call onPressImage with the correct event
                        onPressImage(questions[questionCount - 1], evt);
                      }}
                    />
                  </button>
                </div>
              ) : (
                <div>
                  {answerTurn === 'second' ? (
                    <button
                      disabled={((answersReport?.secondturn?.correct + answersReport?.secondturn?.incorrect) >= 3) || !isVideoEnd}
                      onClick={(evt) => onPressImage(getCorrectImage(), evt)}
                      className="mx-auto w-full max-w-2xl border-4 border-green-500 rounded-lg p-4 transition-colors hover:bg-green-50 disabled:opacity-50"
                    >
                      <img
                        className="w-full h-auto object-contain"
                        src={`${IMAGE_BASE_URL}${getCorrectImage()}`}
                        alt="correct option"
                      />
                    </button>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentImages?.map((item, index) => (
                        <button
                          key={index}
                          disabled={(questionResponse !== '' || ((getAnswerStats()?.correct + getAnswerStats()?.incorrect) >= 3)) || !isVideoEnd}
                          onClick={(evt) => onPressImage(item, evt)}
                          className={`p-4 rounded-lg transition-transform hover:scale-105 ${isCorrectImage(item, questions[questionCount - 1]?.correct_answers, null)
                            ? 'border-4 border-green-500'
                            : 'border-2 border-gray-200'
                            } ${((questionResponse !== '' || ((getAnswerStats()?.correct + getAnswerStats()?.incorrect) >= 3)) || !isVideoEnd)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:shadow-lg'
                            }`}
                        >
                          <img
                            className="w-full h-48 object-contain border"
                            src={`${IMAGE_BASE_URL}${item}`}
                            alt={`option ${index + 1}`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Response Message */}
            {questionResponse && (
              <div className={`text-center p-4 rounded-lg ${questionResponse === 'Correct!' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                <p className="text-lg font-semibold">{questionResponse}</p>
              </div>
            )}

            {/* Video Player */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <VideoPlayer
                key={videoKey}
                ref={videoRef}
                videoHeight={210}
                source={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.exercise}`}
                onEnd={() => setIsVideoEnd(true)}
                onStart={() => setIsVideoEnd(false)}
              />
            </div>

            {/* Navigation Buttons */}
            {questionResponse !== '' && (
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={() => {
                    setAnswersReport(initialObj);
                    setAnswerTurn("first");
                    setQuestionResponse('');
                    setIsVideoEnd(false);
                    setVideoKey(prev => prev + 1);
                    setQuestionCount(prevCount => prevCount + 1);
                    setCurrentImages(shuffleArray(questions[questionCount]?.images));
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Exercise
                </button>
                <button
                  onClick={endAssessment}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Finish
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReceptiveExercise;

