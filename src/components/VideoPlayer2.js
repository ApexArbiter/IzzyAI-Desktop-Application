import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';

const VideoPlayer = forwardRef(({ source, onEnd, onStart, videoHeight, className, controls = true }, ref) => {
  const videoRef = useRef(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsComplete(true);
      if (onEnd) onEnd();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onStart) onStart();
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [onEnd, onStart]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const newTime = clickPosition * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
  };

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        src={source}
        className={`w-full object-cover rounded-lg ${className || ''}`}
        style={{ height: videoHeight }}
        playsInline
      />
      
      {controls && (
        <div className="absolute bottom-[-30px] left-0 right-2 flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="text-cyan-400 hover:text-cyan-300 transition-colors z-10"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-[#2DEEAA] stroke-[#2DEEAA]" />
            ) : (
              <Play className="w-6 h-6 fill-[#2DEEAA] stroke-[#2DEEAA]" />
            )}
          </button>
          
          <div 
            className="relative w-full h-1 bg-gray-200 cursor-pointer rounded-full"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-[#2DEEAA] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;