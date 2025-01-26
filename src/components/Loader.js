import React from 'react';
import ReactDOM from 'react-dom'; // React Portal for modals

const Loader = ({ loading }) => {
  if (!loading) return null;

  return ReactDOM.createPortal(
    <div style={styles.modalBackground}>
      <div style={styles.activityIndicatorWrapper}>
        <div style={styles.spinner}></div>
      </div>
    </div>,
    document.body // This ensures the modal is rendered outside the normal DOM flow
  );
};

// Styles using const
const styles = {
  modalBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    zIndex: 1000, // Ensure it appears above other content
  },
  activityIndicatorWrapper: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)', // Light background for the spinner
    borderTop: '4px solid #111920', // Dark color for the spinner
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite', // Rotation animation
  },
};

// CSS Animation for spinner
const stylesKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject keyframes into the document head for animation support
const styleTag = document.createElement('style');
styleTag.innerHTML = stylesKeyframes;
document.head.appendChild(styleTag);

export default Loader;
