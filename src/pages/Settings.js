import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material'; // For buttons, you can also use regular HTML buttons if preferred
import GradientChevronRight from '../assets/GradientChevronRight'; // Ensure this component works for the web, or replace it.

function Settings() {
  const { userDetail } = useDataContext();
  const history = useNavigate();

  const useStyles = makeStyles({
    safe_area: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    main_view: {
      padding: '20px',
      flex: 1,
    },
    base: {
      fontFamily: 'Arial, sans-serif', // Assuming `fonts.regular` is equivalent to a system font
      color: '#111920',
    },
    linearGradient: {
      padding: '15px',
      borderRadius: '16px',
      background: 'linear-gradient(90deg, rgba(12, 200, 232, 0.12), rgba(46, 238, 170, 0.12))',
      marginTop: '20px',
    },
    profile_row: {
      display: 'flex',
      alignItems: 'center',
      padding: '20px 0',
    },
    profile_image_view: {
      height: '80px',
      width: '80px',
      borderRadius: '50%',
    },
    profile_image: {
      height: '100%',
      width: '100%',
      borderRadius: '50%',
    },
    text_view: {
      flex: 1,
      marginLeft: '12px',
    },
    image_view: {
      height: '60px',
      width: '40%',
      margin: '0 auto',
    },
    image: {
      height: '100%',
      width: '100%',
    },
  });

  const classes = useStyles();

  const navigateBack = () => {
    history.goBack();
  };

  const navigateToUpdateAvatar = () => {
    history('/UpdateAvatar');
  };

  const navigateToChangePassword = () => {
    history('/ChangePassword');
  };

  return (
    <div className={classes.safe_area}>
      <header>
        <button onClick={navigateBack}>Back</button>
        {/* CustomHeader component in React Native was used for title. Adjust as necessary */}
      </header>

      <div className={classes.main_view}>
        <div className={classes.image_view}>
          <img
            src={require('../assets/images/logo.png')}
            alt="Logo"
            className={classes.image}
          />
        </div>

        <div className={classes.linearGradient}>
          <div className={classes.profile_row}>
            <div className={classes.profile_image_view}>
              <img
                src={userDetail.avatarUrl}
                alt="Profile"
                className={classes.profile_image}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className={classes.text_view}>
              <p style={{ fontSize: '20px', fontWeight: '500' }} title={userDetail.FullName}>
                {userDetail.FullName}
              </p>
              <p style={{ fontSize: '15px', fontWeight: '500' }} title={userDetail.email}>
                {userDetail.email}
              </p>
            </div>
          </div>
        </div>

        <div className={classes.linearGradient}>
          <button
            onClick={navigateToUpdateAvatar}
            style={{ display: 'flex', alignItems: 'center', width: '100%', border: 'none', background: 'transparent', padding: '20px' }}
          >
            <div className={classes.text_view}>
              <p style={{ fontSize: '15px', fontWeight: '500' }}>Update Avatar</p>
            </div>
            <gradientChevronRight /> {/* Ensure this component is compatible with React or replace it with an icon */}
          </button>
        </div>

        <div className={classes.linearGradient}>
          <button
            onClick={navigateToChangePassword}
            style={{ display: 'flex', alignItems: 'center', width: '100%', border: 'none', background: 'transparent', padding: '20px' }}
          >
            <div className={classes.text_view}>
              <p style={{ fontSize: '15px', fontWeight: '500' }}>Change Password</p>
            </div>
            <gradientChevronRight /> {/* Ensure this component is compatible with React or replace it with an icon */}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
