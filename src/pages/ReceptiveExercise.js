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
import CustomHeader from '../components/CustomHeader';
import { motion } from 'framer-motion';
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
      console.log("response", response)

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

        console.log(response)
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
    <div className="min-h-screen overflow-hidden bg-gray-50 px-5 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <CustomHeader
            title="Receptive Language Exercise"
            goBack={() => history(-1)}
          />

          <main className="p-6">
            {/* Progress Section */}
            <div className="mb-4">
              <p className="text-start mb-1">
                Question <span className="font-bold">{Math.min(questionCount, questions?.length || 0)}</span> out of{' '}
                <span className="font-bold">{questions?.length || 0}</span>
              </p>

              {percentageCompleted.toString() !== 'Infinity' && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentageCompleted}%` }}
                      className="h-full bg-orange-500"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {percentageCompleted.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Question */}
            {questions[questionCount - 1] && (
              <div className="mb-2 ml-36">
                <LogoQuestionView
                  first_text=""
                  second_text={questions[questionCount - 1].question_text}
                />
              </div>
            )}

            {/* Stats Card */}
         {/* Stats Card */}
         <div className="flex items-center max-w-xl mx-auto justify-between   px-2 rounded-lg">
              <div className="flex items-center">
                <p className="text-sm">Attempt: </p>
                <p className="ml-1 text-base font-semibold text-black">{getAnswerStats().attempt}</p>
              </div>
              <div>
                <div className="flex items-center justify-end">
                  <p className="text-sm text-green-600">Correct: </p>
                  <p className="ml-1 text-base font-semibold text-green-600">{getAnswerStats().correct}</p>
                </div>
                <div className="flex items-center justify-end mt-1">
                  <p className="text-sm text-red-600">Incorrect: </p>
                  <p className="ml-1 text-base font-semibold text-red-600">{getAnswerStats().incorrect}</p>
                </div>
              </div>
            </div>

            {/* Images Section - Keeping original logic */}
            <div className="border border-[#0CC8E8] rounded-2xl p-4 mx-auto max-w-xl mb-8">
              {questions[questionCount - 1]?.image_url ? (
                <div className="flex justify-center">
                  <button
                    disabled={(questionResponse !== '' || getAnswerStats().correct + getAnswerStats().incorrect >= 3) || !isVideoEnd}
                    onClick={(evt) => onPressImage(questions[questionCount - 1], evt)}
                    className="relative w-2/5 h-64 aspect-square"
                  >
                    {!isImageLoading && questions[questionCount - 1]?.coordinates && (
                      // <div
                      //   className="absolute pointer-events-none border-2 border-green-500"
                      //   style={{
                      //     left: `${JSON.parse(questions[questionCount - 1].coordinates)[0]-35 }px`,
                      //     top: `${JSON.parse(questions[questionCount - 1].coordinates)[1]}px`,
                      //     width: `${JSON.parse(questions[questionCount - 1].coordinates)[2] - JSON.parse(questions[questionCount - 1].coordinates)[0]-15 }px`,
                      //     height: `${JSON.parse(questions[questionCount - 1].coordinates)[3] - JSON.parse(questions[questionCount - 1].coordinates)[1]-50 }px`,
                      //   }}
                      // />

                      <div
                        className="absolute pointer-events-none border-2 border-green-500"
                        style={{
                          left: `${JSON.parse(questions[questionCount - 1].coordinates)[0] -
                            (questionCount === 16 ? 35 : questionCount === 17 ? 20 : questionCount === 18 ? 34 : questionCount === 19 ? 30 : questionCount === 20 ? 40 : 0)
                            }px`,
                          top: `${JSON.parse(questions[questionCount - 1].coordinates)[1] -
                            (questionCount === 16 ? 3 : questionCount === 17 ? 1 : questionCount === 18 ? 13 : questionCount === 19 ? 24 : questionCount === 20 ? 0 : 0)
                            }px`,
                          width: `${JSON.parse(questions[questionCount - 1].coordinates)[2] -
                            JSON.parse(questions[questionCount - 1].coordinates)[0] -
                            (questionCount === 16 ? 15 : questionCount === 17 ? 35 : questionCount === 18 ? 15 : questionCount === 19 ? 20 : questionCount === 20 ? 25 : 0)
                            }px`,
                          height: `${JSON.parse(questions[questionCount - 1].coordinates)[3] -
                            JSON.parse(questions[questionCount - 1].coordinates)[1] -
                            (questionCount === 16 ? 60 : questionCount === 17 ? 50 : questionCount === 18 ? 18 : questionCount === 19 ? 18 : questionCount === 20 ? 0 : 0)
                            }px`,
                        }}
                      />

                    )}
                    <img
                      className="w-full h-full object-contain rounded-lg border border-black"
                      src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_url}`}
                      alt="Exercise"
                      onLoad={() => setIsImageLoading(false)}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        onPressImage(questions[questionCount - 1], evt);
                      }}
                    />
                  </button>
                </div>
              ) : (
                <div>
                  {answerTurn === 'second' ? (
                    <div className="flex justify-center">
                      <button
                        disabled={((answersReport?.secondturn?.correct + answersReport?.secondturn?.incorrect) >= 3) || !isVideoEnd}
                        onClick={(evt) => onPressImage(getCorrectImage(), evt)}
                        className="w-2/5 h-64 aspect-square border-4 border-green-500 rounded-lg transition-colors hover:bg-green-50 disabled:opacity-50"
                      >
                        <img
                          className="w-full h-full object-contain"
                          src={`${IMAGE_BASE_URL}${getCorrectImage()}`}
                          alt="correct option"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center gap-8 w-full">
                      {currentImages?.map((item, index) => (
                        <button
                          key={index}
                          disabled={(questionResponse !== '' || ((getAnswerStats()?.correct + getAnswerStats()?.incorrect) >= 3)) || !isVideoEnd}
                          onClick={(evt) => onPressImage(item, evt)}
                          className={`w-2/5 h-64 aspect-square transition-transform hover:scale-105 disabled:opacity-50 ${isCorrectImage(item, questions[questionCount - 1]?.correct_answers, null)
                            ? 'border-4 border-green-500'
                            : 'border border-black'
                            }`}
                        >
                          <img
                            className="w-full h-full object-contain"
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

            {/* Video and Buttons Row */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-8">
              {/* Video Player */}
              <motion.div
                className={`w-48 rounded-xl h-48 ${!questionResponse ? 'mx-auto' : ''}`}
                animate={{ x: questionResponse ? 0 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <VideoPlayer
                  key={videoKey}
                  ref={videoRef}
                  source={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.exercise}`}
                  onEnd={() => setIsVideoEnd(true)}
                  onStart={() => setIsVideoEnd(false)}
                  controls={true}
                />
              </motion.div>

              {/* Response and Navigation */}
              {questionResponse && (
                <motion.div
                  className="w-48 relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="absolute top-4 left-8">
                    <LogoQuestionView
                      second_text=""
                      first_text={questionResponse}
                      questionResponse={questionResponse}
                    />
                  </div>

                  <div className="space-y-2 mt-24">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setAnswersReport(initialObj);
                        setAnswerTurn("first");
                        setQuestionResponse('');
                        setIsVideoEnd(false);
                        setVideoKey(prev => prev + 1);
                        setQuestionCount(prevCount => prevCount + 1);
                        setCurrentImages(shuffleArray(questions[questionCount]?.images));
                      }}
                      className="w-full bg-green-500 text-white rounded-full py-2 px-4 font-semibold"
                    >
                      Next
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={endAssessment}
                      className="w-full bg-red-500 text-white rounded-full py-2 px-4 font-semibold"
                    >
                      End Now
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ReceptiveExercise;

