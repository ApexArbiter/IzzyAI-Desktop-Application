import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BaseURL from '../components/ApiCreds';
import { Dialog } from '@mui/material';
import { useDataContext } from '../contexts/DataContext';
import { getToken } from '../utils/functions';

const WaitVerifyingNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { capturedImg } = location.state || {}; // assuming capturedImg is passed as state

  const [showAlert, setShowAlert] = useState(false);
  const alertMsg = 'Retry! Something went wrong with your face!';
  const User = () => localStorage.getItem("userId");
  const userId  = User();

  useEffect(() => {
    const sendImageToServer = async (image) => {
        try {
          const token = await getToken(); // Make sure the token is valid
          const userId = localStorage.getItem("userId"); // Retrieve user ID from localStorage
          const formData = new FormData();
          
          // Convert base64 image to Blob
          const blob = await base64ToBlob(image);
      
          // Append image and user ID to the form data
          formData.append('FaceSnapshot', blob);
          formData.append('UserID', userId);
      
          // Send POST request to the server with the image and user ID
          const response = await fetch('http://154.38.160.197:5000/add_face_authentication', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': 'Bearer ' + token,
            },
          });
      
          const data = await response.json(); // Get the response from the server
      
          if (data.FaceAuthId) {
            // Successfully received FaceAuthId, navigate to the next page
            navigate('/baselineQuestions');
          } else {
            // Show error message if FaceAuthId is not returned
            setShowAlert(true);
          }
        } catch (error) {
          console.error('Error sending image to the server:', error);
          setShowAlert(true); // Show the retry alert if an error occurs
        }
      };
            

    if (capturedImg) {
      sendImageToServer(capturedImg);
    }
  }, [capturedImg, userId, navigate]);

  const navigateBack = () => {
    setShowAlert(false);
    navigate(-1); // Go back to the previous page
  };
  const base64ToBlob = (base64, mimeType = 'image/jpeg') => {
    return new Promise((resolve, reject) => {
      const [metadata, base64Data] = base64.split(',');
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
  
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
  
      const blob = new Blob(byteArrays, { type: mimeType });
      resolve(blob);
    });
  };
  
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4' }}>
      <div style={{ textAlign: 'center' }}>
        <Dialog open={showAlert} onClose={navigateBack}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>{alertMsg}</h2>
            <button onClick={navigateBack} style={styles.retryButton}>Retry</button>
          </div>
        </Dialog>
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <div className="spinner" style={styles.spinner}></div>
          <h2 style={styles.text}>Please wait, we're verifying</h2>
        </div>
      </div>
    </div>
  );
};

const styles = {
  text: {
    fontFamily: 'Arial, sans-serif',
    color: '#111920',
    marginTop: 16,
    fontSize: 30,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  spinner: {
    border: '16px solid #f3f3f3',
    borderTop: '16px solid skyblue',
    borderRadius: '50%',
    width: '100px',
    height: '100px',
    animation: 'spin 2s linear infinite',
  },
};

export default WaitVerifyingNew;
