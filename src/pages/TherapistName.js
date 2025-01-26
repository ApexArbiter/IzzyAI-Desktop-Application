import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactMic } from 'react-mic';
import { Send, Mic, Play, Pause } from 'lucide-react';
import { CircleLoader } from 'react-spinners';
import styled from 'styled-components';
import BaseURL from '../components/ApiCreds';
import { insertSessionData, capitalize, getToken } from "../utils/functions";


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

const Avatar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`;

const AvatarImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`;

const UserName = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: black;
`;

const MessageBubble = styled.div`
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
  background-color: ${props => props.isUser ? '#2DEEAA' : '#F8F8F8'};
`;

const DisorderButton = styled.button`
  background-color: white;
  border: 1px solid #2DEEAA;
  border-radius: 6px;
  padding: 12px;
  width: 210px;
  text-align: left;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
  }
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
  
  &:hover {
    opacity: 0.8;
  }
`;

const WaveContainer = styled.div`
  width: 75%;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 75%;
  max-width: 400px;
  text-align: center;
`;

const TherapistName = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([
    {
      text: 'Welcome to IzzyAI Chatbot.',
      isUser: false,
      audio: null,
    },
    {
      text: 'Click on any of the disorders for quick assessment.',
      isUser: false,
      audio: null,
    },
    {
      text: '1: Articulation',
      isUser: false,
      audio: null,
      path: "quick-articulation",
    },
    {
      text: '2: Stammering',
      isUser: false,
      audio: null,
      path: "quick-stammering",
    },
    {
      text: '3: Voice',
      isUser: false,
      audio: null,
      path: "quick-voice",
    },
    {
      text: '4: Receptive Language',
      isUser: false,
      audio: null,
      path: "quick-receptive",
    },
    {
      text: '5: Expressive Language',
      isUser: false,
      audio: null,
      path: "quick-expressive",
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlay, setAudioPlay] = useState();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('Voice Disorder');
  const [modalScore, setModalScore] = useState('0.0');
  const [audioURL, setAudioURL] = useState('');
  const userId = localStorage.getItem('userId')
  console.log(userId)

  const chatContainerRef = useRef(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = await getToken();
      try {
        const response = await fetch(`${BaseURL}/get_user_profile/${userId}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const userData = await response.json();
        console.log(userData);
        if (userData?.AvatarID) {
          const avatarResponse = await fetch(`${BaseURL}/get_avatar/${userData.AvatarID}`);
          const avatarData = await avatarResponse.json();
          if (avatarData?.AvatarURL) {
            setAvatarUrl(avatarData.AvatarURL);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const onStartRecording = () => {
    setIsRecording(true);
  };

  const onStopRecording = async (recordedBlob) => {
    setIsRecording(false);
    setAudioURL(recordedBlob.blobURL);

    // Handle sending voice message
    await sendVoiceMessage(recordedBlob.blob);
  };

  const sendMessage = async () => {
    if (isLoading || !inputText.trim()) return;

    setChats(prev => [...prev, { text: inputText, isUser: true, audio: null }]);
    setInputText('');
    setIsLoading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('text', inputText);

      const response = await fetch(`${BaseURL}/text`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': 'Bearer ' + token }
      });

      const data = await response.json();
      const message = data.response === '' || data.response === 'AI:'
        ? 'Sorry I did not understand!'
        : data.response.slice(4);

      setChats(prev => [...prev, { text: message, isUser: false, audio: null }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    if (isLoading) return;

    setChats(prev => [...prev, { text: '', isUser: true, audio: audioURL }]);
    setIsLoading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch(`${BaseURL}/audio`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': 'Bearer ' + token }
      });

      const data = await response.json();

      if (data?.Highest_disorder_result) {
        await addChatVoice(
          data.Highest_disorder_result.Label,
          data.Highest_disorder_result.Score
        );
        setModalContent(data.Highest_disorder_result.Label);
        setModalScore(data.Highest_disorder_result.Score);
        setShowModal(true);
        setTimeout(() => setShowModal(false), 3000);
      }

      const message = data.response === ''
        ? 'Sorry, can you please say it again!'
        : data.response?.slice(4);

      setChats(prev => [...prev, { text: message, isUser: false, audio: null }]);
    } catch (error) {
      console.error('Error sending voice message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (audioPath, index) => {
    if (audioPlay === index) {
      audioRef.current.pause();
      setAudioPlay(undefined);
    } else {
      audioRef.current.src = audioPath;
      await audioRef.current.play();
      setAudioPlay(index);
    }
  };

  const onPressDisorders = async (path) => {
    setLoading(true);
    const session = await insertSessionData(userId, 1);
    setLoading(false);
    if (session) {
      navigate(`/${path}`, { state: { sessionId: session || "123" } });
    }
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [chats, isLoading]);

  return (
    <Container>
      <ChatContainer ref={chatContainerRef}>
        {chats.map((chat, index) => (
          <MessageGroup key={index} isUser={chat.isUser}>
            {!chat?.path && (
              <Avatar>
                {/* <AvatarImage
                  src={chat.isUser ? avatarUrl : '/images/microphone.png'}
                  alt={chat.isUser ? 'User' : 'AI'}
                /> */}
                <Mic />
                <UserName>{chat.isUser ? 'You' : 'IzzyAI'}</UserName>
              </Avatar>
            )}

            {chat?.path ? (
              <DisorderButton onClick={() => onPressDisorders(chat.path)}>
                {chat.text}
              </DisorderButton>
            ) : chat.audio ? (
              <MessageBubble isUser={chat.isUser}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <WaveContainer>
                    {/* Add your wave animation component here */}
                  </WaveContainer>
                  <IconButton onClick={() => playAudio(chat.audio, index)}>
                    {audioPlay === index ? <Pause size={20} /> : <Play size={20} />}
                  </IconButton>
                </div>
              </MessageBubble>
            ) : (
              <MessageBubble isUser={chat.isUser}>
                {capitalize(chat.text)}
              </MessageBubble>
            )}
          </MessageGroup>
        ))}

        {isLoading && (
          <MessageGroup>
            <Avatar>
              <AvatarImage src="/images/microphone.png" alt="AI" />
              <UserName>IzzyAI</UserName>
            </Avatar>
            <MessageBubble>
              <CircleLoader size={30} color="#2DEEAA" />
            </MessageBubble>
          </MessageGroup>
        )}
      </ChatContainer>

      <InputContainer>
        {isRecording ? (
          <WaveContainer>
            <ReactMic
              record={isRecording}
              onStop={onStopRecording}
              strokeColor="#2DEEAA"
              backgroundColor="#ffffff"
            />
          </WaveContainer>
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
            onClick={isRecording ? () => setIsRecording(false) : onStartRecording}
          >
            <Mic size={20} />
          </IconButton>
        ) : (
          <IconButton primary onClick={sendMessage}>
            <Send size={20} />
          </IconButton>
        )}
      </InputContainer>

      {showModal && (
        <Modal>
          <ModalContent>
            <h3>You have</h3>
            <h2>{modalContent}</h2>
            <h2>Score: {modalScore}</h2>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default TherapistName;