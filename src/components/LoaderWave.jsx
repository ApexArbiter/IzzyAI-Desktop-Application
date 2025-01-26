import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoaderWave = ({ isAnimation, isDark }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const animationVariants = {
    start: { scaleY: 1 },
    end: { scaleY: 0.3 },
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  useEffect(() => {
    setIsAnimating(isAnimation);
  }, [isAnimation]);

  const renderLine = (index) => (
    <motion.div
      key={index}
      initial="start"
      animate={isAnimating ? "end" : "start"}
      variants={animationVariants}
      transition={{
        repeat: Infinity,
        repeatType: 'loop',
        duration: 0.5,
        delay: index * 0.15,
      }}
      style={{
        backgroundColor: isDark ? '#000' : '#fff',
        height: isAnimating ? '40px' : '5px',
        width: '2px',
        marginRight: '4px',
      }}
    />
  );

  return (
    <div style={styles.container}>
      <div style={styles.loader}>
        {[...Array(30)].map((_, index) => renderLine(index))}
      </div>
      {/* Uncomment the button to toggle animation */}
      {/* <button onClick={toggleAnimation} style={styles.button}>
        {isAnimating ? 'Stop' : 'Start'} Animation
      </button> */}
    </div>
  );
};

const styles = {
  container: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '70px',
  },
  loader: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    marginTop: '20px',
    backgroundColor: '#4caf50',
    padding: '10px',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
  },
};

export default LoaderWave;
