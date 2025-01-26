import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { CircularProgress, Button } from '@mui/material'; // Material UI components for web
import CustomHeader from '../components/CustomHeader'; // Assuming this component is compatible with web

// Progress text for left and right circular progress bars
const ProgressTextLeft = (fill) => (
  <div style={{ textAlign: 'center', color: '#FC4343', fontWeight: '500', fontSize: '24px' }}>
    {Math.round(fill)}%
  </div>
);

const ProgressTextRight = (fill) => (
  <div style={{ textAlign: 'center', color: '#71D860', fontWeight: '500', fontSize: '24px' }}>
    {Math.round(fill)}%
  </div>
);

function SetupProfilePage3({ location }) {
  const { videoQualityPercentage, audioQualityPercentage } = location.state;
  const [passed, setPassed] = useState(false);
  const history = useNavigate();

  useEffect(() => {
    const checkQuality = () => {
      if (videoQualityPercentage >= 40 && audioQualityPercentage >= 10) {
        setPassed(true);
      } else {
        setPassed(false);
      }
    };
    checkQuality();
  }, [videoQualityPercentage, audioQualityPercentage]);

  const navigate = () => {
    if (passed) {
      history('/setupProfile4', location.state);
    } else {
      history.goBack();
      alert(
        "Please try again to pass Camera/Microphone test.\nPlease say the sentence loud and close to the microphone."
      );
    }
  };

  const navigateBack = () => {
    history.goBack();
  };
  const useStyles = {
    safe_area: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    main_view: {
      padding: '20px',
      flex: 1,
    },
    image_view: {
      height: '80px',
      width: '40%',
      margin: '0 auto',
    },
    image: {
      height: '100%',
      width: '100%',
    },
    base: {
      fontFamily: 'Arial, sans-serif',
      color: '#111920',
      textAlign: 'center',
    },
    heading: {
      paddingTop: '30px',
      fontSize: '24px',
      fontWeight: '500',
    },
    labelText: {
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '5px',
      maxWidth: '350px',
      margin: '0 auto',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-evenly',
      width: '100%',
      marginTop: '60px',
    },
    button: {
      width: '40%',
      borderRadius: '50px',
      textAlign: 'center',
      padding: '10px',
      height: '50px',
      fontWeight: '600',
    },
  };
  
  // Now, you can use these styles directly
  const classes = useStyles;;

  return (
    <div className={classes.safe_area}>
      <CustomHeader title="Setup Profile" goBack={navigateBack} />
      <div className={classes.main_view}>
        <div className={classes.image_view}>
          <img
            src={require('../assets/images/logo.png')}
            alt="Logo"
            className={classes.image}
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <div style={{ flex: 1, backgroundColor: '#FC4343', height: '4px' }} />
          <div style={{ flex: 1, backgroundColor: '#FC4343', height: '4px' }} />
          <div style={{ flex: 1, backgroundColor: '#FC4343', height: '4px' }} />
          <div style={{ flex: 1, backgroundColor: '#FC4343', height: '4px' }} />
          <div style={{ flex: 1, backgroundColor: '#D8D8D8', height: '4px' }} />
        </div>

        {passed ? (
          <div className={classes.heading}>Congratulations! Your camera passed the test!</div>
        ) : (
          <div className={classes.heading}>
            Oops! Your Camera/Microphone didn’t qualify the test
          </div>
        )}

        <div style={{ width: '100%', marginTop: '30px' }}>
          {passed ? (
            <div className={classes.labelText}>Your camera is good to go! You can now proceed to the next step</div>
          ) : (
            <div className={classes.labelText}>
              Try cleaning up your Camera/Microphone or use a different Smartphone in order to use IzzyAI
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '20px' }}>
            <div style={{ width: '150px' }}>
              <CircularProgress
                variant="determinate"
                value={videoQualityPercentage || 0}
                size={150}
                thickness={5}
                style={{ color: '#FC4343' }}
              />
              <div style={{ fontSize: '14px', marginTop: '10px' }}>Camera Score</div>
            </div>

            <div style={{ width: '150px' }}>
              <CircularProgress
                variant="determinate"
                value={audioQualityPercentage || 0}
                size={150}
                thickness={5}
                style={{ color: '#71D860' }}
              />
              <div style={{ fontSize: '14px', marginTop: '10px' }}>Microphone Score</div>
            </div>
          </div>
        </div>

        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            color="secondary"
            onClick={navigateBack}
            className={classes.button}
          >
            Retry
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={navigate}
            className={classes.button}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SetupProfilePage3;
