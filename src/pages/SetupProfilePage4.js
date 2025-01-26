import React from 'react';
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import { Button } from '@mui/material'; // Material-UI Button for consistent styling
import BarFilled from '../assets/BarFilled'; // Assuming this is an SVG or image component
import { fonts } from '../theme'; // Assuming the same fonts are used in the web version

const CustomButton = ({ onPress, title }) => {
  return (
    <button onClick={onPress} style={styles.button}>
      <span style={styles.buttonText}>{title}</span>
    </button>
  );
};

function SetupProfilePage4({ match }) {
  const history = useNavigate();

  const navigate = async () => {
    localStorage.setItem('isTerms', JSON.stringify(true));
    history({
      pathname: '/scanfaceInstruction',
      state: {
        routeName: 'baselineQuestions',
        nextPage: 'faceauthenticationscreen',
      },
    });
  };

  const navigateBack = () => {
    history.goBack();
  };

  return (
    <div style={styles.safeArea}>
      <div style={styles.mainView}>
        <div style={styles.imageView}>
          <img
            alt="Logo"
            src={require('../assets/images/logo.png')}
            style={styles.image}
          />
        </div>

        <div style={styles.progressBar}>
          <BarFilled />
          <BarFilled />
          <BarFilled />
          <BarFilled />
          <BarFilled />
        </div>

        <h2 style={styles.heading}>Our Terms & Conditions</h2>

        <div style={{ marginTop: 20 }}>
          <p style={styles.labelText}>
            Finish setting up your profile by thoroughly reading our Terms &
            Conditions
          </p>
        </div>

        <div style={{ marginVertical: 20 }}>
          <p style={styles.base}>
            Consent to Recording: You agree that this product may record audio
            and video for the purpose of speech-language disorder assessment and
            improvement.
          </p>
          <p style={styles.base}>
            Data Usage: Your recorded data may be used to enhance the
            functionality of the product and for research purposes. Your privacy
            will be respected, and your data will not be shared with third
            parties without your consent.
          </p>
          <p style={styles.base}>
            Security Measures: We take your privacy seriously and employ
            industry-standard security measures to protect your data from
            unauthorized access or disclosure.
          </p>
          <p style={styles.base}>
            User Responsibilities: You are responsible for maintaining the
            confidentiality of your account credentials and ensuring the security
            of your device.
          </p>
          <p style={styles.base}>
            Compliance: This product complies with relevant privacy regulations,
            including the General Data Protection Regulation (GDPR) and the
            Health Insurance Portability and Accountability Act (HIPAA), where
            applicable.
          </p>
          <p style={styles.base}>
            Updates: These terms and conditions may be updated from time to
            time. By continuing to use the product, you agree to the updated
            terms.
          </p>
        </div>

        <CustomButton onPress={navigate} title="I agree to Terms & Conditions" />
      </div>
    </div>
  );
}

const styles = {
  safeArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f7f7f7',
    padding: '20px',
  },
  mainView: {
    maxWidth: '800px',
    width: '100%',
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
  },
  imageView: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  image: {
    height: '80px',
    width: 'auto',
  },
  progressBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px',
    marginBottom: '30px',
  },
  base: {
    fontFamily: fonts.regular,
    color: '#111920',
    marginTop: '5px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: '30px',
  },
  labelText: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '5px',
    textAlign: 'center',
  },
  button: {
    borderRadius: '50px',
    backgroundColor: '#111920',
    padding: '10px 20px',
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    cursor: 'pointer',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
};

export default SetupProfilePage4;
