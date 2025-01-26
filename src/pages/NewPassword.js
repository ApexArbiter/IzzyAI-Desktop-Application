import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';  // For navigation
import { Button, TextField, IconButton, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Eye } from 'react-icons/fa'; // Example of a React icon (Eye)
import BaseURL from '../components/ApiCreds';
import { getToken } from '../utils/functions';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    height: '100vh',
  },
  title: {
    color: '#111920',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  inputContainer: {
    width: '100%',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    marginBottom: '10px',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#111920',
    color: '#fff',
    width: '100%',
    padding: '10px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: '20px',
    textAlign: 'center',
  },
  iconContainer: {
    position: 'absolute',
    right: '10px',
  },
});

const NewPassword = ({ location }) => {
  const { email } = location.state || {};
  const classes = useStyles();
  const history = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    clearError();
    const token = await getToken();
    const formData = new FormData();
    formData.append('Email', email);
    formData.append('password', newPassword);
    formData.append('confirmPassword', confirmPassword);

    if (!newPassword || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError(
        'Invalid password. It should contain at least 8 characters, 1 uppercase letter, and 1 special character.'
      );
      return;
    }

    if (!isValidPassword(confirmPassword)) {
      setError(
        'Invalid password. It should contain at least 8 characters, 1 uppercase letter, and 1 special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password and confirm password don't match");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${BaseURL}/update_password`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (data) {
        alert('Password updated!', 'You can login with new password.');
        setIsLoading(false);
        history('/signInPage');
      } else {
        setIsLoading(false);
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating password:', error);
      alert('Error', 'An error occurred while updating password. Please try again.');
    }
  };

  const isValidPassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
    return regex.test(password);
  };

  const clearError = () => {
    setError('');
  };

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>Change Password</h2>
      <div className={classes.inputContainer}>
        <TextField
          label="New Password"
          variant="outlined"
          type={showPass1 ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          className={classes.input}
          onFocus={clearError}
        />
        <IconButton
          className={classes.iconContainer}
          onClick={() => setShowPass1(!showPass1)}
        >
          <Eye />
        </IconButton>
      </div>
      <div className={classes.inputContainer}>
        <TextField
          label="Confirm Password"
          variant="outlined"
          type={showPass2 ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          className={classes.input}
          onFocus={clearError}
        />
        <IconButton
          className={classes.iconContainer}
          onClick={() => setShowPass2(!showPass2)}
        >
          <Eye />
        </IconButton>
      </div>
      {error && <div className={classes.errorText}>{error}</div>}
      <Button
        variant="contained"
        className={classes.button}
        onClick={handleChangePassword}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} color="white" /> : 'Change Password'}
      </Button>
    </div>
  );
};

export default NewPassword;
