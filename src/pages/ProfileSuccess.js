import React, { useEffect } from 'react';
import { useHistory, useNavigate } from 'react-router-dom'; // React Router for navigation
import SuccessIcon from '../assets/SuccessIcon'; // Ensure the success icon component works for React
function ProfileSetupSuccessPage() {
  const history = useNavigate(); // Using React Router's history for navigation

  useEffect(() => {
    const timer1 = setTimeout(() => {
      history('/home'); // Navigate to the Tabs page after 2 seconds
    }, 2000);

    return () => {
      clearTimeout(timer1);
    };
  }, [history]);

  return (
    <div style={styles.safeArea}>
      <div style={styles.mainView}>
        <SuccessIcon />
        <div style={styles.logoContainer}>
          <img
            src={require('../assets/images/logo.png')}
            alt="Logo"
            style={styles.logoImg}
          />
        </div>
        <p style={styles.heading}>
          Your IzzyAI profile has setup successfully
        </p>
      </div>
    </div>
  );
}

const styles = {
  safeArea: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  mainView: {
    textAlign: 'center',
  },
  logoContainer: {
    height: '60px',
    width: '160px',
    marginTop: '15px',
  },
  logoImg: {
    height: '100%',
    width: '100%',
    objectFit: 'contain', // This ensures the image fits well
  },
  heading: {
    fontSize: '24px',
    fontWeight: '500',
    fontFamily: 'Arial, sans-serif', // You can change this to your desired font
    color: '#111920',
    marginTop: '20px',
  },
};

export default ProfileSetupSuccessPage;
