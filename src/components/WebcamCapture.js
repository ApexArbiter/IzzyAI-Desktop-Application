import React, { useRef, useState, useEffect } from 'react';

const WebcamCapture = () => {
  const videoRef = useRef(null);
  const [capturedImg, setCapturedImg] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(error => {
        console.error('Error accessing webcam: ', error);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePicture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImg(imageUrl);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Webcam Capture</h1>
      <div style={styles.cameraView}>
        <video ref={videoRef} autoPlay style={styles.camera} />
      </div>
      <button style={styles.captureButton} onClick={takePicture}>Take Picture</button>
      {capturedImg && <img src={capturedImg} alt="Captured" style={styles.capturedImage} />}
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
    marginBottom: '20px',
  },
  cameraView: {
    width: '80%',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  camera: {
    width: '100%',
    height: 'auto',
  },
  captureButton: {
    backgroundColor: 'white',
    borderRadius: '30px',
    padding: '15px',
    fontSize: '16px',
    color: 'black',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  capturedImage: {
    width: '80%',
    borderRadius: '16px',
  },
};

export default WebcamCapture;
