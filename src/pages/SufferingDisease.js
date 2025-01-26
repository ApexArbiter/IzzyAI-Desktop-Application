import React from 'react';
import { useHistory, useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';

const SufferingDisease = () => {

  const { questionReport } = useDataContext();
  const history = useNavigate();

  const handleGetStarted = () => {
    history('/profileSetupSuccess'); // Using react-router-dom for navigation
  };
  const CustomButton = (props) => {
    return (
      <button onClick={() => props.onClick()} style={styles.button}>
        {props.loading ? (
          <div className="spinner" style={styles.spinner}></div> // You can replace with actual spinner component
        ) : (
          <span style={styles.buttonText}>{props.title}</span>
        )}
      </button>
    );
  };

  return (
    <div style={styles.safeArea}>
      <div style={styles.mainView}>
        <div style={styles.imageView}>
          <img
            src={require('../assets/images/logo.png')}
            alt="Izzy AI Logo"
            style={styles.image}
          />
        </div>

        <h2 style={styles.text1}>Suspected Conditions</h2>

        {
          (questionReport?.articulationYes || questionReport?.articulationYes) &&
          ((questionReport?.articulationYes > questionReport?.articulationNo) || !questionReport?.articulationNo) &&
          <p style={styles.text2}>Articulation Disorder</p>
        }
        {
          (questionReport?.stammeringYes || questionReport?.stammeringNo) &&
          ((questionReport?.stammeringYes > questionReport?.stammeringNo) || !questionReport?.stammeringNo) &&
          <p style={styles.text2}>Stammering</p>
        }
        {
          (questionReport?.voiceYes || questionReport?.voiceNo) &&
          ((questionReport?.voiceYes > questionReport?.voiceNo) || !questionReport?.voiceNo) &&
          <p style={styles.text2}>Voice Disorder</p>
        }
        {
          (questionReport?.receptiveYes || questionReport?.receptiveNo) &&
          ((questionReport?.receptiveYes < questionReport?.receptiveNo) || !questionReport?.receptiveYes) &&
          <p style={styles.text2}>Receptive Language Disorder</p>
        }
        {
          (questionReport?.expressiveYes || questionReport?.expressiveNo) &&
          ((questionReport?.expressiveYes < questionReport?.expressiveNo) || !questionReport?.expressiveYes) &&
          <p style={styles.text2}>Expressive Language Disorder</p>
        }

        <p style={styles.text3}>
          Explore our app to find personalized exercise plans, assessments,
          and informative content designed to address common disorder
          concerns. With easy-to-use tools and comprehensive solutions, you can take charge of your linguistic well-being today.
        </p>

        <CustomButton
          onClick={handleGetStarted}
          title="Get Started"
        />
      </div>
    </div>
  );
}

// Defining styles in a constant object
const styles = {
  safeArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  mainView: {
    width: '100%',
    maxWidth: '800px',
  },
  imageView: {
    width: '40%',
    marginTop: '60px',
    marginLeft: 'auto',
    marginRight: 'auto',
    height: '60px',
  },
  button: {
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#111920',
    padding: 10,
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text1: {
    marginTop: '25px',
    fontSize: '30px',
    fontWeight: '700',
    color: '#111920',
  },
  text2: {
    marginTop: '16px',
    fontSize: '25px',
    fontWeight: '600',
    color: '#111920',
  },
  text3: {
    marginTop: '20px',
    fontSize: '15px',
    marginBottom: '30px',
    color: '#111920',
  },
};

export default SufferingDisease;
