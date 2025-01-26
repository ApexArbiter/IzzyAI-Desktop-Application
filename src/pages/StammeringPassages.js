import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';  // React Router for navigation
import CustomHeader from '../components/CustomHeader';  // Assuming you have the same component for web

const StammeringPassages = () => {
  const history = useNavigate();  // React Router's useNavigate hook for navigation
  const location = useLocation();
  // Extract sessionId and isAll from location props (assuming they're passed in via routing)
  const { sessionId, isAll } = location.state || {};
  console.log("State:", location.state)

  // DarkButton component
  const DarkButton = ({ onPress, title }) => {
    return (
      <button onClick={onPress} style={styles.darkButton}>
        {title}
      </button>
    );
  };

  // Card component
  const Card = ({ title, onPress }) => {
    return (
      <div style={styles.cardContainer}>
        <div>
          <h2 style={styles.base}>{title}</h2>
        </div>
        <DarkButton onPress={onPress} title="Start" />
      </div>
    );
  };

  return (
    <div style={styles.safeArea}>
      <CustomHeader goBack={() => history(-1)} title="Stammering Passages" />
      <div style={styles.content}>
        <Card
          onPress={() => history('/passagePage', { state: { sessionId, isAll } })}
          title="Grandfather Passage"
        />
        <Card
          onPress={() => history('/passagePage2', { state: { sessionId, isAll } })}
          title="The Rainbow Passage"
        />
      </div>
    </div>
  );
};

export default StammeringPassages;

// Inline styles as a JavaScript object
const styles = {
  base: {
    fontFamily: 'Arial, sans-serif',
    color: '#111920',
  },
  cardContainer: {
    borderWidth: '1px',
    borderColor: '#0cc8e8',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: '30px',
    gap: '20px',
  },
  darkButton: {
    marginLeft: 'auto',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#111920',
    padding: '10px 24px',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
  },
  safeArea: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
};
