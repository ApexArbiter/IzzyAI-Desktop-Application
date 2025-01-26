import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { COLORS } from '../theme';
import EyeOnIcon from '../assets/EyeOnIcon'; // Assuming EyeOnIcon is an image or SVG

const InputField = ({ 
  style = {}, 
  value = '', 
  onChange, 
  placeholder = '', 
  type = 'text', 
  isPassword = false, 
  LeftIcon = null 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ ...styles.main_view, ...style }}>
      {LeftIcon && (
        <>
          <LeftIcon />
          <div style={{ width: '12px' }} />
        </>
      )}
      <input
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        placeholder={placeholder}
      />
      {isPassword && (
        <button
          onClick={() => setShowPassword(!showPassword)}
          style={styles.icon_view}
        >
          <EyeOnIcon />
        </button>
      )}
    </div>
  );
};

InputField.propTypes = {
  style: PropTypes.object,
  value: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  isPassword: PropTypes.bool,
  LeftIcon: PropTypes.elementType,
};

export default InputField;

const styles = {
  main_view: {
    backgroundColor: COLORS.input_background_color,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '50px',
    borderRadius: '6px',
    marginTop: '12px',
    padding: '12px',
  },
  input: {
    flex: 1,
    color: COLORS.text_black_color,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
  },
  icon_view: {
    height: '40px',
    width: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};
