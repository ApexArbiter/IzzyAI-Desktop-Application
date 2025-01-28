import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, Play, Pause, StopCircle } from 'lucide-react';
import { CircleLoader } from 'react-spinners';
import styled, { keyframes } from 'styled-components';
import BaseURL from '../components/ApiCreds';
import { insertSessionData, capitalize, getToken } from "../utils/functions";
import CustomHeader from '../components/CustomHeader';

// Define the wave animation keyframe
const waveAnimation = keyframes`
  0% { height: 10px; }
  50% { height: 25px; }
  100% { height: 10px; }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const MessageGroup = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 10px 0;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  gap: 15px;
`;

const AudioMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: ${props => props.isUser ? '#2DEEAA' : '#F8F8F8'};
  border-radius: 8px;
  max-width: 80%;
`;

const Wave = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 40px;
`;

const WaveLine = styled.div`
  width: 3px;
  height: ${props => props.height}px;
  background-color: ${props => props.isUser ? '#fff' : '#2DEEAA'};
  border-radius: 1px;
  transition: height 0.1s ease;
  animation: ${props => props.isAnimating ? waveAnimation : 'none'} 1s infinite;
  animation-delay: ${props => props.delay}s;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-top: 1px solid #ccc;
  gap: 10px;
`;

const Input = styled.input`
  width: 78%;
  border: 1px solid #ccc;
  border-radius: 40px;
  padding: 8px 15px;
  color: black;
  outline: none;
  
  &:focus {
    border-color: #2DEEAA;
  }
`;

const IconButton = styled.button`
  background-color: ${props => props.primary ? '#2DEEAA' : 'transparent'};
  border-radius: 50%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const MessageText = styled.div`
  padding: 12px;
  border-radius: 8px;
  max-width: 80%;
  background-color: ${props => props.isUser ? '#2DEEAA' : '#F8F8F8'};
  color: ${props => props.isUser ? '#fff' : '#000'};
`;

const DisorderButton = styled.button`
  background-color: white;
  border: 1px solid #2DEEAA;
  border-radius: 6px;
  padding: 12px;
  width: 210px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
    transform: translateY(-1px);
  }
`;

const TherapistName = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([
    { text: 'Welcome to IzzyAI Chatbot.', isUser: false, audio: null },
    { text: 'Click on any of the disorders for quick assessment.', isUser: false, audio: null },
    { text: '1: Articulation', isUser: false, audio: null, path: "quick-articulation" },
    { text: '2: Stammering', isUser: false, audio: null, path: "quick-stammering" },
    { text: '3: Voice', isUser: false, audio: null, path: "quick-voice" },
    { text: '4: Receptive Language', isUser: false, audio: null, path: "quick-receptive" },
    { text: '5: Expressive Language', isUser: false, audio: null, path: "quick-expressive" }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalScore, setModalScore] = useState('');
  const userId = localStorage.getItem('userId');

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(new Audio());
  const chatContainerRef = useRef(null);

  // Audio recording functions
  const onStartRecord = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          sendVoiceMessage(audioBlob);
        };

        mediaRecorderRef.current.start();
        setRecordingStatus('recording');
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const onStopRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
      setRecordingStatus('stopped');
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    setChats(prev => [...prev, { text: '', isUser: true, audio: audioUrl }]);
    setIsLoading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch(`${BaseURL}/audio`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();

        if (data?.Highest_disorder_result) {
          setModalContent(data.Highest_disorder_result.Label);
          setModalScore(data.Highest_disorder_result.Score);
          setShowModal(true);
          setTimeout(() => setShowModal(false), 3000);
        }

        const message = data.response === '' ?
          'Sorry, can you please say it again!' :
          data.response?.slice(4);

        setChats(prev => [...prev, { text: message, isUser: false, audio: null }]);
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      setChats(prev => [...prev, {
        text: 'Sorry, there was an error processing your voice message.',
        isUser: false,
        audio: null
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const message = inputText.trim();
    setInputText('');
    setChats(prev => [...prev, { text: message, isUser: true, audio: null }]);
    setIsLoading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('text', message);

      const response = await fetch(`${BaseURL}/text`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      const aiMessage = data.response === '' || data.response === 'AI:' ?
        'Sorry, I did not understand!' :
        data.response.slice(4);

      setChats(prev => [...prev, { text: aiMessage, isUser: false, audio: null }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChats(prev => [...prev, {
        text: 'Sorry, there was an error processing your message.',
        isUser: false,
        audio: null
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  const navigateto = async (path) => {

    const sessionId = await insertSessionData(userId, 1)

    navigate(`/${path}`, { state: { sessionId } });
  }

  const playAudio = async (audioUrl, index) => {
    try {
      if (playingAudioIndex === index) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlayingAudioIndex(null);
      } else {
        if (playingAudioIndex !== null) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setPlayingAudioIndex(index);

        audioRef.current.onended = () => {
          setPlayingAudioIndex(null);
        };
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudioIndex(null);
    }
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [chats, isLoading]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <Container>
      <CustomHeader title="IzzyAI chatbot" goBack={() => navigate(-1)} />

      <ChatContainer ref={chatContainerRef}>
        {chats.map((chat, index) => (
          <MessageGroup key={index} isUser={chat.isUser}>
            <div className="flex flex-col items-center gap-1">
              <Mic size={24} />
              <span className="text-sm font-bold">{chat.isUser ? 'You' : 'IzzyAI'}</span>
            </div>

            {chat?.path ? (
              <DisorderButton onClick={() => navigateto(chat.path)}>
                {chat.text}
              </DisorderButton>
            ) : chat.audio ? (
              <AudioMessage isUser={chat.isUser}>
                <Wave>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <WaveLine
                      key={i}
                      isUser={chat.isUser}
                      isAnimating={playingAudioIndex === index}
                      delay={i * 0.1}
                      height={15}
                    />
                  ))}
                </Wave>
                <IconButton onClick={() => playAudio(chat.audio, index)}>
                  {playingAudioIndex === index ? <Pause size={20} /> : <Play size={20} />}
                </IconButton>
              </AudioMessage>
            ) : (
              <MessageText isUser={chat.isUser}>
                {capitalize(chat.text)}
              </MessageText>
            )}
          </MessageGroup>
        ))}

        {isLoading && (
          <MessageGroup>
            <div className="flex flex-col items-center gap-1">
              <Mic size={24} />
              <span className="text-sm font-bold">IzzyAI</span>
            </div>
            <MessageText>
              <CircleLoader size={30} color="#2DEEAA" />
            </MessageText>
          </MessageGroup>
        )}
      </ChatContainer>

      <InputContainer>
        {recordingStatus === 'recording' ? (
          <Wave style={{ flex: 1 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <WaveLine
                key={i}
                isAnimating={true}
                delay={i * 0.1}
                height={15}
              />
            ))}
          </Wave>
        ) : (
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={40}
            placeholder="Type message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
        )}

        {inputText === '' ? (
          <IconButton
            onClick={recordingStatus === 'recording' ? onStopRecord : onStartRecord}
            primary={recordingStatus === 'recording'}
          >
            {recordingStatus === 'recording' ? <StopCircle size={20} /> : <Mic size={20} />}
          </IconButton>
        ) : (
          <IconButton primary onClick={sendMessage}>
            <Send size={20} />
          </IconButton>
        )}
      </InputContainer>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <h3 className="text-lg mb-2">You have</h3>
            <h2 className="text-xl font-bold mb-2">{modalContent}</h2>
            <h2 className="text-xl font-bold">Score: {modalScore}</h2>
          </div>
        </div>
      )}
    </Container>
  );
};

export default TherapistName;