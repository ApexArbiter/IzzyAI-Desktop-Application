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
    <div className="flex flex-col h-screen">
      <CustomHeader title="All Assessments" goBack={() => history(-1)} />
      <div className="p-5">
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
            className="border border-[#0CC8E8] rounded-2xl p-4 flex flex-row items-center mt-8"
          >
            <div>
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <div className="flex items-center mt-2">
                <DocumentIcon />
                <p className="text-sm font-medium ml-2">{item.description}</p>
              </div>
            </div>
            <DarkButton onPress={item.action} title="Start" />
          </div>
        ))}

        {loading && <Loader loading={loading} />}
      </div>
    </div>
  );
}

export default AllAssessmentPage;
