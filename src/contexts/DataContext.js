import React, { createContext, useState, useContext } from 'react';

// Step 1: Define the context
const DataContext = createContext();

// Step 2: Create a provider component
export const DataProvider = ({ children }) => {
  const [articulationReport, setArticulationReport] = useState([]);
  const [exercisesReport, setExercisesReport] = useState([]);
  const [expressiveReport, setExpressiveReport] = useState([]);
  const [totalQuestion, setTotalQuestion] = useState();
  const [questionReport, setQuestionReport] = useState({});
  const [userId, setUserId] = useState('');
  const [userDetail, setUserDetail] = useState({
    UserID: '',
    FullName: '',
    Age: '',
    Gender: '',
    AvatarID: '',
    FaceAuthenticationState: null,
    checkboxes: [],
    email: '',
    avatarUrl: '',
    UserType: "",
    totalQuestion: 0,
    DaysLeft: null,
    SubscriptionDetails: null,
    Amount:null
  });

  const updateUserId = newUserId => {
    setUserId(newUserId);
    console.log(newUserId);
     localStorage.setItem("userId", newUserId);
  };

  const updateUserDetail = newUserDetail => {
    setUserDetail(prevUserDetail => {
      const updatedUserDetail = { 
        ...prevUserDetail, 
        ...newUserDetail 
      };

      // Store the updated user details in localStorage
      localStorage.setItem("userDetails", JSON.stringify(updatedUserDetail));

      return updatedUserDetail;
    });
    console.log('userDetails',newUserDetail);
  };

  return (
    <DataContext.Provider
      value={{
        articulationReport,
        setArticulationReport,
        exercisesReport,
        setExercisesReport,
        userId,
        updateUserId,
        updateUserDetail,
        userDetail,
        expressiveReport,
        setExpressiveReport,
        questionReport,
        setQuestionReport
      }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the global context
export const useDataContext = () => useContext(DataContext);
