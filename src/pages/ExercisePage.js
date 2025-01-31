import React, { useState, useEffect } from 'react';
import { useDataContext } from '../contexts/DataContext';
import {
  getReceptiveExerciseQuestions,
  getExpressiveExerciseQuestions,
  resetArticSession,
  getToken,
  checkArticulationAssessment,
  checkReceptiveAssessment,
  checkExpressiveAssessment
} from "../utils/functions";
import Loader from '../components/Loader';
import { COLORS, fonts } from '../theme';
import BaseURL from '../components/ApiCreds';
import { useNavigate } from 'react-router-dom';
import DocumentIcon from '../assets/DocumentIcon';
import CustomHeader from '../components/CustomHeader';

const DarkButton = ({ isLock, onClick, title }) => {
  return (
    <button
      disabled={isLock}
      onClick={onClick}
      style={styles.darkButton}>
      <span style={styles.buttonText}>{title}</span>
    </button>
  );
};
const ExerciseCard = ({ title, subtitle, onStart }) => {
  return (
    <div className=" border border-[#0CC8E8] rounded-2xl p-4 flex flex-row items-center mt-8">
      <div className="flex-1 mr-3">
        <h2 className="text-gray-900 text-xl font-medium">
          {title}
        </h2>
        <div className="flex items-center mt-3">
          <DocumentIcon className="w-5 h-5 text-gray-600" />
          <p className="text-gray-900 text-sm font-medium ml-2">
            {subtitle}
          </p>
        </div>
      </div>
      <DarkButton onClick={onStart} title="Start" />
    </div>
  );
};
function ExercisePage() {
  const { updateUserDetail } = useDataContext();
  const history = useNavigate();
  const [isAssessed, setIsAssessed] = useState(true);
  const SessiontypId = 2;
  const [loading, setLoading] = useState(false);
  const [receptiveQuestions, setReceptiveQuestions] = useState([]);
  const [expressiveQuestions, setExpressiveQuestions] = useState([]);


  const report = () => localStorage.getItem("questionReport");
  const userDetail = JSON.parse(localStorage.getItem("userDetails"));
  const userId = localStorage.getItem("userId")
  const questionReport = JSON.parse(JSON.parse(report()));
  console.log(userId, userDetail)




  useEffect(() => {
    const fetchData = () => {
      try {
        // Retrieve user details and userId from localStorage


        // This is synchronous, no need for await
        // console.log("UserDetails", storedUserDetail);
        // console.log("storedUserId", storedUserId);

        // Check if user details exist in localStorage

      } catch (error) {
        console.error("Error retrieving or parsing userDetails from localStorage", error);
      }
    };

    fetchData(); // Call the function inside useEffect
    console.log("3")
  }, []); // Empty dependency array ensures this runs only once when the component mounts


  const fetchReport = async () => {
    const token = await getToken();
    console.log("Token", token)

    try {
      const response = await fetch(`http://154.38.160.197:5000/get_Exercise_word_count/${userId}/${userDetail.AvatarID}/`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      console.log("Response", response)
      if (response.ok) {

        const reportData = await response.json();
        console.log("Response OK")
        console.log(reportData)
        let sum = 0;
        const names = [];
        for (const key in reportData) {
          if (reportData.hasOwnProperty(key)) {
            sum += reportData[key].Count / 4;
            names.push(reportData[key].SoundName);
          }
        }
        updateUserDetail({ totalQuestion: sum });
      } else {
        console.log("Error is comming")
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
      console.log("Error in try Catch")
      console.error('Error fetching report:', error);
    }
  };


  const getReceptiveQuestions = async () => {
    if ((questionReport?.receptiveYes || questionReport?.receptiveNo) && ((questionReport?.receptiveYes < questionReport?.receptiveNo) || !questionReport?.receptiveYes)) {
      const data = await getReceptiveExerciseQuestions(userId, userDetail?.AvatarID);
      setReceptiveQuestions(data);
    }
  }

  const getExpressiveData = async () => {


    const data = await getExpressiveExerciseQuestions(userId, userDetail.AvatarID);
    setExpressiveQuestions(data);
  }

  useEffect(() => {
    fetchReport();
    getReceptiveQuestions();
    getExpressiveData();
  }, []);

  const handleButtonClick = async () => {
    try {
      setLoading(true);
      const checkAssess = await checkArticulationAssessment(userId);
      if (checkAssess?.data) {
        const token = await getToken();
        const response = resetArticSession(userId, 1);
        const formData = new FormData();
        formData.append('UserID', userId);
        formData.append('SessionTypeID', 2);

        fetch(`${BaseURL}/insert_session_first_data`, {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': 'Bearer ' + token }
        })
          .then(response => response.json())
          .then(data => {
            setLoading(false);
            history('/speechExcercisePage', {
              state: {
                sessionId: data.SessionID,
                SessiontypId: SessiontypId,
                isAll: false,
              }
            });
          })
          .catch(error => {
            setLoading(false);
            console.error('Error:', error);
          });
      } else {
        setLoading(false);
        alert('Complete your articulation disorder assessment.');
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleButtonClickStammering = async () => {
    const token = await getToken();

    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('SessionTypeID', 2);

    fetch(`${BaseURL}/insert_session_first_data`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(response => response.json())
      .then(data => {
        history('/stammeringExercisePage', {
          state: {
            sessionId: data.SessionID,
            SessiontypId: SessiontypId,
            isAll: false,
          }
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleButtonClickVoice = async () => {
    const token = await getToken();
    setLoading(true);
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('SessionTypeID', 2);

    fetch(`${BaseURL}/insert_session_first_data`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        history('/VoiceExercisePage', {
          state: {
            sessionId: data.SessionID,
            SessiontypId: SessiontypId,
            isAll: false,
          }
        });
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
      });
  };

  const handleButtonLanguage = async (isReceptive = false) => {
    let checkAssess;
    if (isReceptive) {
      checkAssess = await checkReceptiveAssessment(userId);
    } else {
      checkAssess = await checkExpressiveAssessment(userId);
    }
    if (checkAssess?.data) {
      const token = await getToken();
      const userId = User();
      setLoading(true);
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('SessionTypeID', 2);

      fetch(`${BaseURL}/insert_session_first_data`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(response => response.json())
        .then(data => {
          setLoading(false);
          history(isReceptive ? "/ReceptiveExercise" : '/ExpressiveExercise', {
            state: {
              sessionId: data.SessionID,
              SessiontypId: SessiontypId,
              isAll: false,
            }
          });
        })
        .catch(error => {
          setLoading(false);
          console.error('Error:', error);
        });
    } else {
      alert(isReceptive ? 'Complete your receptive language disorder assessment' : 'Complete your expressive language disorder assessment');
    }
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <CustomHeader title="Exercises" goBack={() => history("/home")} />

      {/* Main Content */}
      <div className="w-full px-6   py-6">
        <div className="space-y-6">
          {/* Articulation Disorder Card */}
          {(questionReport?.articulationYes || questionReport?.articulationYes) &&
            ((questionReport?.articulationYes > questionReport?.articulationNo) || !questionReport?.articulationNo) && (
              <ExerciseCard
                title="Articulation Disorder"
                subtitle={`${userDetail.totalQuestion} Words`}
                onStart={handleButtonClick}
              />
            )}

          {/* Stammering Card */}
          {(questionReport?.stammeringYes || questionReport?.stammeringNo) &&
            ((questionReport?.stammeringYes > questionReport?.stammeringNo) || !questionReport?.stammeringNo) && (
              <ExerciseCard
                title="Stammering"
                subtitle="5 Statements"
                onStart={handleButtonClickStammering}
              />
            )}

          {/* Voice Disorder Card */}
          {(questionReport?.voiceYes || questionReport?.voiceNo) &&
            ((questionReport?.voiceYes > questionReport?.voiceNo) || !questionReport?.voiceNo) && (
              <ExerciseCard
                title="Voice Disorder"
                subtitle="3 Sounds"
                onStart={handleButtonClickVoice}
              />
            )}

          {/* Receptive Language Disorder Card */}
          {(questionReport?.receptiveYes || questionReport?.receptiveNo) &&
            ((questionReport?.receptiveYes < questionReport?.receptiveNo) || !questionReport?.receptiveYes) && (
              <ExerciseCard
                title="Receptive Language Disorder"
                subtitle={`${receptiveQuestions?.length || 0} Questions`}
                onStart={() => handleButtonLanguage(true)}
              />
            )}

          {/* Expressive Language Disorder Card */}
          {(questionReport?.expressiveYes || questionReport?.expressiveNo) &&
            ((questionReport?.expressiveYes < questionReport?.expressiveNo) || !questionReport?.expressiveYes) && (
              <ExerciseCard
                title="Expressive Language Disorder"
                subtitle={`${expressiveQuestions?.length || 0} Questions`}
                onStart={() => handleButtonLanguage()}
              />
            )}

          {/* Games Card */}
          {userDetail?.SubscriptionDetails &&
            userDetail?.SubscriptionDetails?.Status !== 'Free Trial' && (
              <ExerciseCard
                title="Games"
                subtitle="5 Games"
                onStart={() => history('/voiceExerciseGame')}
              />
            )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {/* Bottom Button */}
        <button
          onClick={() => history("/AllExercisesPage")}
          className="w-full mt-8 bg-gray-900 text-white py-3 px-6 rounded-full hover:bg-gray-800 
                     transition-colors font-semibold text-sm text-center"
        >
          Show All Exercises
        </button>
      </div>
    </div>

  );
};

const styles = {
  safeArea: {
    padding: '20px',
  },
  mainView: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  scrollContainer: {
    overflowY: 'scroll',
  },
  base: {
    fontFamily: fonts.regular,
    color: '#111920',
  },
  heading: {
    fontSize: 22,
    fontWeight: '500',
  },
  para: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: '14px',
    border: '1px solid ' + COLORS.blue_border_color,
    marginTop: '30px',
  },
  darkButton: {
    backgroundColor: '#111920',
    borderRadius: '50px',
    color: '#fff',
    padding: '10px 20px',
    cursor: 'pointer',
  },
  buttonText: {
    fontWeight: '600',
  },
  textView: {
    flex: 1,
    marginRight: '12px',
  },
  textRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '12px',
  },
  bottomButton: {
    backgroundColor: '#111920',
    width: '100%',
    padding: '14px',
    borderRadius: '30px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '40px',
  },
};


export default ExercisePage;
