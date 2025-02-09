import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { getToken } from '../utils/functions';

const CustomButton = (props) => {
  return (
    <div className="flex justify-center">
      <button 
        onClick={() => props.onClick()} 
        className="rounded-full bg-[#111920] py-3 px-6 w-64 h-12 flex items-center justify-center mt-5 mb-8"
        disabled={props.loading}
      >
        {props.loading ? (
          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-white font-semibold">{props.title}</span>
        )}
      </button>
    </div>
  );
};


const Question = ({ num, questionText, onSelect, selectedValue }) => {
  return (
    <div className="my-4">
      <p className="mb-3 text-lg font-semibold text-left">
        {`Q${num}). ${questionText}`}
      </p>

      <div className="flex justify-between">
        <button
          onClick={() => onSelect('Yes')}
          className={`border-2 w-[48%] rounded-full py-2 ${
            selectedValue === 'Yes' ? 'border-[#71D860]' : 'border-gray-300'
          }`}
        >
          <span className="text-center font-bold">Yes</span>
        </button>

        <button
          onClick={() => onSelect('No')}
          className={`border-2 w-[48%] rounded-full py-2 ${
            selectedValue === 'No' ? 'border-[#FC4343]' : 'border-gray-300'
          }`}
        >
          <span className="text-center font-bold">No</span>
        </button>
      </div>
    </div>
  );
};

const baselineQuestionsArray = [
  {
    type: "articulation",
    id: 1,
    question: "At 15 months is still not babbling",
  },
  {
    type: "articulation",
    id: 2,
    question: "At 2 years uses less than 50 words."
  },
  {
    type: "articulation",
    id: 3,
    question: "At 2 years not talking."
  },
  {
    type: "articulation",
    id: 4,
    question: "At 2 years the family finds it difficult to understand the speech."
  },
  {
    type: "articulation",
    id: 5,
    question: "At 2-1/2 years is unable to use unique two-word phrases."
  },
  {
    type: "articulation",
    id: 6,
    question: "At 2-1/2 years is unable to use noun-verb combinations."
  },
  {
    type: "articulation",
    id: 7,
    question: "At 3 years unable to use at least 200 words."
  },
  {
    type: "articulation",
    id: 8,
    question: "At 3 years unable to ask for things by name."
  },
  {
    type: "articulation",
    id: 9,
    question: "At 3 years is unable to speak in short sentences."
  },
  {
    type: "articulation",
    id: 10,
    question: "At 3 years strangers are unable to understand the speech."
  },
  {
    type: "articulation",
    id: 11,
    question: "At any age is unable to say previously learned words."
  },
  {
    type: "articulation",
    id: 12,
    question: "Has difficulty following directions."
  },
  {
    type: "articulation",
    id: 13,
    question: "Has poor pronunciation or articulation."
  },
  {
    type: "articulation",
    id: 14,
    question: "Is leaving words out of a sentence."
  },
  {
    type: "stammering",
    id: 15,
    question: "Speaks less at the age of 2-1/2 years or 3 years."
  },
  {
    type: "stammering",
    id: 16,
    question: "Runs over words while speaking."
  },
  {
    type: "stammering",
    id: 17,
    question: "Avoids speaking in a new environment."
  },
  {
    type: "stammering",
    id: 18,
    question: "Avoids talking with strangers or authority figures."
  },
  {
    type: "stammering",
    id: 19,
    question: "Speaks in a low tone or whisper."
  },
  {
    type: "voice",
    id: 20,
    question: "Frequent coughing or sneezing loudly."
  },
  {
    type: "voice",
    id: 21,
    question: "Frequent throat clearing."
  },
  {
    type: "voice",
    id: 22,
    question: "Frequent screaming or shouting."
  },
  {
    type: "voice",
    id: 23,
    question: "Frequent talking in noisy environments."
  },
  {
    type: "voice",
    id: 24,
    question: "Frequent loud singing or class practice."
  },
  {
    type: "voice",
    id: 25,
    question: "Frequent talking for extended periods of time.",
  },
  {
    type: "voice",
    id: 26,
    question: "Extensive number of hours of voice usage per day."
  },
  {
    type: "voice",
    id: 27,
    question: "Frequent intake of caffeine products (coffee, chocolate, cocoa)."
  },
  {
    type: "voice",
    id: 28,
    question: "Frequent exposure to environmental irritants."
  },
  {
    type: "voice",
    id: 29,
    question: "Frequent or extensive smoking."
  },
  {
    type: "voice",
    id: 30,
    question: "Frequent alcohol consumption."
  },
  {
    type: "voice",
    id: 31,
    question: "Frequent intake of spicy food items."
  },
  {
    type: "voice",
    id: 32,
    question: "Frequent consumption of carbonated drinks."
  },
  {
    type: "voice",
    id: 33,
    question: "Minimum or less number of glasses of water intake per day."
  },
  {
    type: "voice",
    id: 34,
    question: "Frequent habit of chewing tobacco, snuff, pan etc."
  },
  {
    type: "voice",
    id: 35,
    question: "Frequent infections like cold or laryngitis etc."
  },
  {
    type: "voice",
    id: 36,
    question: "High pitch voice that does not match your age."
  },
  {
    type: "voice",
    id: 37,
    question: "Frequent pitch breaks while talking."
  },
  {
    type: "voice",
    id: 38,
    question: "Voice sounds strained, tight or breathy while talking."
  },
  {
    type: "receptive",
    id: 39,
    question: "Do you understand what people say?"
  },
  {
    type: "receptive",
    id: 40,
    question: "Do you understand gestures?"
  },
  {
    type: "receptive",
    id: 41,
    question: "Do you understand basic concepts like in/out, on/off etc.?"
  },
  {
    type: "receptive",
    id: 42,
    question: "Do you easily learn new words?"
  },
  {
    type: "receptive",
    id: 43,
    question: "Is answering questions easy for you?"
  },
  {
    type: "receptive",
    id: 44,
    question: "Do you follow directions?"
  },
  {
    type: "receptive",
    id: 45,
    question: "Do you follow simple commands?"
  },
  {
    type: "receptive",
    id: 46,
    question: "Do you follow multiple or complex commands?"
  },
  {
    type: "expressive",
    id: 47,
    question: "Are you able to identify functional objects of daily living?"
  },
  {
    type: "expressive",
    id: 48,
    question: "Are you able to identify complex objects or sceneries?"
  },
  {
    type: "expressive",
    id: 49,
    question: "Are you able to use words correctly?"
  },
  {
    type: "expressive",
    id: 50,
    question: "Do you express your thoughts and ideas verbally?"
  },
  {
    type: "expressive",
    id: 51,
    question: "Is expressing thoughts and ideas effortless for you?",
  },
  {
    type: "expressive",
    id: 52,
    question: "Do you use gestures?",
  },
  {
    type: "expressive",
    id: 53,
    question: "Do you ask questions?",
  },
  {
    type: "expressive",
    id: 54,
    question: "Do you sing songs or recite poems?",
  },
  {
    type: "expressive",
    id: 55,
    question: "Are you able to name objects?",
  },
  {
    type: "expressive",
    id: 56,
    question: "Do you tell simple stories?",
  },
  {
    type: "expressive",
    id: 57,
    question: "Are you able to tell complex stories?"
  },

];

