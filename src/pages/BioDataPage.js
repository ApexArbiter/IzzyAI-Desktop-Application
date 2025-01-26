import React, { useState, useEffect } from 'react';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import CustomHeader from '../components/CustomHeader';
import { getToken, updateUserId } from '../utils/functions';
import CheckBox from '../components/CheckBox'; // You'll need to build or import this as a regular checkbox component
import InputField from '../components/InputField'; // Same for this component

const BioDataPage = ({ history }) => {
  const { userId, userDetail, updateUserDetail } = useDataContext();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [improvementPreferences, setImprovementPreferences] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(userDetail?.UserType);

  const handleCheckboxChange = (preference) => {
    const updatedPreferences = improvementPreferences.includes(preference)
      ? improvementPreferences.filter((item) => item !== preference)
      : [...improvementPreferences, preference];
    setImprovementPreferences(updatedPreferences);
  };

  const Update = async () => {
    setIsLoading(true);
    const profileData = {
      name,
      age,
      improvementPreferences,
    };
    const token = await getToken();
    const formData = new FormData();

    formData.append('FullName', profileData.name);
    formData.append('Age', profileData.age);
    formData.append('CheckboxValues', profileData.improvementPreferences.join(','));

    const typeForm = new FormData();
    typeForm.append('UserID', userId);
    typeForm.append('NewUserType', type);

    try {
      await fetch(`${BaseURL}/update_user_profile_biodata/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': "Bearer " + token },
        body: formData,
      });
      await updateUserId(typeForm);
      updateUserDetail({ UserType: type });
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      try {
        const response = await fetch(`${BaseURL}/get_user_profile/${userId}`, {
          headers: { 'Authorization': "Bearer " + token }
        });
        const userData = await response.json();
        setName(userData.FullName);
        setAge(userData.Age);
        setImprovementPreferences(userData.CheckboxValues?.split(',') || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <div className="safe-area">
      <CustomHeader title="Update User Details" goBack={() => history.goBack()} />
      <div className="main-view">
        <div className="image-view">
          <img src={require("../assets/images/logo.png")} alt="Logo" />
        </div>

        <h2>Update User Details</h2>

        <label>Your Name</label>
        <InputField value={name} onChange={setName} placeholder="eg. John Doe" />

        <label>Your Age</label>
        <InputField value={age} onChange={setAge} placeholder="eg. 25" type="number" />

        <label>User Type</label>
        <div>
          <CheckBox checked={type === 'Clinic'} onChange={() => setType('Clinic')} label="Clinic" />
          <CheckBox checked={type === 'SLP'} onChange={() => setType('SLP')} label="SLP" />
          <CheckBox checked={type === 'Parent'} onChange={() => setType('Parent')} label="Parent" />
          <CheckBox checked={type === 'Self'} onChange={() => setType('Self')} label="Self" />
        </div>

        <label>Change your preferences</label>
        <div>
          <CheckBox checked={improvementPreferences.includes('articulation')} onChange={() => handleCheckboxChange('articulation')} label="Articulation" />
          <CheckBox checked={improvementPreferences.includes('stammering')} onChange={() => handleCheckboxChange('stammering')} label="Stammering" />
          <CheckBox checked={improvementPreferences.includes('voice')} onChange={() => handleCheckboxChange('voice')} label="Voice" />
          <CheckBox checked={improvementPreferences.includes('receptive')} onChange={() => handleCheckboxChange('receptive')} label="Receptive Language" />
          <CheckBox checked={improvementPreferences.includes('expressive')} onChange={() => handleCheckboxChange('expressive')} label="Expressive Language" />
        </div>

        <button onClick={Update} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Update'}
        </button>

        {isModalVisible && (
          <div className="modal">
            <div className="modal-content">
              <h3>Profile Details Updated</h3>
              <button onClick={() => setIsModalVisible(false)}>Ok</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BioDataPage;
