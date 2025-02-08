import axios from 'axios';
import BaseURL from '../components/ApiCreds';
import { GoogleSignin } from 'react-google-login';;


export const IOS_WEB_CLIENT_ID = '706390797729-snqc8gd1oj6fu0dcul3i11haf3idgilq.apps.googleusercontent.com'
export const ANDROID_WEB_CLIENT_ID = '706390797729-85md6jkel2bjls4n0pr7fjhaarcorltg.apps.googleusercontent.com'
export const WEB_CLIENT_ID = '706390797729-qor82i4f9qlecrg5tdb4mmipleethu7r.apps.googleusercontent.com'

export const getToken = () => localStorage.getItem("token")
export const setToken = (token) => localStorage.setItem("token",token)

export const getExpressiveQuestions = async (id, avatar) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_questions_expressive_assessment_latest/${id}/${avatar}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getExpressiveExerciseQuestions = async (id, avatar) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_expressive_exercise_questions_latest/${id}/1`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getExpressiveAllExerciseQuestions = async (id, avatar) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/expressive_show_full_exercise/${id}/1`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getQuickExpressiveQuestions = async id => {
  const token = getToken()
  try {
    const response = await axios.get(
      `http://154.38.160.197:5000/expressive_quick_assessment/${id}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getReceptiveQuestions = async (id, avatar) => {
  const token = getToken()
  console.log(id, avatar);
  try {
    const response = await axios.get(
      `${BaseURL}/questions_receptive_random/${id}/${avatar}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getReceptiveExerciseQuestions = async (id, avatar) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/exercise_questions_based_on_performance/${id}/${avatar}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getReceptiveAllExerciseQuestions = async (id, avatar) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/receptive_show_full_exercise/${id}/1`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getQuickReceptiveQuestions = async id => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/receptive_quick_assessment/${id}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getArticulationAllExerciseQuestions = async (id) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/articulation_show_full_exercise/${id}/1`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data?.length > 0) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getSessionDetail = async id => {

  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_session_details/${id}/1/1`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data) {
      return response?.data;
    }
    return response;
  } catch (error) {
    return error?.data;
  }
};
export const matchExpressiveAnswer = async data => {
  const token = getToken()
  try {
    const response = await axios.post(
      `${BaseURL}/api/match_answer`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    if (response?.data) {
      return response?.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};
export const evaluateExpressiveQuestion = async data => {
  const token = getToken()
  try {
    const response = await axios.post(
      `${BaseURL}/api/evaluate`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': "Bearer " + token
        },
      },
    );
    if (response?.data?.expression) {
      return response?.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};
export const detectExpression = async (formData) => {
  try {

    const token = getToken(); // Get the authorization token
    const response = await fetch(`${BaseURL}/detect_expression`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Add the authorization header
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Expression API full response:", data);
    return data;
  } catch (error) {
    console.error('Error detecting expression:', error);
    return null;
  }
};
export const analyzeUserAudio = async data => {
  const token = getToken()
  try {
    const response = await axios.post(
      `${BaseURL}/analyze_audio`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': "Bearer " + token
        },
      },
    );
    if (response?.data) {
      return response?.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};
export const insertSessionData = async (userId, id) => {
  const token = getToken()
  try {
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('SessionTypeID', id);

    const response = await axios.post(
      `${BaseURL}/insert_session_first_data`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': "Bearer " + token
        },
      },
    );
    if (response?.data?.SessionID) {
      return response?.data?.SessionID
    } else {
      return null
    }
  } catch (error) {
    return null
  }
};
export const endSession = async (id, startTime, status, disorderid) => {
  const token = getToken()

  const currentEndTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  const formData = new FormData()
  formData.append('SessionID', id);
  formData.append('StartTime', String(startTime));
  formData.append('EndTime', String(currentEndTime));
  formData.append('SessionStatus', status);
  formData.append('DisorderID', disorderid);

  try {
    const response = await axios.put(
      `${BaseURL}/second_session_update/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': "Bearer " + token
        },
      },
    );
    return response
  } catch (error) {
    return null
  }
};
export const getReports = async id => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_report/${id}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getGameReports = async id => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_game_reports/${id}/1`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getQuickReports = async id => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_quick_report/${id}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getAvatarChats = async id => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_conservation_chat/${id}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const getStammeringAvatar = async id => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_stammering_avatar/${id}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );
    if (response?.data) {
      return response?.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};
export const checkArticVoice = async (audioBlob, word) => {
  try {
    const token = getToken();
    const formData = new FormData();

    // Log the audio blob details for debugging
    console.log('Processing audio:', {
      size: audioBlob.size,
      type: audioBlob.type
    });

    formData.append('audio', audioBlob, 'recorded_audio.wav');
    formData.append('text', word || '');

    const response = await fetch(`${BaseURL}/process_speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    // Log the raw response for debugging
    console.log('Server response:', response);

    // Parse the response
    const result = await response.json();
    console.log('Processing speech response:', result);
    return result;
  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      requestConfig: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    };

    console.error('Detailed error information:', errorDetails);

    // Provide more specific error messages based on the error type
    if (error.response?.status === 500) {
      throw new Error('Server processing error. Please try again or contact support if the issue persists.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please check your connection and try again.');
    } else {
      throw new Error(`Speech processing failed: ${error.response?.data?.message || error.message}`);
    }
  }
};



