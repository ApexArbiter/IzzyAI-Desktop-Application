import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the context
const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [articulationReport, setArticulationReport] = useState([]);
  const [exercisesReport, setExercisesReport] = useState([]);
  const [expressiveReport, setExpressiveReport] = useState([]);
  const [questionReport, setQuestionReport] = useState({});
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || '');
  const [userDetail, setUserDetail] = useState(() => {
    const storedDetails = localStorage.getItem("userDetails");
    return storedDetails ? JSON.parse(storedDetails) : {
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
      Amount: null
    };
  });

  // Initialize state from localStorage on component mount
  useEffect(() => {
    const storedDetails = localStorage.getItem("userDetails");
    if (storedDetails) {
      setUserDetail(JSON.parse(storedDetails));
    }
  }, []);

  const updateUserId = newUserId => {
    setUserId(newUserId);
    localStorage.setItem("userId", newUserId);
  };

  const updateUserDetail = newUserDetail => {
    setUserDetail(prevState => {
      const updatedUserDetail = {
        ...prevState,
        ...newUserDetail
      };

      // Store in localStorage after update
      localStorage.setItem("userDetails", JSON.stringify(updatedUserDetail));
      return updatedUserDetail;
    });
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