import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import CustomButton from '../components/Button';
import { fonts } from '../theme';

function InstructionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { sessionId, isAll } = location.state || {};  // Access passed state
  console.log(location.state)

  const handleNavigate = () => {
    navigate('/speechArticulationPage', { state: { sessionId, isAll } });
  };

  return (
    <div style={styles.safe_area}>
      <CustomHeader title="Articulation Disorder" goBack={() => navigate(-1)} />

      <div style={styles.main_view}>
        <div style={styles.scrollView}>
          <img
            style={styles.image}
            src={require('../assets/images/mouth.png')}
            alt="Mouth"
          />
          
          <p style={{ ...styles.base, ...styles.heading, textAlign: 'center' }}>
            Assessment Instructions
          </p>
          <div style={{ height: '20px' }} />
          
          <div style={styles.text_row}>
            <span style={{ ...styles.base, fontSize: 14, fontWeight: 400 }}>•</span>
            <p style={{ ...styles.base, fontSize: 14, fontWeight: 400 }}>
              You will be shown some images of random objects. Say the names of each object loud and clearly.
            </p>
          </div>

          <div style={styles.text_row}>
            <span style={{ ...styles.base, fontSize: 14, fontWeight: 400 }}>•</span>
            <p style={{ ...styles.base, fontSize: 14, fontWeight: 400 }}>
              Hit the "Record" button to start answering.
            </p>
          </div>

          <div style={styles.text_row}>
            <span style={{ ...styles.base, fontSize: 14, fontWeight: 400 }}>•</span>
            <p style={{ ...styles.base, fontSize: 14, fontWeight: 400 }}>
              IzzyAl will respond advising whether your answers are correct or incorrect.
            </p>
          </div>

        </div>
        
        <CustomButton
          style={styles.btn}
          onPress={handleNavigate}
          title="Start Now"
        />
      </div>
    </div>
  );
}

const styles = {
  safe_area: {
    flex: 1,
  },
  main_view: {
    flex: 1,
    padding: '20px',
  },
  scrollView: {
    overflowY: 'scroll',
  },
  base: {
    fontFamily: fonts.regular,
    color: '#111920',
  },
  heading: {
    paddingTop: '50px',
    fontSize: '24px',
    fontWeight: '500',
  },
  text_row: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '10px',
  },
  btn: {
    width: '100%',
    marginTop: '60px',
  },
  image: {
    marginTop: '40px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  }
};

export default InstructionsPage;
