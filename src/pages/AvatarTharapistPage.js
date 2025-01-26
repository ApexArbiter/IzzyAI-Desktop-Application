import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    div,
    button,
    img,
    span,
    SafeAreaView,
    ScrollView,
    Text,
    Platform,
    BackHandler
} from 'react'; // Basic React components for web
import CustomHeader from '../components/CustomHeader';
import { useDataContext } from '../contexts/DataContext';
import ReactPlayer from 'react-player'; // For video playback
import Loader from '../components/Loader'; // Your custom Loader component

const AvatarTherapistName = () => {
    const navigate = useNavigate();
    const { userDetail } = useDataContext();
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [allVideos, setAllVideos] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [questionCount, setQuestionCount] = useState(1);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [disorderVideo, setDisorderVideo] = useState(null);
    const [isVideoEnd, setIsVideoEnd] = useState(false);
    const [timer, setTimer] = useState(5);
    const [counter, setCounter] = useState(100);

    const getAvatars = async () => {
        setLoading(true);
        // Fetch avatars (replace with actual API call for web)
        const response = await getAvatarChats(userDetail?.AvatarID);
        setAllVideos(response);
        let filteredArray = response?.filter(item => item?.wordtext !== 'display');
        let array = [];
        // Filter videos based on word type
        filteredArray?.forEach(item => {
            if (item?.word === 'greetings') array.push(item);
            else if (item?.word === 'articulation_question_1') array.push(item);
            else if (item?.word === 'articulation_question_2') array.push(item);
            else if (item?.word === 'voice_assessment') array.push(item);
            else if (item?.word === 'stammering_question') array.push(item);
        });

        setQuestions(array);
        setLoading(false);
    };

    useEffect(() => {
        getAvatars();
    }, []);

    useEffect(() => {
        let interval;
        interval = setInterval(() => {
            if (isRecording) {
                if (timer > 0) {
                    setTimer(timer - 1);
                }
                if (counter > 0) {
                    setCounter(prevCounter => prevCounter - 20);
                }
                if (timer === 0) {
                    sendVoiceMessage();
                }
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [timer, isRecording]);

    const changeQuestion = () => {
        setQuestionCount(questionCount + 1);
        setIsVideoEnd(false);
        setTimeout(() => {
            setTimer(5);
            setCounter(100);
        }, 1000);
    };

    const sendVoiceMessage = async () => {
        try {
            setLoading(true);
            setIsRecording(false);
            // Call appropriate function to handle voice recording
            const result = await stopRecording(); // Stop recording and process result
            if (questionCount === 5) {
                // Process voice disorder here
                const response = await checkVoiceDisorder(result);
                const percentage = Number(response?.data?.predictions?.['Voice-Disorder']?.substring(0, response?.data?.predictions?.['Voice-Disorder']?.length - 1));
                if (percentage >= 40) {
                    setDisorderVideo(allVideos?.find(item => item?.word === 'Voice_display_video')?.path);
                } else {
                    setDisorderVideo(allVideos?.[0]?.voice_normal);
                }
            } else {
                // Continue changing questions
                changeQuestion();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getVideoUrl = () => {
        if (questionCount === 7) return `${IMAGE_BASE_URL}${questions?.[questionCount - 2]?.ending}`;
        if (disorderVideo) return `${IMAGE_BASE_URL}${disorderVideo}`;
        return `${IMAGE_BASE_URL}${questions?.[questionCount - 1]?.path}`;
    };

    const onEndVideo = () => {
        setIsVideoEnd(true);
        changeQuestion();
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <CustomHeader title="IzzyAI Conversational Avatar" goBack={() => navigate('/therapists')} />
            <div style={styles.main_view}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <div style={styles.video_view}>
                        {getVideoUrl() && (
                            <ReactPlayer
                                url={getVideoUrl()}
                                controls={false}
                                onReady={() => setIsVideoLoading(false)}
                                onError={(error) => console.error(error)}
                                onEnded={onEndVideo}
                                width="100%"
                                height="auto"
                            />
                        )}
                    </div>
                    {questionCount === 6 && questions?.[questionCount - 1]?.imageurl && (
                        <img
                            style={{
                                alignSelf: 'center',
                                marginTop: 30,
                                height: 240,
                                width: '100%',
                            }}
                            src={`${IMAGE_BASE_URL}${questions?.[questionCount - 1]?.imageurl}`}
                            alt="Question Image"
                        />
                    )}
                    <div style={{ height: 20 }} />
                </ScrollView>
            </div>

            {questionCount > 1 && questionCount <7 && isVideoEnd && !disorderVideo && (
                <div style={styles.bottom_view}>
                    <div style={styles.loading_wave}>
                        <Loader isLoading={isRecording} />
                    </div>

                    {!isRecording ? (
                        <button
                            disabled={isVideoLoading || disorderVideo !== null}
                            style={styles.microphoneButton}
                            onClick={startRecording}>
                            <img
                                style={styles.img}
                                src="/path/to/microphone-icon.png"
                                alt="Microphone"
                            />
                        </button>
                    ) : (
                        <div>
                            <span style={{ fontSize: 22, textAlign: 'center', fontWeight: '500' }}>
                                <span style={{ color: '#FC4343' }}>0:0{timer > 0 ? timer : 0}</span>
                            </span>
                            <div style={{ height: 12 }} />
                            <button onClick={sendVoiceMessage}>
                                <CircularProgress
                                              style={{ marginTop: 20 }}
                                              size={60}
                                              thickness={5}
                                              value={counter}
                                              color="#FC4343"
                                              variant="determinate"
                                            />
                                   
                            </button>
                        </div>
                    )}
                </div>
            )}
            {loading && <Loader loading={loading} />}
        </SafeAreaView>
    );
};

const styles = {
    main_view: {
        flex: 1,
        padding: '20px',
        width: '100%',
    },
    video_view: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '40px',
        borderRadius: '20px',
        paddingVertical: '20px',
        width: '80%',
        height: '300px',
        alignSelf: 'center',
    },
    bottom_view: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '10px',
        borderTop: '1px solid #ccc',
        justifyContent: 'center',
        width: '100%',
        gap: '10px',
    },
    loading_wave: {
        width: '75%',
        height: '46px',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '15px',
    },
    microphoneButton: {
        padding: '10px',
        width: '45px',
        height: '40px',
        justifyContent: 'center',
        alignItems: 'center',
    },
    img: {
        marginTop: '0',
        width: '45px',
        height: '45px',
        backgroundColor: '#F0F0F0',
    },
};

export default AvatarTherapistName;
