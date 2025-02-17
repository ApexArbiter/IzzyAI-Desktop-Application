import {Platform} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';

const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
});

const MICROPHONE_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.MICROPHONE,
  android: PERMISSIONS.ANDROID.RECORD_AUDIO,
});

const requestPermissions = async () => {
  try {
    const cameraStatus = await request(CAMERA_PERMISSION);
    const microphoneStatus = await request(MICROPHONE_PERMISSION);
    // Handle the permission status responses
    // Perform actions based on the permission status
    if (cameraStatus === 'granted' && microphoneStatus === 'granted') {
      return true
      // Proceed with using camera and microphone
    } else {
      return false
      // Handle denied or restricted permissions
    }
  } catch (error) {
    return false
    // Handle error in permission request
    console.error('Permission Request Error:', error);
  }
};

export default requestPermissions;
