import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const getRoute = async () => {
      const isOnboarding = localStorage.getItem("isOnboarding");
      // Video duration simulation - you can adjust this timing
      setTimeout(() => {
        if (JSON.parse(isOnboarding)) {
          navigate('/SignIn', { replace: true }); // Go to SignInPage
        } else {
          navigate('/gettingstartone', { replace: true }); // Go to setup profile
        }
      }, 5000); // Adjust this timing based on your video length
    };

    getRoute();
  }, [navigate]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#111920'
    }}>
      <video
        style={{
          position: 'absolute',
          width: '50%',
          height: '50%',
          objectFit: 'contain'
        }}
        autoPlay
        muted
        playsInline
      >
        <source src={require("../assets/videos/splash_video.mp4")} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default SplashScreen