import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';

const StammeringPassages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, isAll } = location.state || {};
  console.log("State:", location.state);

  const passages = [
    {
      title: 'Grandfather Passage',
      action: () => navigate('/passagePage', { state: { sessionId, isAll } })
    },
    {
      title: 'The Rainbow Passage',
      action: () => navigate('/passagePage2', { state: { sessionId, isAll } })
    }
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#f2f1f1]">
      <CustomHeader title="Stammering Passages" goBack={() => navigate(-1)} />
      
      {/* Logo Section */}
      <div className="h-20 w-40 mx-auto mt-2">
        <img
          src={require("../assets/images/logo.png")}
          alt="Logo"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Main Content Container */}
      <div className="h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl h-4/5 flex flex-col">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-2">
            {passages.map((passage, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#0CC8E8] p-4 mb-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-medium">{passage.title}</h3>
                  </div>
                  <button 
                    onClick={passage.action}
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
    </div>
  );
};

export default StammeringPassages;