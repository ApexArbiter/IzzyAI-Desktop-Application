import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';

const VideoPlayer = forwardRef(({ source, onEnd, onStart, videoHeight }, ref) => {
  const videoRef = useRef(null);
  const [isComplete, setIsComplete] = useState(false);

  useImperativeHandle(ref, () => ({
    stop: () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    seek: (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    resume: async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
        } catch (error) {
          console.error('Video playback failed:', error);
        }
      }
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (video && !isComplete) { // Only autoplay if not complete
      video.load();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Video autoplay failed:', error);
        });
      }
    }
  }, [source, isComplete]);

  const handleVideoEnd = () => {
    if (onEnd) onEnd();
  };

  const handlePlay = () => {
    if (onStart) onStart();
  };

  return (
    <video
      ref={videoRef}
      src={source}
      className="w-full rounded-lg"
      style={{ height: videoHeight }}
      onEnded={handleVideoEnd}
      onPlay={handlePlay}
      autoPlay
      controls
      playsInline
    />
  );
});

export default VideoPlayer;