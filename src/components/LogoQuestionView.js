import React from 'react';
import HighlightedText from './HighlightedText';
// Import the image directly at the top
import questionLogo from '../assets/images/question_logo_back.png';

const LogoQuestionView = ({
  first_text = '',
  second_text,
  highlighted = null,
  questionResponse = null,
  image = null,
  style = {},
}) => {
  const isCorrect = questionResponse === 'Correct!';

  return (
    <div 
      className={`
        flex 
        ${questionResponse ? 'justify-center' : 'justify-start'} 
        items-center 
        mt-3 md:mt-4 
        ${style}
        max-w-full
      `}
    >
      {questionResponse ? (
        <div className="flex-shrink-0">
          {isCorrect ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          )}
        </div>
      ) : (
        // Updated image handling
        <div className="flex-shrink-0 flex items-center justify-center">
          <img
            src={image || questionLogo}
            alt="Question Logo"
            className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 object-contain"
          />
        </div>
      )}

      {questionResponse ? (
        <p className="text-sm md:text-base lg:text-lg font-normal ml-2 text-gray-900">
          {first_text}
        </p>
      ) : (
        <div className="flex-1 ml-2 md:ml-3 overflow-hidden">
          {first_text?.length > 0 && (
            <p className="text-xs md:text-sm lg:text-base font-normal text-gray-700 mb-1">
              {first_text}
            </p>
          )}
          {highlighted ? (
            <div className="flex items-center">
              <HighlightedText indexes={highlighted} text={second_text} />
            </div>
          ) : (
            <p className="text-sm md:text-base lg:text-lg font-normal text-gray-900 
                         break-words leading-relaxed">
              {second_text}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LogoQuestionView;