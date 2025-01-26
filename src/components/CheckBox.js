import React, { useState } from 'react';

const CheckBox = ({ checked, onPress, title }) => {
  // If not controlled, initialize internal state to manage the checkbox state
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = (event) => {
    const newCheckedState = event.target.checked; // Get the new checked state from the input
    setIsChecked(newCheckedState);

    // Call the parent handler if onPress exists (for controlled components)
    if (onPress) {
      onPress(newCheckedState);
    }
  };

  return (
    <div style={styles.mainView}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        style={styles.checkbox}
        role="checkbox"
        aria-checked={isChecked}
      />
      <span style={styles.title}>{title}</span>
    </div>
  );
};

const styles = {
  mainView: {
    backgroundColor: '#f5f5f5', // Set your background color
    height: '60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 12px',
    marginTop: '12px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px', // Set the size of the checkbox
    height: '20px',
  },
  title: {
    flex: 1,
    marginLeft: '12px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif', // Use your desired font
    color: '#000', // Text color
  },
};

export default CheckBox;