function BaselineQuestions() {
  const { setQuestionReport } = useDataContext();
  const [userDetail, setUserDetail] = useState(null);
  const [userId, setUserId] = useState(null);
  const User = () => localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = () => {
      try {
        const storedUserDetail = localStorage.getItem("userDetails");
        const storedUserId = User(); 

        if (storedUserDetail) {
          setUserDetail(JSON.parse(storedUserDetail)); 
        }

        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error retrieving or parsing userDetails from localStorage", error);
      }
    };

    fetchData(); 
    console.log(User());
  }, []);
  const questions = Number(userDetail?.Age) < 12 ? baselineQuestionsArray : baselineQuestionsArray.slice(10);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsObj, setQuestionsObj] = useState({});
  const [responses, setResponses] = useState(new Array(questions.length).fill(null));

  const history = useNavigate();

  const handleSelect = (index, value, type) => {
    const updatedResponses = [...responses];
    updatedResponses[index] = value;
    setResponses(updatedResponses);
    
    let obj = { ...questionsObj };
    
    // Initialize both Yes and No counters if they don't exist
    if (!obj[type + 'Yes']) obj[type + 'Yes'] = 0;
    if (!obj[type + 'No']) obj[type + 'No'] = 0;
    
    // Increment the selected counter (Yes/No)
    if (value === 'Yes') {
      obj[type + 'Yes'] = (obj[type + 'Yes'] || 0) + 1;
    } else {
      obj[type + 'No'] = (obj[type + 'No'] || 0) + 1;
    }
    
    setQuestionsObj(obj);
  };

  const navigate = () => {
    setIsLoading(false);
    history('/sufferingDisease');
  };

  const updateQuestionReport = async (data) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('user_id', userId || userDetail?.UserID);
    formData.append('InitialquestionLogic', JSON.stringify(data));

    fetch(`${BaseURL}/update_initialquestionlogic`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData,
    })
      .then(async (response) => {
        setIsLoading(false);
        if (response.ok) {
          localStorage.setItem('questionReport', JSON.stringify(data))
          const responseData = await response.json();
          setIsLoading(false);
          navigate();
        } else {
          const responseData = await response.json();
          alert(responseData?.error || 'Something went wrong');
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Error:', error);
      });
  };

  const handleSubmit = async () => {
    if (responses.includes(null)) 
      {
      alert("Please answer all questions before submitting")
    } else
     {
      const token = await getToken();
      const formData = new FormData();
      setIsLoading(true);

      formData.append('UserID', userId);
      formData.append('Answer', JSON.stringify(responses));

      fetch(`${BaseURL}/add_answer`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData,
      })
        .then(async (response) => {
          if (response.ok) {
            const responseData = await response.json();
            setQuestionReport(questionsObj);
            console.log("Questtions result",questionsObj);
            updateQuestionReport(questionsObj);
          } else {
            const responseData = await response.json();
            alert(responseData?.error || 'Something went wrong');
          }
        })
        .catch((error) => {
          setIsLoading(false);
          console.error('Error:', error);
        });
    }
  };

  return (
    <div style={styles.safeArea} className='mx-5'>
      <CustomHeader title="Setup Profile" goBack={() => history.goBack()} />
      <div style={styles.mainView}>
        <div style={{ marginVertical: 15 }}>
          {questions.map((item, index) => (
            <Question
              key={item.id}
              num={index + 1}
              questionText={item.question}
              onSelect={(value) => handleSelect(index, value, item.type)}
              selectedValue={responses[index]}
            />
          ))}
        </div>
        <CustomButton onClick={handleSubmit} title="Submit" loading={isLoading} />
      </div>
    </div>
  );
}

const styles = {
  safeArea: {
    flex: 1,
   
  },
  mainView: {
    flex: 1,
    padding: 20,
  },
  base: {
    fontFamily: 'Arial, sans-serif',
    color: '#111920',
  },
  button: {
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#111920',
    padding: 10,
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
};

export default BaselineQuestions;
