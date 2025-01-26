import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@rneui/themed';
import BaseURL from '../components/ApiCreds';
import { getToken } from '../utils/functions';
import RNFetchBlob from 'rn-fetch-blob';

const FaceAuthenticationScreenMain = () => {
  const cameraRef = useRef(null);
  const history = useNavigate();
  const [isFace, setIsFace] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalImg, setOriginalImg] = useState(null);
  const [capturedImg, setCapturedImg] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [hack, doHack] = useState(0);

  const newCameraInit = () => {
    setTimeout(() => {
      doHack(1);
    }, 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      try {
        const response = await fetch(`${BaseURL}/get_face_authentication/123`, {
          headers: { 'Authorization': "Bearer " + token },
        });
        const data = await response.json();
        if (data) {
          setImageUrl(data[0].FaceSnapshotURL);
          saveImageToCache(data[0].FaceSnapshotURL);
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
      }
    };

    fetchData();
  }, []);

  const saveImageToCache = async (originalUrl) => {
    try {
      const { config, fs } = RNFetchBlob;
      const { CacheDir } = fs.dirs;
      const parts = originalUrl.split('/');
      const filename = parts[parts.length - 1];
      const cachedFile = await config({
        fileCache: true,
        path: `${CacheDir}/${filename}`,
      }).fetch('GET', originalUrl);

      setOriginalImg('file://' + cachedFile.path());
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      // Simulating camera capture (for web, you would use a webcam API)
      const image = {
        path: '/path/to/captured/image.jpg', // Replace with actual path when integrated with webcam
      };

      setCapturedImg(image.path);
      detectFace(image);
    }
  };

  const detectFace = async (image) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file', {
      uri: 'file://' + image.path,
      type: 'image/jpeg',
      name: 'face.jpg',
    });

    try {
      setIsLoading(true);
      setShowAlert(true);
      const response = await fetch(BaseURL + '/detect_faces', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': "Bearer " + token,
        },
      });
      const data = await response.json();
      if (data) {
        const detected = data.message === 'No face detected.' ? false : true;
        setIsFace(detected);
        setAlertMsg(detected ? 'Face detected!' : 'Face not detected. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const navigate = () => {
    setShowAlert(false);
    history('/waitverifying', {
      originalImg: originalImg,
      capturedImg: capturedImg,
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Face Authentication</h1>
      <p style={styles.promptText}>Please take a picture of your face to authenticate yourself</p>

      <Dialog isOpen={showAlert}>
        {isLoading ? (
          <Dialog.Loading />
        ) : (
          <>
            <Dialog.Title>{alertMsg}</Dialog.Title>
            <Dialog.Actions>
              {isFace ? (
                <Dialog.Button onClick={navigate}>Continue</Dialog.Button>
              ) : (
                <Dialog.Button onClick={() => setShowAlert(false)}>Retry</Dialog.Button>
              )}
            </Dialog.Actions>
          </>
        )}
      </Dialog>

      <div style={styles.cameraView}>
        <video
          ref={cameraRef}
          width="100%"
          height="auto"
          autoPlay
          playsInline
          muted
          style={styles.camera}
          onLoadedMetadata={newCameraInit}
        >
          <source src={imageUrl} type="image/jpeg" />
        </video>
      </div>

      <div style={styles.captureButtonContainer}>
        <button style={styles.captureButton} onClick={takePicture}>
          Take Picture
        </button>
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
    padding: '20px',
  },
  title: {
    color: 'white',
    fontWeight: '600',
    fontSize: '24px',
    textAlign: 'center',
    marginTop: '20px',
  },
  promptText: {
    color: 'white',
    fontWeight: '400',
    fontSize: '16px',
    textAlign: 'center',
    marginTop: '20px',
    width: '90%',
  },
  cameraView: {
    height: '400px',
    width: '90%',
    alignSelf: 'center',
    marginTop: '20px',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  camera: {
    width: '100%',
    height: 'auto',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: '50px',
    alignSelf: 'center',
  },
  captureButton: {
    backgroundColor: 'white',
    borderRadius: '30px',
    padding: '15px',
    fontSize: '16px',
    color: 'black',
  },
};

export default FaceAuthenticationScreenMain;
