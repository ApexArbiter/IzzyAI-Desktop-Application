import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material'; // You can use any button library or HTML button
import CustomHeader from '../components/CustomHeader'; // Assuming it's compatible or adjusted for web
import { fonts } from '../theme';

import CustomButton from '../components/Button';

function LanguageInstructions() {
  const history = useNavigate();
  const location = useLocation();
  const { sessionId, isAll } = location.state || {};  // Accessing params from the location state in React Router
  console.log(location.state)
  const navigate = () => {
    history('/expressive-assessment', { state: { sessionId, isAll } },
    );
  };

  const navigateBack = () => {
    history(-1);
  };

  return (
    <div style={styles.safe_area}>
      <CustomHeader title="Expressive Language Disorder" goBack={navigateBack} />
      <div style={styles.main_view}>
        <div style={styles.scrollView}>
          <img
            style={styles.image}
            src={require('../assets/images/mouth.png')} // Replace with a web-friendly import or path
            alt="Mouth"
          />

          <h1 style={styles.heading}>Assessment Instructions</h1>

          <div style={styles.text_row}>
            <span style={styles.base}>{"\u2B24"}</span>
            <p style={styles.base}>Speak out loud and clearly to answer each question.</p>
          </div>

          <div style={styles.text_row}>
            <span style={styles.base}>{"\u2B24"}</span>
            <p style={styles.base}>Hit the “Record” button to record your voice.</p>
          </div>

          <div style={styles.text_row}>
            <span style={styles.base}>{"\u2B24"}</span>
            <p style={styles.base}>
              IzzyAI will respond advising whether your answer is correct or incorrect.
            </p>
          </div>
        </div>
        <CustomButton onPress={navigate} title="Start Now" />
      </div>
    </div>
  );
}

const styles = {
  safe_area: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#F7F7F7',
    minHeight: '100vh',
  },
  main_view: {
    flex: 1,
    width: '100%',
    maxWidth: '800px',
  },
  scrollView: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 120px)',
  },
  text_row: {
    gap: '10px',
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  base: {
    fontFamily: fonts.regular,
    color: '#111920',
  },
  heading: {
    paddingTop: '50px',
    fontSize: '24px',
    fontWeight: '500',
    textAlign: 'center',
  },
  image: {
    marginTop: '40px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
};

export default LanguageInstructions;
