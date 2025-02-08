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
    <div style={styles.safeArea}>
    <CustomHeader title="Assessments" goBack={() => history(-1)} />
    <div style={styles.mainView}>
      <div style={styles.scrollContainer} className='overflow-hidden'>
        {/* Articulation Disorder */}
        {questionReport && questionReport.articulationYes > (questionReport.articulationNo || 0) && (
          <div style={styles.cardContainer}>
            <div style={styles.textView}>
              <h3 style={styles.heading}>Articulation Disorder</h3>
              <div style={styles.textRow}>
                <DocumentIcon />
                <span style={styles.para}>44 Words</span>
              </div>
            </div>
            <DarkButton onClick={handleButtonClick} title="Start" />
          </div>
        )}

        {/* Stammering */}
        {questionReport && questionReport.stammeringYes > (questionReport.stammeringNo || 0) && (
          <div style={styles.cardContainer}>
            <div style={styles.textView}>
              <h3 style={styles.heading}>Stammering</h3>
              <div style={styles.textRow}>
                <DocumentIcon />
                <span style={styles.para}>2 Passages</span>
              </div>
            </div>
            <DarkButton onClick={handleButtonClickStammering} title="Start" />
          </div>
        )}

        {/* Voice Disorder */}
        {questionReport && questionReport.voiceYes > (questionReport.voiceNo || 0) && (
          <div style={styles.cardContainer}>
            <div style={styles.textView}>
              <h3 style={styles.heading}>Voice Disorder</h3>
              <div style={styles.textRow}>
                <DocumentIcon />
                <span style={styles.para}>3 Sounds</span>
              </div>
            </div>
            <DarkButton onClick={handleButtonClickVoice} title="Start" />
          </div>
        )}

        {/* Receptive Language Disorder */}
        {questionReport && questionReport.receptiveNo > (questionReport.receptiveYes || 0) && (
          <div style={styles.cardContainer}>
            <div style={styles.textView}>
              <h3 style={styles.heading}>Receptive Language Disorder</h3>
              <div style={styles.textRow}>
                <DocumentIcon />
                <span style={styles.para}>20 Questions</span>
              </div>
            </div>
            <DarkButton onClick={() => handleButtonLanguage(true)} title="Start" />
          </div>
        )}

        {/* Expressive Language Disorder */}
        {questionReport && questionReport.expressiveNo > (questionReport.expressiveYes || 0) && (
          <div style={styles.cardContainer}>
            <div style={styles.textView}>
              <h3 style={styles.heading}>Expressive Language Disorder</h3>
              <div style={styles.textRow}>
                <DocumentIcon />
                <span style={styles.para}>18 Questions</span>
              </div>
            </div>
            <DarkButton onClick={() => handleButtonLanguage(false)} title="Start" />
          </div>
        )}

        {loading && <Loader loading={loading} />}
        <div style={{ height: 20 }} />
      </div>
      <button
        style={styles.bottomButton}
        className='mx-auto'
        onClick={() => history('/allAssessmentPage')}>
        Show All Assessments
      </button>
    </div>
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
