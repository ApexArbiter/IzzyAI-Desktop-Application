import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import CustomButton from '../components/Button';
import { fonts } from '../theme';

function InstructionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { sessionId, isAll } = location.state || {};  // Access passed state
  console.log(location.state)

  const handleNavigate = () => {
    navigate('/speechArticulationPage', { state: { sessionId, isAll } });
  };

  return (

    <div className="flex flex-col min-h-screen">
      <CustomHeader
        title="Articulation Disorder"
        goBack={() => navigate(-1)}
      />
      <div className="h-20 w-40 mx-auto mt-2 ">
              <img
                src={require("../assets/images/logo.png")}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
      <main className="flex-1 p-5 flex flex-col items-center  bg-white shadow-lg rounded-lg mx-20 mb-10 ">
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
        <h2 className="text-xl font-bold   mt-10 font-serif text-gray-900">
          Assessment Instructions
        </h2>

        {/* Instructions list - centered with max-width */}
        <div className="space-y-4 h-[23vh] mt-6 max-w-md mx-auto w-full pl-4">
          <div className="flex items-start gap-3 ">
            <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
            <p className="text-gray-900 font-serif">
              You will be shown some images of random objects. Say the names of each object loud and clearly.
            </p>
          </div>

          <div className="flex items-start gap-3 ">
            <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
            <p className="text-gray-900 font-serif">
              Hit the "Record" button to start answering.
            </p>
          </div>

          <div className="flex items-start gap-3 ">
            <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
            <p className="text-gray-900 font-serif">
              IzzyAl will respond advising whether your answers are correct or incorrect.
            </p>
          </div>
        </div>

        {/* Start button - centered */}
        <div className=" w-full max-w-xs flex justify-center">
          <button
            className="bg-black hover:bg-gray-800 text-white pl-16 pr-16 pt-2 pb-2 rounded-full"
            onClick={handleNavigate}
          >
            Start Now
          </button>
        </div>
      </main>
    </div>
  );
}



export default InstructionsPage;
