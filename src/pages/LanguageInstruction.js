import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material'; // You can use any button library or HTML button
import CustomHeader from '../components/CustomHeader'; // Assuming it's compatible or adjusted for web
import { fonts } from '../theme';

import CustomButton from '../components/Button';

function LanguageInstructions() {
  const history = useNavigate();
  const location = useLocation();
  const { sessionId, isAll } = location.state || {};  // Accessing params from the location state in React Router
  console.log(location.state)
  const navigate = () => {
    history('/expressive-assessment', { state: { sessionId, isAll } },
    );
  };

  const navigateBack = () => {
    history(-1);
  };

  return (
   
    <div className="flex flex-col min-h-screen">
      <CustomHeader
        title="Receptive Language Disorder"
        goBack={() => history(-1)}
      />

      <main className="flex-1 p-5 flex flex-col items-center  bg-white shadow-lg rounded-lg md:m-20 m-0">
        {/* Image container */}
        <div className="flex justify-center mb-12">
          <div className="relative w-56 h-56 bg-teal-50 rounded-full flex items-center justify-center">
            <img
              src={require("../assets/images/mouth.png")}
              alt="Mouth"
              className="h-44 w-auto transform transition-transform hover:scale-105"
            />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold   mt-12 font-serif text-gray-900">
          Assessment Instructions
        </h2>

        {/* Instructions list - centered with max-width */}
        <div className="space-y-4 h-[23vh] mt-6 max-w-md mx-auto w-full pl-4">
          <div className="flex items-start gap-3 ">
            <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
            <p className="text-gray-900 font-serif">
              Speak out loud and clearly to answer each question.
            </p>
          </div>

          <div className="flex items-start gap-3 ">
            <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
            <p className="text-gray-900 font-serif">
              Hit the “Record” button to record your voice.
            </p>
          </div>

          <div className="flex items-start gap-3 ">
            <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
            <p className="text-gray-900 font-serif">
              IzzyAI will respond advising whether your answer is correct or incorrect.
            </p>
          </div>
        </div>

        {/* Start button - centered */}
        <div className=" w-full max-w-xs flex justify-center">
          <button
            className="bg-black hover:bg-gray-800 text-white pl-16 pr-16 pt-2 pb-2 rounded-full"
            onClick={navigate}
          >
            Start Now
          </button>
        </div>
      </main>
    </div>
  );
}


export default LanguageInstructions;
