import React from 'react';
import moment from 'moment';

function ExerciseDetails({ closeDetails, detailsOpen, reportData, itemNum }) {
  if (!reportData) return null;

  const data = reportData.UserExercises[itemNum];
  const emotion = data?.emotion ?
    (typeof data.emotion === 'string' ? JSON.parse(data.emotion) : data.emotion)
    : null;

  const generateHighlightedText = (text, indexes) => {
    return text.split('').map((letter, index) => {
      const isHighlighted = indexes?.includes(index);
      return (
        <span
          key={index}
          className={`${isHighlighted ? 'text-red-500' : 'text-gray-900'
            } ${index === 0 ? 'uppercase' : 'lowercase'} text-lg ml-0.5`}
        >
          {letter}
        </span>
      );
    });
  };

  if (!detailsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative">
      <div className="h-20 w-40 mx-auto  ">
          <img
            src={require("../assets/images/logo.png")}
            alt="Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <button
          onClick={() => closeDetails(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-center text-xl font-medium text-gray-900 mb-8">
          {data.DisorderName} {data.DisorderName !== 'Stammering'
                ? ` Disorder`
                : ""} Exercise
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-base text-gray-900">Name:</p>
            <p className="text-base text-gray-900">{reportData.ProfileDetail.Name}</p>
          </div>

          <div>
            <p className="text-base text-gray-900">Age:</p>
            <p className="text-base text-gray-900">{reportData.ProfileDetail.Age}</p>
          </div>

          <div>
            <p className="text-base text-gray-900">Date:</p>
            <p className="text-base text-gray-900">
              {moment(data.ExerciseDate).subtract(5, 'hours').format("YYYY-MM-DD hh:mm:ss")}
            </p>
          </div>

          <div>
            <p className="text-base text-gray-900">Number of Session:</p>
            <p className="text-base text-gray-900">{data['Session No']}</p>
          </div>

          {emotion && (
            <>
              {(emotion?.incorrect !== undefined && emotion?.incorrect !== null) && (
                <div>
                  <p className="text-base text-gray-900">
                    Incorrect Facial Expressions:
                  </p>
                  <p className="text-base text-gray-900">
                    {emotion?.incorrect ? emotion?.incorrect?.toFixed() : 0}%
                  </p>
                </div>
              )}

              {emotion?.expressions && (
                <div>
                  <p className="text-base text-gray-900">
                    Facial Expressions:
                  </p>
                  <p className="text-base text-gray-900">
                    {emotion?.expressions ? emotion?.expressions?.join(", ") : "None"}
                  </p>
                </div>
              )}
            </>
          )}

          <div>
            <p className="text-base text-gray-900">
              {data.DisorderName !== 'Stammering'
                ? `${data.DisorderName} Disorder:`
                : `${data.DisorderName}:`}
            </p>
            <p className="text-base text-gray-900">
              {data?.Score ? data?.Score?.toFixed() : 0}%
            </p>
          </div>

          {emotion && emotion?.questions_array?.length > 0 && (
            <div>
              {!emotion?.isVoice && (
                <p className="text-base text-gray-900 mb-2">
                  {data?.DisorderName === 'Articulation'
                    ? "Incorrect Pronunciations:"
                    : "Incorrect Questions:"}
                </p>
              )}

              {emotion?.questions_array?.map((item, index) => (
                <div key={index} className="mt-2">
                  {emotion?.isVoice ? (
                    <>
                      <p className="text-base text-gray-900">
                        {`Percentage of incorrect sound ${item?.wordtext?.[0]}:`}
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {parseFloat(item['Voice-Disorder'])?.toFixed(1)}%
                      </p>
                    </>
                  ) : (
                    item?.HighlightWord || item?.code_color ? (
                      <div className="flex items-center">
                        {generateHighlightedText(
                          item?.WordText,
                          (item?.HighlightWord || item?.code_color?.[0])
                        )}
                      </div>
                    ) : (
                      <p className="text-base text-gray-900">
                        {item?.question || item?.question_text || item?.Sentence || ""}
                      </p>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetails;