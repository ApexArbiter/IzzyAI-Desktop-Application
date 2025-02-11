import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getQuickReceptiveQuestions, shuffleArray } from '../utils/functions';
import { IMAGE_BASE_URL } from '../components/ApiCreds';
import LogoQuestionView from '../components/LogoQuestionView';
import Loader from '../components/Loader';
import { useDataContext } from '../contexts/DataContext';
import CustomHeader from '../components/CustomHeader';
import { motion } from 'framer-motion';

// Button Components with updated styles
const EndButton = ({ onClick, title }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full bg-red-500 text-white rounded-full py-2 px-4 font-semibold"
    >
        {title}
    </motion.button>
);

const NextButton = ({ onClick, title }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full bg-green-500 text-white rounded-full py-2 px-4 font-semibold"
    >
        {title}
    </motion.button>
);

const PrevButton = ({ onClick, title }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full border border-gray-300 text-gray-700 rounded-full py-2 px-4 font-semibold"
    >
        {title}
    </motion.button>
);


function QuickReceptive() {
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionId } = location.state || {};
    const { setExpressiveReport } = useDataContext();

    // State Management
    const [startTime, setStartTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [questionResponse, setQuestionResponse] = useState('');
    const [questionCount, setQuestionCount] = useState(1);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentImages, setCurrentImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initialize start time
    useEffect(() => {
        const currentStartTime = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
        setStartTime(currentStartTime);
    }, []);

    // Fetch questions data
    const fetchQuestionData = async () => {
        const userId = localStorage.getItem('userId');
        try {
            setLoading(true);
            const response = await getQuickReceptiveQuestions(userId);
            if (response) {
                setQuestions(response);
                setCurrentImages(shuffleArray(response?.[questionCount - 1]?.images));
            }
        } catch (error) {
            console.error('Network request failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestionData();
    }, []);

    // Existing function implementations remain the same
    const onCorrectAnswer = (ques) => {
        setQuestionResponse('Matched');
        setCorrectAnswersCount(prevCount => prevCount + 1);
        if (!correctQuestions.includes(ques)) {
            setCorrectQuestions(prevQuestions => [...prevQuestions, ques]);
        }
        if (incorrectQuestions?.includes(questions?.[questionCount - 1])) {
            setIncorrectQuestions(prevQuestions =>
                prevQuestions.filter(q => q?.question !== ques)
            );
        }
    };

    const onWrongAnswer = (ques) => {
        if (!incorrectQuestions?.includes(questions?.[questionCount - 1])) {
            setIncorrectQuestions(prevQuestions => [
                ...prevQuestions,
                questions?.[questionCount - 1]
            ]);
        }
        if (correctQuestions.includes(ques)) {
            setCorrectAnswersCount(prevCount => prevCount - 1);
            setCorrectQuestions(prevQuestions =>
                prevQuestions.filter(q => q !== ques)
            );
        }
        setQuestionResponse('UnMatched');
    };

    const onPressImage = async (item, evt) => {
        const currentQuestion = questions?.[questionCount - 1];
        if (currentQuestion?.image_url) {
            const rect = evt.target.getBoundingClientRect();
            const xAxis = Math.round(evt.clientX - rect.left);
            const yAxis = Math.round(evt.clientY - rect.top);

            const imgElement = evt.target;
            const scaleX = imgElement.naturalWidth / imgElement.width;
            const scaleY = imgElement.naturalHeight / imgElement.height;

            const scaledX = xAxis * scaleX;
            const scaledY = yAxis * scaleY;

            const coordinates = JSON.parse(currentQuestion.coordinates);
            const [min_x, min_y, max_x, max_y] = coordinates;

            if (scaledX >= min_x && scaledX <= max_x && scaledY >= min_y && scaledY <= max_y) {
                onCorrectAnswer(currentQuestion?.question_text);
            } else {
                onWrongAnswer(currentQuestion?.question_text);
            }
        } else {
            const splitted = item?.split("/");
            const splitted2 = splitted?.[splitted?.length - 1]?.split(".");
            const correctImage = currentQuestion?.correct_answers?.[0];

            if (correctImage === splitted2?.[0]) {
                onCorrectAnswer(currentQuestion?.question_text);
            } else {
                onWrongAnswer(currentQuestion?.question_text);
            }
        }
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
                isExpressive: false,
                totalQuestions: questions?.length,
                isQuick: true
            }
        });
    };

    const endAssessment = () => {
        setExpressiveReport(incorrectQuestions);
        navigateTo();
    };

    const percentageCompleted = (questionCount / questions?.length) * 100;

    return (
        <div className="min-h-screen overflow-hidden bg-gray-50 px-5 py-3">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <CustomHeader
                        title="Quick Receptive Language Disorder Assessment"
                        goBack={() => navigate(-1)}
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
                        {questions?.[questionCount - 1] && (
                            <div className="mb-2 ml-36">
                                <LogoQuestionView
                                    second_text={questions[questionCount - 1]?.question_text}
                                />
                            </div>
                        )}

                        {/* Images Section */}
                        <div className="border border-[#0CC8E8] rounded-2xl p-4 mx-auto max-w-xl mb-8">
                            {questions?.[questionCount - 1]?.image_url ? (
                                <div className="flex justify-center">
                                    <button
                                        disabled={questionResponse !== ''}
                                        onClick={(evt) => onPressImage(questions[questionCount - 1], evt)}
                                        className="relative w-2/5 h-64 aspect-square"
                                    >
                                        <img
                                            className="w-full h-full object-contain  border border-gray-800"
                                            src={`${IMAGE_BASE_URL}${questions[questionCount - 1]?.image_url}`}
                                            alt="Question"
                                        />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center gap-8 w-full">
                                    {currentImages?.map((item, index) => (
                                        <button
                                            key={index}
                                            disabled={questionResponse !== ''}
                                            onClick={(evt) => onPressImage(item, evt)}
                                            className="w-2/5 h-64 aspect-square transition-transform hover:scale-105 disabled:opacity-50 border border-gray-800 "
                                        >
                                            <img
                                                className="w-full h-full object-contain"
                                                src={`${IMAGE_BASE_URL}${item}`}
                                                alt={`Option ${index + 1}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Response and Navigation */}
                        {questionResponse && (
                            <motion.div
                                className="space-y-4 max-w-xs mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="mb-6">
                                    <LogoQuestionView
                                        second_text={null}
                                        first_text={questionResponse}
                                        questionResponse={questionResponse}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {questionCount < questions?.length && (
                                        <div className="flex gap-3">
                                            {questionCount !== 1 && (
                                                <div className="w-1/2">
                                                    <PrevButton
                                                        onClick={() => {
                                                            setQuestionResponse('');
                                                            if (questionCount >= 1) {
                                                                setQuestionCount(prev => prev - 1);
                                                                setCurrentImages(shuffleArray(questions?.[questionCount - 2]?.images));
                                                            }
                                                        }}
                                                        title="Previous"
                                                    />
                                                </div>
                                            )}
                                            <div className="w-1/2">
                                                <NextButton
                                                    onClick={() => {
                                                        setQuestionResponse('');
                                                        if (questionCount < questions?.length) {
                                                            setQuestionCount(prev => prev + 1);
                                                            setCurrentImages(shuffleArray(questions?.[questionCount]?.images));
                                                        } else {
                                                            navigateTo();
                                                        }
                                                    }}
                                                    title="Next"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <EndButton
                                        onClick={endAssessment}
                                        title={questionCount < questions?.length ? "End Now" : "Finish"}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
            <Loader loading={loading} />
        </div>
    );
}

export default QuickReceptive;