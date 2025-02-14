import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Use React Router for navigation
import CustomHeader from '../components/CustomHeader'; // Assuming you have the same component for web
import DocumentIcon from '../assets/DocumentIcon'; // Keep the icon, assuming it's compatible
import Loader from '../components/Loader'; // Assuming this is a custom loader component
import { getToken } from '../utils/functions'; // Assume this utility function is reusable for web
import BaseURL from '../components/ApiCreds';

const DarkButton = ({ onPress, title, isLock, style }) => (
  <button
    disabled={isLock}
    onClick={onPress}
    className={`ml-auto rounded-full bg-gray-900 text-white px-6 py-3 font-semibold hover:bg-gray-700 disabled:opacity-50 ${style}`}
  >
    {title}
  </button>
);

function AllAssessmentPage() {
  const history = useNavigate(); // Using React Router for navigation
  const [loading, setLoading] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [userId, setUserId] = useState(null);

  const User = () => localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = () => {
      try {
        const storedUserDetail = localStorage.getItem('userDetails');
        const storedUserId = User();

        if (storedUserDetail) {
          setUserDetail(JSON.parse(storedUserDetail));
        }

        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error retrieving or parsing userDetails from localStorage', error);
      }
    };

    fetchData();
  }, []);

  const handleNavigation = (url, data) => {
    console.log("data before navigation", data)
    history(url, { state: data });
  };

  const handleApiCall = async (url, navigateTo) => {
    const token = await getToken();
    setLoading(true);
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('SessionTypeID', 1);

    fetch(`${BaseURL}/${url}`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((response) => {
        if (response.ok) {
          setLoading(false);
          return response.json();
        } else {
          setLoading(false);
          throw new Error(response.statusText);
        }
      })
      .then((data) => {
        setLoading(false);
        console.log("Session First Data", data)
        localStorage.setItem("SessionID", data.SessionID);
        console.log("Session ID:", data.SessionID)
        handleNavigation(navigateTo, { sessionId: data.SessionID, isAll: true });
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error:', error);
      });
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f2f1f1]">
    <CustomHeader title="All Assessments" goBack={() => history("/home")} />
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
          {[
            {
              title: 'Articulation Disorder',
              description: '44 Words',
              action: () => handleApiCall('insert_session_first_data', '/instructionsPage'),
            },
            {
              title: 'Stammering',
              description: '2 Passages',
              action: () => handleApiCall('insert_session_first_data', '/stammeringPassages'),
            },
            {
              title: 'Voice Disorder',
              description: '3 Sounds',
              action: () => handleApiCall('insert_session_first_data', '/voiceDisorderPage'),
            },
            {
              title: 'Receptive Language Disorder',
              description: '20 Questions',
              action: () => handleApiCall('insert_session_first_data', '/ReceptiveLanguageInstructions'),
            },
            {
              title: 'Expressive Language Disorder',
              description: '18 Questions',
              action: () => handleApiCall('insert_session_first_data', '/LanguageInstructions'),
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[#0CC8E8] p-4 mb-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                  <div className="flex items-center text-gray-600">
                    <DocumentIcon />
                    <span className="ml-2 text-sm">{item.description}</span>
                  </div>
                </div>
                <button 
                  onClick={item.action}
                  className="bg-[#111920] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {loading && <Loader loading={loading} />}
  </div>
  );
}

export default AllAssessmentPage;