export const checkVoiceDisorder = async (audioPath) => {
  try {
    const formData = new FormData();
    formData.append('audio', new File([audioPath], 'sound.wav', { type: 'audio/wav' }));

    const token = getToken();
    const response = await fetch(
      `${BaseURL}/predict_voice_disorder`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      }
    );
    const data = await response.json();
    return data
  } catch (error) {
    return null
  }
};
export const voiceToText = async (audioPath) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('audio', audioPath, 'sound.wav');

  try {
    const response = await fetch(`${BaseURL}/api/voice_to_text`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        Authorization: "Bearer " + token
      },
      // Remove Content-Type header to let the browser set it with the boundary
    });
    console.log(response)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    const data = JSON.parse(result);
    return data
  } catch (error) {
    return null
  }
};
export const checkStammering = async (audioPath) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('audio', audioPath, 'stammering_audio.wav');

    const response = await fetch(`${BaseURL}/predict_stutter`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    return data
  } catch (error) {
    console.log(error)
    return null
  }
};
export const sendIOSVideo = async (videoPath, fileName, path) => {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', {
    uri: videoPath,
    type: 'video/mp4',
    name: fileName,
  });
  try {
    const response = await axios.post(
      `${BaseURL}/${path}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return null
  }
};
export const resetArticSession = async (id, disorderId) => {
  const token = getToken()
  const formData = new FormData()
  formData.append('UserID', id);
  formData.append('DisorderID', disorderId);
  try {
    const response = await axios.post(
      `${BaseURL}/reset_session_state`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return null
  }
};
export const getStammeringWords = async (id) => {
  const token = getToken()
  try {
    const response = await axios.get(`${BaseURL}/get_exercise_stammering/${id}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }

    );
    return response
  } catch (error) {
    return null
  }
};
export const updateUserId = async (body) => {
  const token = getToken()
  try {
    const response = await axios.put(
      `${BaseURL}/update_user_type`,
      body,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return null
  }
};
export const changeUserPassword = async (body) => {
  const token = getToken()

  try {
    const response = await axios.post(
      `${BaseURL}/change_password`,
      body,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};
export const checkArticulationAssessment = async (id) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_word_texts/${id}/1`,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};
export const checkReceptiveAssessment = async (id) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_assessment_status_receptive/${id}`,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};
export const checkExpressiveAssessment = async (id) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/get_assessment_status_expressive/${id}`,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};
export const checkAllAssessment = async (userId, disorderid) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/check_assessment_status/${userId}/${disorderid}`,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
}; export const cancelSubscription = async (id, invoiceid) => {
  const token = getToken()
  const url = invoiceid ? `/cancel_subscription/${id}/${invoiceid}` : `/cancel_subscription/${id}`
  try {
    const response = await axios.post(
      `${BaseURL}${url}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};
export const resendOtp = async (data) => {
  const token = getToken()
  try {
    const response = await axios.post(
      `${BaseURL}/resend_otp`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data
      },

    );
    return response
  } catch (error) {
    return error
  }
};
export const verifySignupOtp = async (data) => {
  const token = getToken()
  console.log(token);
  try {
    const response = await axios.post(
      `${BaseURL}/verify_otp_signup`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    console.log(response);
    return response
  } catch (error) {
    return error
  }
};
// export const signup = async (data) => {
//   try {
//     const response = await axios.post(
//       `${BaseURL}/new_signup`,
//       data,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data
//       },

//     );
//     return response
//   } catch (error) {
//     return error
//   }
// };
export const getCheckoutUrl = async (id, plan, invoiceid) => {
  const token = getToken()
  const url = invoiceid ? `/get_checkout_url/${id}?invoice_id=${invoiceid}?plan=${plan}` : `/get_checkout_url/${id}?plan=${plan}`
  try {
    const response = await axios.get(
      `${BaseURL}${url}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};
export const getUserInfo = async (id) => {
  const token = getToken()
  try {
    const response = await axios.get(
      `${BaseURL}/userdata_info/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};
export const googleLogin = async (access_token) => {
  const token = getToken()
  const data = {
    access_token,
    platform: 'windows'
  }
  try {
    const response = await axios.post(
      `${BaseURL}/google_login`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};

export const sendFeedback = async (data) => {
  const token = getToken()
  try {
    const response = await axios.post(
      `${BaseURL}/send_feedback`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      },
    );
    return response
  } catch (error) {
    return error
  }
};


export const getGoogleToken = async () => {
  try {
    const isGoogleSignin = await GoogleSignin.hasPreviousSignIn()
    const googleuser = await GoogleSignin.getCurrentUser()
    console.log("isGoogleSignin", isGoogleSignin)
    if (isGoogleSignin) {
      await GoogleSignin.revokeAccess()
      await GoogleSignin.signOut()
    }
  } catch (error) {
    console.log("errorr", error)
  }


  try {
    if (isIOS) {
      GoogleSignin.configure({
        scopes: ['profile', 'email'], // what API you want to access on behalf of the user, default is email and profile
        iosClientId: IOS_WEB_CLIENT_ID,
      });
    } else {
      GoogleSignin.configure({
        scopes: ['profile', 'email'], // what API you want to access on behalf of the user, default is email and profile
        webClientId: WEB_CLIENT_ID,
        offlineAccess: true,
        // googleServicePlistPath:"../googleLoginJson/android.json"
      });
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true, });
    const { data } = await GoogleSignin.signIn();
    return data
  } catch (error) {
    return null
  }
}
export const registerGuardian = async (data) => {
  const token = getToken()
  try {
    const response = await axios.post(
      `${BaseURL}/register_guardian_user`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      },

    );
    return response
  } catch (error) {
    return error
  }
};
export const clinicSignup = async (data) => {
  try {
    console.log('Request Data:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(
      `${BaseURL}/demo_request`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    
    return response;
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    return error;
  }
};

export const signup = async (data) => {
  try {
    const response = await axios.post(
      `${BaseURL}/new_signup`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        data
      },

    );
    return response
  } catch (error) {
    return error
  }
};
export const calculateAge = (dob) => {
  let birthDate = new Date(dob);
  let today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  let monthDiff = today.getMonth() - birthDate.getMonth();
  let dayDiff = today.getDate() - birthDate.getDate();

  // Adjust age if the birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
}


export const shuffleArray = array => {
  return array
    ?.map(value => ({ value, sort: Math.random() }))
    ?.sort((a, b) => a?.sort - b?.sort)
    ?.map(({ value }) => value);
};

// first letter capitalize
export const capitalize = str => str?.charAt(0)?.toUpperCase() + str?.slice(1);

export const isIOS = false