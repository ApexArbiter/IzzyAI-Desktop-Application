import React from 'react';
import ArrowLeft from '../assets/ArrowLeft'; // Assuming this is an SVG or component

const CustomHeader = (props) => {
  return (
    <div style={styles.container}>
      <button onClick={() => props.goBack()} style={styles.iconButton}>
        <ArrowLeft />
      </button>
      <span className='font-semibold' style={styles.text}>{props.title}</span>
    </div>
  );
};

const styles = {
  container: {
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative', // Required for centering
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    marginRight: '15px', // Space between icon and text
  },
  text: {
    fontFamily: 'SF-Pro-Display-Regular',
    color: '#111920',
    fontSize: '20px',
    fontWeight: '600',
    position: 'absolute', // Center text
    left: '50%',
    transform: 'translateX(-50%)', // Offset the element by 50% of its width to center it
  },
};

export default CustomHeader;
