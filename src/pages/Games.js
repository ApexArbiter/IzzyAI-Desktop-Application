import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';

const Games = () => {
  const location = useLocation();
  const { url } = location.state || {};
  const { userId } = useDataContext();
  const [hasError, setHasError] = useState(false);
  const [micPermission, setMicPermission] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!url) {
      setHasError(true);
      return;
    }
    
    // Request microphone permission when component mounts
    requestMicrophonePermission();
  }, [url]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermission('denied');
      setHasError(true);
    }
  };

  const handleError = (error) => {
    setHasError(true);
    console.error('WebView Error:', error);
  };

  const renderContent = () => {
    if (hasError) {
      return (
        <div className="text-red-500 text-center mt-5 p-4">
          Something went wrong while loading the game. Please try again.
        </div>
      );
    }

    if (micPermission === 'denied') {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="text-red-500 text-center mb-4">
            Microphone access is required to play this game.
          </div>
          <div className="text-gray-700 text-center mb-4">
            Please enable microphone access in your browser settings and reload the page.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return (
      <iframe
        src={url}
        className="w-full h-full"
        title="Game WebView"
        allow="microphone; autoplay; fullscreen"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
        onError={handleError}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen w-full pt-2">
      {renderContent()}
    </div>
  );
};

export default Games;