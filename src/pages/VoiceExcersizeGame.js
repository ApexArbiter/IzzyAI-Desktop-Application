import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import { useDataContext } from '../contexts/DataContext';

const VoiceExerciseGame = () => {
  let { userId } = useDataContext();
  console.log('userId', userId)
  userId = "353"
  const navigate = useNavigate();

  const handleButtonClick = (url) => {
    console.log('url', url)
    navigate('/games', { state: { url } });
  };

  const navigateBack = () => {
    navigate('/exercisePage');
  };

  return (
    <div className="h-full">
      <CustomHeader title="Games" goBack={navigateBack} />
      <div className="flex flex-col p-12 space-y-4">
        <button
          className="w-full h-20 flex items-center justify-center px-8 py-4 border border-[#0CC8E8] rounded-xl bg-white text-[#0CC8E8] text-lg font-bold cursor-pointer"
          onClick={() => handleButtonClick(`https://game.izzyai.com/start_blow_game/${userId}/6`)}
        >
          Start Blow Game
        </button>
        <button
          className="w-full h-20 flex items-center justify-center px-8 py-4 border border-[#0CC8E8] rounded-xl bg-white text-[#0CC8E8] text-lg font-bold cursor-pointer"
          onClick={() => handleButtonClick(`https://game.izzyai.com/start_sounds_game/${userId}/6`)}
        >
          Start Voice Game
        </button>
        <button
          className="w-full h-20 flex items-center justify-center px-8 py-4 border border-[#0CC8E8] rounded-xl bg-white text-[#0CC8E8] text-lg font-bold cursor-pointer"
          onClick={() => handleButtonClick(`https://game.izzyai.com/start_animal_game/${userId}/6`)}
        >
          Start Animal Game
        </button>
        <button
          className="w-full h-20 flex items-center justify-center px-8 py-4 border border-[#0CC8E8] rounded-xl bg-white text-[#0CC8E8] text-lg font-bold cursor-pointer"
          onClick={() => handleButtonClick(`https://game.izzyai.com/start_transport_game/${userId}/6`)}
        >
          Start Transport Game
        </button>
        <button
          className="w-full h-20 flex items-center justify-center px-8 py-4 border border-[#0CC8E8] rounded-xl bg-white text-[#0CC8E8] text-lg font-bold cursor-pointer"
          onClick={() => handleButtonClick(`https://game.izzyai.com/start_food_game/${userId}/6`)}
        >
          Start Food Game
        </button>
      </div>
    </div>
  );
};

export default VoiceExerciseGame;