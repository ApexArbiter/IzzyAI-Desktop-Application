import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import { getToken } from '../utils/functions';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';

// Button Components
const EndButton = ({ onPress, title }) => (
    <button
        onClick={onPress}
        className="w-[42%] rounded-3xl flex items-center justify-center bg-red-500 p-3 h-[50px]"
    >
        <span className="text-white font-semibold">{title}</span>
    </button>
);

const NextButton = ({ onPress, title }) => (
    <button
        onClick={onPress}
        className="w-[42%] rounded-[50px] flex items-center justify-center bg-[#71D860] p-3 h-[50px]"
    >
        <span className="text-[#111920] font-semibold">{title}</span>
    </button>
);

const PrevButton = ({ onPress, title }) => (
    <button
        onClick={onPress}
        className="w-[42%] rounded-[50px] flex items-center justify-center border border-solid p-3 h-[50px]"
    >
        <span className="text-[#111920] font-semibold">{title}</span>
    </button>
);

// Progress Bar Component
const LinearProgress = ({ value, color }) => (
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

// Main Component
function QuickArticulation({ sessionId }) {
    const navigate = useNavigate();
    const { userId, setArticulationReport } = useDataContext();
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // States
    const [startTime, setStartTime] = useState('');
    const [questionResponse, setQuestionResponse] = useState('');
    const [questions, setQuestions] = useState(null);
    const [questionCount, setQuestionCount] = useState(1);
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

    // Fetch questions from API
    const fetchQuestions = async () => {
        const token = await getToken();
        try {
            setIsLoading(true);
            const response = await fetch(`${BaseURL}/get_artic_quick_assessment`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data) {
                setQuestions(data?.questions);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize audio recording
    const initializeRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                await sendAudio(audioBlob);
                audioChunks.current = [];
            };
        } catch (error) {
            console.error('Error initializing recording:', error);
        }
    };

    // Start recording
    const onStartRecord = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'inactive') {
            mediaRecorder.current.start();
            setRecordingStatus('recording');
        }
    };

    // Stop recording
    const onStopRecord = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            setRecordingStatus('loading');
        }
    };

    // Send audio to server
    const sendAudio = async (audioBlob) => {
        const token = await getToken();
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        formData.append('text', questions?.[questionCount - 1]?.wordtext || '');
        console.log(questions)
        console.log(audioBlob)

        try {
            const response = await fetch(`${BaseURL}/process_speech`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log("Processing speech", data)
            handleResponse(data);

            // Upload audio file
            const uploadFormData = new FormData();
            uploadFormData.append('file', audioBlob, `${userId}_${questionCount}.wav`);

            await fetch(`${BaseURL}/upload_audio_articulation`, {
                method: 'POST',
                body: uploadFormData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setRecordingStatus('stop');
        } catch (error) {
            console.error('Error processing audio:', error);
            setRecordingStatus('idle');
        }
    };

    // Handle server response
    const handleResponse = (data) => {
        if (data?.message === 'Matched') {
            setQuestionResponse('Correct!');
            // updateCorrectAnswers();
        } else {
            setQuestionResponse('Incorrect!');
            // updateIncorrectAnswers();
        }
    };

    // Navigation handlers
    const navigateTo = () => {
        navigate('/result-report', {
            state: {
                sessionId,
                startTime,
                SessiontypId: 1,
                correctAnswers: correctAnswersCount,
                incorrectAnswers: incorrectQuestions.length,
                incorrectQuestions,
                isQuick: true
            }
        });
    };

    const endAssessment = () => {
        setArticulationReport(incorrectQuestions);
        navigateTo();
    };

    // Effects
    useEffect(() => {
        fetchQuestions();
        initializeRecording();
        setStartTime(new Date().toISOString().slice(0, 19).replace('T', ' '));

        return () => {
            if (mediaRecorder.current) {
                const tracks = mediaRecorder.current.stream?.getTracks();
                tracks?.forEach(track => track.stop());
            }
        };
    }, []);

    const percentageCompleted = questions ? (questionCount / questions.length) * 100 : 0;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <header className="bg-white py-4 px-6 border-b">
                <h1 className="text-xl font-semibold text-[#111920]">
                    Quick Articulation Disorder Assessment
                </h1>
            </header>

            <main className="flex-1 p-5">
                <div className="max-w-3xl mx-auto">
                    {/* Progress Section */}
                    <div className="mb-8">
                        <p className="text-lg mb-4">
                            Assessment <span className="font-bold">{questionCount}</span> out of{' '}
                            <span className="font-bold">{questions?.length || 0}</span>
                        </p>

                        <div className="flex items-center gap-4">
                            <LinearProgress value={percentageCompleted / 100} />
                            <span className="text-sm font-medium">{percentageCompleted.toFixed(1)}%</span>
                        </div>
                    </div>

                    {/* Question Image */}
                    <div className="border border-[#0CC8E8] rounded-2xl p-5 flex justify-center mb-8">
                        {questions?.[questionCount - 1] && (
                            <img
                                src={`${IMAGE_BASE_URL}${questions[questionCount - 1].pictureurl}`}
                                alt="Question"
                                className="w-[200px] h-[200px] object-contain"
                            />
                        )}
                    </div>

                    {/* Question Text */}
                    {questions && (
                        <div className="mb-8">
                            <p className="text-lg mb-2">Say this...</p>
                            <p className="text-xl font-semibold">
                                {questions[questionCount - 1]?.wordtext}
                            </p>
                        </div>
                    )}

                    {/* Response */}
                    {recordingStatus === 'stop' && questionResponse && (
                        <div className={`p-4 rounded-lg mb-8 ${questionResponse === 'Correct!' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            <p className="text-lg font-semibold">{questionResponse}</p>
                        </div>
                    )}

                    {/* Recording Interface */}
                    {recordingStatus !== 'stop' && (
                        <div className="flex items-center justify-center gap-4 border-t pt-4 mt-8">
                            <LoaderWave isAnimation={recordingStatus === 'recording'} isDark={true} />

                            <button
                                disabled={recordingStatus === 'loading'}
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

                    {/* Navigation Buttons */}
                    {recordingStatus === 'stop' && (
                        <div className="flex flex-col items-center gap-4 mt-8">
                            {questionCount < (questions?.length || 0) && (
                                <div className="flex justify-between w-full gap-4">
                                    {questionCount !== 1 && (
                                        <PrevButton
                                            onPress={() => {
                                                setRecordingStatus('idle');
                                                setQuestionResponse('');
                                                setQuestionCount(prev => prev - 1);
                                            }}
                                            title="Previous"
                                        />
                                    )}
                                    <NextButton
                                        onPress={() => {
                                            setRecordingStatus('idle');
                                            setQuestionResponse('');
                                            if (questionCount < questions?.length) {
                                                setQuestionCount(prev => prev + 1);
                                            } else {
                                                endAssessment();
                                            }
                                        }}
                                        title="Next"
                                    />
                                </div>
                            )}
                            <EndButton
                                onPress={endAssessment}
                                title={questionCount < (questions?.length || 0) ? "End Now" : "Finish"}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default QuickArticulation;