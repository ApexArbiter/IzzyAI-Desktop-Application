import React from 'react';

const CustomButton = (props) => {
  return (
    <div style={styles.container}>
      <button onClick={props.onPress} style={styles.button} disabled={props.loading}>
        {props.loading ? (
          <div style={styles.loader}></div> // Simple loader, can replace with a real spinner if desired
        ) : (
          <span style={styles.buttonText}>{props.title}</span>
        )}
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center', // Center horizontally
    alignItems: 'center',     // Center vertically
       // Full viewport height
  },
  button: {
    width: '300px',
    borderRadius: '50px',
    textAlign: 'center',
    backgroundColor: '#111920',
    padding: '10px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '40px',
    marginTop: 'auto',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loader: {
    border: '4px solid #f3f3f3', // Light grey border
    borderTop: '4px solid #111920', // Dark grey top border
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    animation: 'spin 1s linear infinite', // Simple spinning animation
  },
};

export default CustomButton;
