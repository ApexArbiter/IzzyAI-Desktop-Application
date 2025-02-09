import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';
import {
    getToken,
    checkArticVoice,
    checkVoiceDisorder,
    voiceToText,
    checkStammering
} from '../utils/functions';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import Loader from '../components/Loader';
import CustomHeader from '../components/CustomHeader';

// LoaderWave Component
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

const AvatarTherapistName = () => {
    const navigate = useNavigate();
    const { userDetail } = useDataContext();
    const [isRecording, setIsRecording] = useState(false);
    const [allVideos, setAllVideos] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [questionCount, setQuestionCount] = useState(1);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [disorderVideo, setDisorderVideo] = useState(null);
    const [disorder2, setDisorder2] = useState(null);
    const [isVideoEnd, setIsVideoEnd] = useState(false);
    const [timer, setTimer] = useState(5);
    const [counter, setCounter] = useState(100);
    const [correctArticCount, setCorrectArticCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const videoRef = useRef(null);
    const mediaStreamRef = useRef(null);

    // Clean up function for media resources
    const cleanupMedia = useCallback(() => {
        if (mediaRecorderRef.current) {
            if (mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            mediaRecorderRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }, []);

    useEffect(() => {
        getAvatars();
        return () => {
            cleanupMedia();
        };
    }, []);

    // Handle counter and timer for recording
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                if (timer > 0) {
                    setTimer(prev => prev - 1);
                }
                if (counter > 0) {
                    setCounter(prev => prev - 20);
                }
                if (timer === 0) {
                    sendVoiceMessage();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer, isRecording]);

    // Reset video on question change
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            videoRef.current.load();
            videoRef.current.play().catch(error => {
                console.error('Video play error:', error);
            });
        }
    }, [questionCount, disorderVideo]);

    const getVideoUrl = () => {
        if (questionCount === 7) {
            return questions?.[questionCount - 2]?.ending
                ? `${IMAGE_BASE_URL}${questions[questionCount - 2].ending}`
                : null;
        }
        if (disorderVideo) {
            return `${IMAGE_BASE_URL}${disorderVideo}`;
        }
        return questions?.[questionCount - 1]?.path
            ? `${IMAGE_BASE_URL}${questions[questionCount - 1].path}`
            : null;
    };

    const getAvatars = async () => {
        setLoading(true);
        try {
            const avatars = await fetch(`${BaseURL}/get_conservation_chat/1`, {
                headers: { 'Authorization': `Bearer ${await getToken()}` }
            });
            const data = await avatars.json();

            if (!data) throw new Error('No data received');
            setAllVideos(data);
            console.log(data)

            const filteredArray = data.filter(item => item?.wordtext !== 'display');
            let count = 1;
            let array = [];

            // Process questions in specific order
            ['greetings', 'articulation_question_1', 'articulation_question_2',
                'articulation_question_3', 'voice_assessment', 'stammering_question'].forEach(word => {
                    const found = filteredArray.find(item => item.word === word);
                    if (found) {
                        array.push(found);
                        count++;
                    }
                });
            console.log(array)

            setQuestions(array);
        } catch (error) {
            console.error('Error fetching avatars:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeQuestion = () => {
        setQuestionCount(prev => prev + 1);
        setIsVideoEnd(false);
        setTimeout(() => {
            setTimer(5);
            setCounter(100);
        }, 1000);
    };

    const onStartRecord = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            console.error('Media devices API not available');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                await handleRecordedAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const sendVoiceMessage = async () => {
        setIsRecording(false);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        cleanupMedia();
    };

    const handleRecordedAudio = async (audioBlob) => {
        try {
            setLoading(true);
            if (questionCount > 1 && questionCount < 5) {
                console.log(allVideos?.find(item => item?.word === 'Articulation_disorder_video')?.path);
                console.log(questions?.[questionCount - 1]?.wordtext);
                console.log(audioBlob);

                const response = await checkArticVoice(audioBlob, questions?.[questionCount - 1]?.wordtext);
                console.log(response);
                console.log(response?.message?.toLowerCase() === 'matched');

                let finalCount;
                if (response?.message?.toLowerCase() === 'matched') {
                    finalCount = correctArticCount + 1;
                    setCorrectArticCount(finalCount);
                }

                if (questionCount === 4) {
                    const url = finalCount >= 2
                        ? allVideos?.[0]?.articulation_normal
                        : allVideos?.find(item => item?.word === 'Articulation_disorder_video')?.path;

                    setTimeout(() => {
                        setIsVideoEnd(false);
                        setDisorderVideo(url);
                    }, 1000);
                } else {
                    changeQuestion();
                }
            } else if (questionCount === 5) {
                const response = await checkVoiceDisorder(audioBlob);
                console.log(response)
                const percentage = Number(
                    response?.predictions?.['Voice-Disorder']?.substring(
                        0,
                        response?.predictions?.['Voice-Disorder']?.length - 1
                    )
                );
                console.log(percentage)

                if (percentage >= 40) {
                    setTimeout(() => {
                        setIsVideoEnd(false);
                        setDisorderVideo(allVideos?.find(item => item?.word === 'Voice_display_video')?.path);
                    }, 1000);
                } else {
                    setDisorderVideo(allVideos?.[0]?.voice_normal);
                }
            } else if (questionCount === 6) {
                const textResponse = await voiceToText(audioBlob);
                console.log("voice to text:", textResponse)
                const stammeringResponse = await checkStammering(audioBlob);
                console.log("stammering", stammeringResponse)
                const answers = questions?.[questionCount - 1]?.answer?.split(";");

                const isMatched = answers?.find(item =>
                    item?.trim()?.toLowerCase() === textResponse?.transcription?.toLowerCase() + "."
                );

                if (isMatched && stammeringResponse?.stuttering < 40) {
                    setDisorderVideo(allVideos?.[0]?.stammering_normal);
                    setDisorder2(allVideos?.[0]?.expressive_normal);
                } else if (isMatched && stammeringResponse?.stuttering >= 40) {
                    setIsVideoEnd(false);
                    setDisorderVideo(allVideos?.find(item => item?.word === 'stammering_display_video')?.path);
                    setDisorder2(allVideos?.[0]?.expressive_normal);
                } else if (!isMatched && stammeringResponse?.stuttering < 40) {
                    setIsVideoEnd(false);
                    setDisorderVideo(allVideos?.find(item => item?.word === 'expressive_display_video')?.path);
                    setDisorder2(allVideos?.[0]?.stammering_normal);
                } else {
                    setIsVideoEnd(false);
                    setDisorderVideo(allVideos?.find(item => item?.word === 'stammering_display_video')?.path);
                    setDisorder2(allVideos?.find(item => item?.word === 'expressive_display_video')?.path);
                }
            }
        } catch (error) {
            console.error('Error processing audio:', error);
        } finally {
            setLoading(false);
            setTimer(5);
            setCounter(100);
        }
    };

    const onEndVideo = () => {
        setIsVideoEnd(true);
        if (questionCount === 1) {
            changeQuestion();
        } else if (questionCount === 7) {
            setTimeout(() => {
                navigate("/AvatarTherapistName");
            }, 1000);
        } else if (questionCount === 6 && disorder2) {
            setDisorderVideo(disorder2);
            setDisorder2(null);
        } else if (disorder2 && disorderVideo && disorder2 === disorderVideo && questionCount === 6) {
            setDisorderVideo(null);
            setDisorder2(null);
            changeQuestion();
        } else if (disorderVideo) {
            setDisorderVideo(null);
            changeQuestion();
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#fafcf9]">
        <CustomHeader title="IzzyAI Conversational Avatar" goBack={() => navigate(-1)} />
      
        <main className="flex-1 p-5">
          <div className="max-w-3xl mx-auto space-y-10 mt-16">
         {/* Video Container */}
<div className="aspect-video w-full max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-500px)] lg:max-h-[calc(100vh-600px)] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
  {getVideoUrl() && (
    <video
      ref={videoRef}
      src={getVideoUrl()}
      className="w-full h-full object-contain"
      onLoadStart={() => setIsVideoLoading(true)}
      onLoadedData={() => setIsVideoLoading(false)}
      onEnded={onEndVideo}
      autoPlay
      playsInline
      controls={false}
    />
  )}
</div>

{/* Image Container */}
{questionCount === 6 && questions?.[questionCount - 1]?.imageurl && (
  <div className="aspect-video w-full max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-500px)] lg:max-h-[calc(100vh-600px)] flex items-center justify-center rounded-lg overflow-hidden mb-4">
    <img
      src={`${IMAGE_BASE_URL}${questions[questionCount - 1].imageurl}`}
      alt="Question"
      className="w-full h-full object-contain"
    />
  </div>
)}

      
            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full flex justify-center">
              {questionCount > 1 && questionCount < 7 && isVideoEnd && !disorderVideo && !disorder2 && (
                <div className="flex items-center justify-center gap-4 border-t pt-4">
                  {!isRecording ? (
                    <button
                      disabled={isVideoLoading || disorderVideo !== null}
                      onClick={onStartRecord}
                      className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      <img height={44} width={44} src={require("../assets/images/microphone.png")} />
                    </button>
                  ) : (
                    <div className="text-center flex items-center">
                      <p className="text-2xl font-medium mb-4 pr-2">
                        <span className="text-red-500">0:0{timer > 0 ? timer : 0}</span>
                      </p>
                      <motion.button
                        onClick={sendVoiceMessage}
                        className="w-12 mb-2 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <span className="w-8 h-8 bg-white rounded-sm" />
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      
        <Loader loading={loading} />
      </div>
      
    );
};

export default AvatarTherapistName;