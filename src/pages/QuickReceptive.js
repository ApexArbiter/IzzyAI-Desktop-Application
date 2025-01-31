import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LinearProgress } from '@mui/material';
import { getQuickReceptiveQuestions, shuffleArray } from '../utils/functions';
import { IMAGE_BASE_URL } from '../components/ApiCreds';
import LogoQuestionView from '../components/LogoQuestionView';
import Loader from '../components/Loader';
import { useDataContext } from '../contexts/DataContext';
import CustomHeader from '../components/CustomHeader';

// Button Components
const EndButton = ({ onClick, title }) => (
    <button
        onClick={onClick}
        className="w-[42%] rounded-[50px] text-center bg-red-500 p-2.5 h-[50px] flex justify-center items-center"
    >
        <span className="text-white font-semibold">{title}</span>
    </button>
);

const NextButton = ({ onClick, title }) => (
    <button
        onClick={onClick}
        className="w-[42%] rounded-[50px] text-center bg-[#71D860] p-2.5 h-[50px] flex justify-center items-center"
    >
        <span className="text-[#111920] font-semibold">{title}</span>
    </button>
);

const PrevButton = ({ onClick, title }) => (
    <button
        onClick={onClick}
        className="w-[42%] rounded-[50px] text-center border border-solid p-2.5 h-[50px] flex justify-center items-center"
    >
        <span className="text-[#111920] font-semibold">{title}</span>
    </button>
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
            setLoading(true)
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

    // Answer handling functions
    const onCorrectAnswer = (ques) => {
        setQuestionResponse('Correct!');
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
        setQuestionResponse('Incorrect!');
    };

    // Image click handler
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

    // Navigation functions
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}

            <CustomHeader title=" Quick Receptive Language Disorder Assessment" goBack={() => navigate(-1)} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-5">
                {isLoading ? (
                    <Loader loading={isLoading} />
                ) : (
                    <div className="space-y-6">
                        {/* Question Counter */}
                        <div className="text-lg">
                            Question{' '}
                            <span className="font-bold">
                                {questionCount > questions?.length ? questions?.length : questionCount}{' '}
                            </span>
                            out of
                            <span className="font-bold"> {questions?.length}</span>
                        </div>

                        {/* Progress Bar */}
                        {percentageCompleted.toString() !== "Infinity" && (
                            <div className="flex items-center gap-4">
                                <LinearProgress
                                    className="flex-1 rounded-full h-2"
                                    value={percentageCompleted}
                                    variant="determinate"
                                    color="primary"
                                />
                                <span className="text-sm font-medium">
                                    {percentageCompleted > 0 ? percentageCompleted?.toFixed(1) : 0}%
                                </span>
                            </div>
                        )}

                        {/* Question */}
                        {questions?.[questionCount - 1] && (
                            <LogoQuestionView
                                second_text={questions?.[questionCount - 1]?.question_text}
                            />
                        )}

                        {/* Images Section */}
                        {questions?.length > 0 && (
                            <div className="mt-5">
                                {questions?.[questionCount - 1]?.image_url ? (
                                    <div className="flex justify-center items-center">
                                        <button
                                            disabled={questionResponse !== ''}
                                            onClick={(evt) => onPressImage(questions?.[questionCount - 1], evt)}
                                            className="w-[300px] h-[300px] rounded-xl border relative flex items-center justify-center"
                                        >
                                            <img
                                                className="w-full h-full rounded-xl object-contain"
                                                src={`${IMAGE_BASE_URL}${questions?.[questionCount - 1]?.image_url}`}
                                                alt="Question"
                                            />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border border-[#0CC8E8] rounded-2xl mt-10 p-3 pb-5 flex justify-between mx-auto">
                                        {currentImages?.map((item, index) => (
                                            <button
                                                key={index}
                                                disabled={questionResponse !== ''}
                                                onClick={(evt) => onPressImage(item, evt)}
                                                className="mt-5 w-[48%] h-[200px] border"
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
                        )}

                        {/* Response Message */}
                        {questionResponse !== '' && (
                            <LogoQuestionView
                                second_text={null}
                                questionResponse={questionResponse}
                                first_text={questionResponse}
                            />
                        )}

                        {/* Navigation Buttons */}
                        {questionResponse !== '' && (
                            <div className="flex flex-col items-center gap-5 mt-5 mb-[5%]">
                                {questionCount < questions?.length && (
                                    <div className="flex justify-between items-center w-full gap-2.5 mb-5">
                                        {questionCount !== 1 && (
                                            <PrevButton
                                                onClick={() => {
                                                    setQuestionResponse('');
                                                    if (questionCount >= 1) {
                                                        setQuestionCount(prevCount => prevCount - 1);
                                                        setCurrentImages(shuffleArray(questions?.[questionCount - 2]?.images));
                                                    }
                                                }}
                                                title="Previous"
                                            />
                                        )}
                                        <NextButton
                                            onClick={() => {
                                                setQuestionResponse('');
                                                if (questionCount < questions?.length) {
                                                    setQuestionCount(prevCount => prevCount + 1);
                                                    setCurrentImages(shuffleArray(questions?.[questionCount]?.images));
                                                } else {
                                                    navigateTo();
                                                }
                                            }}
                                            title="Next"
                                        />
                                    </div>
                                )}
                                <EndButton
                                    onClick={endAssessment}
                                    title={questionCount < questions?.length ? "End Now" : "Finish"}
                                />
                            </div>
                        )}
                    </div>
                )}
                <Loader loading={loading} />
            </main>
        </div>
    );
}

export default QuickReceptive;