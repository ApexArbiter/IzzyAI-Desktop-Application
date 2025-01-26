import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ source, onEnd, onStart, videoHeight }) => {
  const videoRef = useRef(null); // Create a reference for the video element

  // Handle video end and start events
  useEffect(() => {
    console.log(source);
    const videoElement = videoRef.current;

    // Attach event listeners
    if (videoElement) {
      videoElement.addEventListener('ended', () => {
        if (onEnd) {
          onEnd(); // Trigger onEnd callback
        }
      });
      
      videoElement.addEventListener('play', () => {
        if (onStart) {
          onStart(); // Trigger onStart callback when video starts
        }
      });
    }

    return () => {
      // Cleanup event listeners when the component is unmounted
      return () => {
        if (videoElement) {
          // Update to use the callback functions
          videoElement.removeEventListener('ended', () => onEnd?.());
          videoElement.removeEventListener('play', () => onStart?.());
        }
      };
    };
  }, [onEnd, onStart]); // Dependency array to reattach event listeners if the callbacks change

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '20px' }}>
      <video
        ref={videoRef} // Reference to the video element
        src={source}
        style={{ maxWidth: '100%', height: videoHeight || 'auto', borderRadius: '8px' }}
        controls
        width="300"
        height="200"
        autoPlay // Automatically starts the video
      />
    </div>
  );
};

export default VideoPlayer;
