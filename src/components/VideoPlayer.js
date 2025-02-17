import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const VideoPlayer = ({ source, onEnd, onStart, className, controls = false }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
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
    <div className="relative w-48">
      <video
        ref={videoRef}
        src={source}
        className={`w-full object-cover ${className}`}
        playsInline
        autoPlay
      />
      
      {controls && (
        <div className="absolute bottom-[-24px] left-0 right-2 flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="text-cyan-400 hover:text-cyan-300 transition-colors z-10"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-cyan-500 stroke-cyan-400" />
            ) : (
              <Play className="w-6 h-6 fill-cyan-400 stroke-cyan-400" />
            )}
          </button>
          
          <div 
            className="relative w-full h-1 bg-gray-200 cursor-pointer rounded-full"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;