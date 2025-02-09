import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { getSessionDetail, getToken } from "../utils/functions";
import Loader from '../components/Loader';
import DocumentIcon from '../assets/DocumentIcon'; // Assuming it's an SVG or Image
import { COLORS, fonts } from '../theme'; // Define your colors and fonts
import CustomHeader from '../components/CustomHeader';
import BottomNavigation from '../components/BottomNavigation';

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

const AssessmentPage = () => {
  // const { questionReport } = useDataContext();
  const history = useNavigate(); // For navigation
  const [userDetail, setUserDetail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [questionReport, setQuestionReport] = useState(null);
  const User = () => localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = () => {
      try {
        // Retrieve user details and userId from localStorage
        const storedUserDetail = localStorage.getItem("userDetails");
        const storedQuestionReport = localStorage.getItem("questionReport");
        const storedUserId = User();
        console.log(storedQuestionReport)

        if (storedUserDetail) {
          setUserDetail(JSON.parse(storedUserDetail));
        }

        if (storedQuestionReport) {
          const parsedReport = JSON.parse(storedQuestionReport);
          setQuestionReport(parsedReport); // Set the questionReport state
          console.log("questionReport set:", parsedReport);
        }


        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error retrieving or parsing data from localStorage:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [endTimeLessThan6Hours, setEndTimeLessThan6Hours] = useState(null);

  const getSession = async () => {

    const userId = User();
    const detail = await getSessionDetail(userId);
    if (detail?.EndTime && detail?.LatestUserID) {
      const currentTime = new Date();
      const lastTime = new Date(detail?.EndTime);
      let difference = currentTime.getTime() - lastTime.getTime();
      setEndTimeLessThan6Hours(difference <= 6 * 60 * 60 * 1000);
      // console.log(difference <= 6 * 60 * 60 * 1000);

    } else {

      setEndTimeLessThan6Hours(false);
    }
  };

  useEffect(() => {
    getSession();
  }, []);

  const handleButtonClick = async () => {
    const token = await getToken();
    setLoading(true);
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('SessionTypeID', 1);

    fetch(`${BaseURL}/insert_session_first_data`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        history('/instructionsPage', { state: { sessionId: data?.SessionID, SessiontypId: 1 } });
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
      });
  };

  const handleButtonClickStammering = async () => {
    const token = await getToken();
    setLoading(true);
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('SessionTypeID', 1);

    fetch(`${BaseURL}/insert_session_first_data`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        history(`/stammeringPassages`, { state: { sessionId: data?.SessionID } });
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
      });
  };

  const handleButtonClickVoice = async () => {
    const token = await getToken();
    setLoading(true);
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('SessionTypeID', 1);

    fetch(`${BaseURL}/insert_session_first_data`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        history('/voiceDisorderPage', { state: { sessionId: data?.SessionID } });
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
      });
  };

  const handleButtonLanguage = async (isReceptive = false) => {
    const token = await getToken();
    setLoading(true);
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('SessionTypeID', 1);

    fetch(`${BaseURL}/insert_session_first_data`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        const route = isReceptive ? '/receptiveLanguageInstructions' : '/languageInstructions';
        history(route, { state: { sessionId: data?.SessionID } });
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
      });
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
    <CustomHeader title="Assessments" goBack={() => history(-1)} />
    <div className="h-20 w-40 mx-auto mt-2 ">
              <img
                src={require("../assets/images/logo.png")}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
    <div className="h-[calc(100vh-64px)] p-4">
      <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl h-4/5 flex flex-col">
        {/* Scrollable Content Area */}
      
        <div className="flex-1 overflow-y-auto pr-2">
          {questionReport && questionReport.articulationYes > (questionReport.articulationNo || 0) && (
            <div className="bg-white rounded-2xl border border-[#0CC8E8] p-4 mb-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3">Articulation Disorder</h3>
                  <div className="flex items-center text-gray-600">
                    <DocumentIcon />
                    <span className="ml-2 text-sm">44 Words</span>
                  </div>
                </div>
                <button 
                  onClick={handleButtonClick}
                  className="bg-[#111920] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Start
                </button>
              </div>
            </div>
          )}

          {/* Repeat similar structure for other conditions */}
          {questionReport && questionReport.stammeringYes > (questionReport.stammeringNo || 0) && (
            <div className="bg-white rounded-2xl border border-[#0CC8E8] p-4 mb-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3">Stammering</h3>
                  <div className="flex items-center text-gray-600">
                    <DocumentIcon />
                    <span className="ml-2 text-sm">2 Passages</span>
                  </div>
                </div>
                <button 
                  onClick={handleButtonClickStammering}
                  className="bg-[#111920] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Start
                </button>
              </div>
            </div>
          )}

          {questionReport && questionReport.voiceYes > (questionReport.voiceNo || 0) && (
            <div className="bg-white rounded-2xl border border-[#0CC8E8] p-4 mb-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3">Voice Disorder</h3>
                  <div className="flex items-center text-gray-600">
                    <DocumentIcon />
                    <span className="ml-2 text-sm">3 Sounds</span>
                  </div>
                </div>
                <button 
                  onClick={handleButtonClickVoice}
                  className="bg-[#111920] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Start
                </button>
              </div>
            </div>
          )}

          {questionReport && questionReport.receptiveNo > (questionReport.receptiveYes || 0) && (
            <div className="bg-white rounded-2xl border border-[#0CC8E8] p-4 mb-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3">Receptive Language Disorder</h3>
                  <div className="flex items-center text-gray-600">
                    <DocumentIcon />
                    <span className="ml-2 text-sm">20 Questions</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleButtonLanguage(true)}
                  className="bg-[#111920] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Start
                </button>
              </div>
            </div>
          )}

          {questionReport && questionReport.expressiveNo > (questionReport.expressiveYes || 0) && (
            <div className="bg-white rounded-2xl border border-[#0CC8E8] p-4 mb-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3">Expressive Language Disorder</h3>
                  <div className="flex items-center text-gray-600">
                    <DocumentIcon />
                    <span className="ml-2 text-sm">18 Questions</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleButtonLanguage(false)}
                  className="bg-[#111920] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Start
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Section */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => history('/allAssessmentPage')}
            className="bg-[#111920] text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity w-64 text-center"
          >
            Show All Assessments
          </button>
        </div>
      </div>
    </div>
    {loading && <Loader loading={loading} />}
    <BottomNavigation />
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
    width: "250px",
    
    padding: '14px',
    borderRadius: '30px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '40px',
  },
};

export default AssessmentPage;
