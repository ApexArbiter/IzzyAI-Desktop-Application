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
      onClick={onClick}
      className="bg-[#111920] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
    >
      {isLock ? (
        <span className="text-white">🔒</span>
      ) : (
        <span className="font-semibold">{title}</span>
      )}
    </button>
  );
};

// Update the ExerciseCard component to match the new styling
const ExerciseCard = ({ title, subtitle, onStart }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#0CC8E8] p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-3">{title}</h3>
          <div className="flex items-center text-gray-600">
            <DocumentIcon />
            <span className="ml-2 text-sm">{subtitle}</span>
          </div>
        </div>
        <DarkButton onClick={onStart} title="Start" />
      </div>
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
  const questionReport = JSON.parse(report());
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
      const response = await fetch(`${BaseURL}/get_Exercise_word_count/${userId}/1/`, {
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
      console.log(JSON.parse(localStorage.getItem("userDetails")))
      const userId = JSON.parse(localStorage.getItem("userDetails"))
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
  useEffect(() => {
    if (questionReport) {
      console.log('Articulation:', questionReport.articulationYes > (questionReport.articulationNo || 0));
      console.log('Stammering:', questionReport.stammeringYes > (questionReport.stammeringNo || 0));
      console.log('Voice:', questionReport.voiceYes > (questionReport.voiceNo || 0));
      console.log('Receptive:', questionReport.receptiveNo > (questionReport.receptiveYes || 0));
      console.log('Expressive:', questionReport.expressiveNo > (questionReport.expressiveYes || 0));
    }
  }, [questionReport]);



  return (
    <div className="h-screen overflow-hidden bg-[#f2f1f1]">
      <CustomHeader title="Exercises" goBack={() => history("/home")} />
      <div className="h-20 w-40 mx-auto mt-2 ">
        <img
          src={require("../assets/images/logo.png")}
          alt="Logo"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="h-[calc(100vh-64px)]  p-4">
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl h-4/5 flex flex-col">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {/* Articulation Disorder Card */}
              {questionReport && questionReport.articulationYes > (questionReport.articulationNo || 0) && (
                <ExerciseCard
                  title="Articulation Disorder"
                  subtitle={`${userDetail.totalQuestion} Words`}
                  onStart={handleButtonClick}
                />
              )}

              {/* Stammering Card */}
              {questionReport && questionReport.stammeringYes > (questionReport.stammeringNo || 0) && (
                <ExerciseCard
                  title="Stammering"
                  subtitle="5 Statements"
                  onStart={handleButtonClickStammering}
                />
              )}

              {/* Voice Disorder Card */}
              {questionReport && questionReport.voiceYes > (questionReport.voiceNo || 0) && (
                <ExerciseCard
                  title="Voice Disorder"
                  subtitle="3 Sounds"
                  onStart={handleButtonClickVoice}
                />
              )}

              {/* Receptive Language Disorder Card */}
              {questionReport && questionReport.receptiveNo > (questionReport.receptiveYes || 0) && (
                <ExerciseCard
                  title="Receptive Language Disorder"
                  subtitle={`${receptiveQuestions?.length || 0} Questions`}
                  onStart={() => handleButtonLanguage(true)}
                />
              )}

              {/* Expressive Language Disorder Card */}
              {questionReport && questionReport.expressiveNo > (questionReport.expressiveYes || 0) && (
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
          </div>

          {/* Fixed Bottom Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => history("/AllExercisesPage")}
              className="bg-[#111920] text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity w-64 text-center"
            >
              Show All Exercises
            </button>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && <Loader loading={loading} />}
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
