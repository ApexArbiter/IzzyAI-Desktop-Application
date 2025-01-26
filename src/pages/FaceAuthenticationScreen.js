import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseURL from '../components/ApiCreds';
import { useDataContext } from '../contexts/DataContext';
import { getToken } from '../utils/functions';

const FaceAuthenticationScreen = () => {
  const navigate = useNavigate(); // Use `navigate` for navigation
  const { userId } = useDataContext();

  const [isFace, setIsFace] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Show or hide alert
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [capturedImg, setCapturedImg] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const takePicture = async () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageUrl = canvas.toDataURL('image/jpeg');
        console.log(imageUrl);
        setCapturedImg(imageUrl);
  
        // Convert base64 to Blob and send it to the API for face detection
        const blob = await base64ToBlob(imageUrl);
        detectFace(blob);
      }
    }
  };
  
  // Function to convert base64 image to Blob
  const base64ToBlob = (base64) => {
    return new Promise((resolve, reject) => {
      const [metadata, base64Data] = base64.split(',');
      const mime = metadata.split(':')[1].split(';')[0];
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
  
      const blob = new Blob(byteArrays, { type: mime });
      resolve(blob);
    });
  };
  
  const detectFace = async (imageBlob) => {
    const formData = new FormData();
    const token = await getToken();
  
    formData.append('file', imageBlob, 'captured-image.jpg'); // Send Blob as file
  
    setIsLoading(true);  // Set loading to true when starting the request
    setShowAlert(true);  // Show alert when loading
    
    try {
      const response = await fetch(BaseURL + '/detect_faces', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      const data = await response.json();
      if (data) {
        const detected = data.message === 'No face detected.' ? false : true;
        setIsFace(detected);
        setAlertMsg(
          detected ? 'Face detected!' : 'Face not detected. Please try again.'
        );
        setIsLoading(false);  // Set loading to false once the request is completed
        setShowAlert(false);  // Hide the alert once the result is shown
      }
    } catch (error) {
      console.error('Error: ', error);
      setIsLoading(false);
      setShowAlert(false);
    }
  };
  
  const navigateToWaitPage = () => {
    setShowAlert(false); // Hide alert when navigating
    navigate('/waitverifyingnew', {
      state: { capturedImg }, // Pass capturedImg inside state
    });
  };

  useEffect(() => {
    // Initialize camera stream only once
    if (!cameraStream) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error('Error accessing camera: ', error);
        });
    }

    return () => {
      // Stop the camera stream when the component unmounts
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]); // Only run this effect once, or when cameraStream changes

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Face Recognition</h1>
      <p style={styles.promptText}>
        Please position your face within the frame and click on take picture.
      </p>

      {showAlert && isLoading && (
        <div style={styles.dialog}>
          <p>Loading...</p>
        </div>
      )}

      <div style={styles.cameraView}>
        <video
          ref={videoRef}
          autoPlay
          style={styles.camera}
          width="100%"
          height="auto"
        />
      </div>

      <div style={styles.captureButtonContainer}>
        {isFace ? (
          <a onClick={navigateToWaitPage} style={styles.dialogButton}>
            Continue
          </a>
        ) : (
          <button style={styles.captureButton} onClick={takePicture}>
            Take Picture
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#111920',
    height: '100vh',
    justifyContent: 'center',
    color: 'white',
    padding: '20px',
  },
  title: {
    fontWeight: 600,
    fontSize: '24px',
    textAlign: 'center',
    marginTop: '20px',
  },
  promptText: {
    fontWeight: 400,
    fontSize: '16px',
    textAlign: 'center',
    marginTop: '20px',
    width: '90%',
    alignSelf: 'center',
  },
  cameraView: {
    marginTop: '20px',
    width: '80%',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: 'auto',
  },
  captureButtonContainer: {
    marginTop: '20px',
  },
  captureButton: {
    backgroundColor: 'white',
    borderRadius: '30px',
    padding: '15px',
    fontSize: '16px',
    color: 'black',
    border: 'none',
    cursor: 'pointer',
  },
  dialog: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    color: 'black',  // Ensure all text inside the dialog is black
  },
  dialogButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default FaceAuthenticationScreen;
