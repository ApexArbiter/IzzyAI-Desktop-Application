import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ source, onEnd, onStart, videoHeight, className }) => {
  const videoRef = useRef(null); // Create a reference for the video element

  // Handle video end and start events
  useEffect(() => {
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
    <div className="h-full  flex items-center justify-center">
      <video
        ref={videoRef}
        src={source}
        className={` h-full object-cover ${className}`}
        controls={false}
        autoPlay
      />
    </div>
  );
};

export default VideoPlayer;
