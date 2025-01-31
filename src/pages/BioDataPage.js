import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Settings } from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import CustomHeader from '../components/CustomHeader';
import { getToken, updateUserId } from '../utils/functions';

const InputField = ({ label, placeholder, value, onChange, icon, type = "text", required = false }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
          focus:ring-blue-500 focus:border-transparent transition-all duration-300
          placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

const CheckBox = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer p-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

const RadioGroup = ({ options, selectedValue, onChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {options.map((option) => (
        <label
          key={option}
          className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer
          transition-all duration-300 ${selectedValue === option
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          <input
            type="radio"
            value={option}
            checked={selectedValue === option}
            onChange={() => onChange(option)}
            className="hidden"
          />
          <span className="font-medium">{option}</span>
        </label>
      ))}
    </div>
  );
};

const BioDataPage = () => {
  const navigate = useNavigate();
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
    console.log(formData);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }


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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <CustomHeader goBack={() => navigate(-1)} />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-2 py-4">
        <div className="w-full max-w-2xl space-y-4 bg-white p-8 rounded-2xl shadow-xl">
          {/* Logo */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <img
              src={require("../assets/images/logo.png")}
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          </div>


          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-center text-gray-900">
              Update Your Profile
            </h1>
            <p className="text-center text-gray-500">
              Please fill in your details to update your profile
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <InputField
              label="Your Name"
              placeholder="eg. John Doe"
              value={name}
              onChange={setName}
              icon={<User className="w-5 h-5" />}
            />

            <InputField
              label="Your Age"
              placeholder="eg. 25"
              value={age}
              onChange={setAge}
              type="number"
              icon={<Calendar className="w-5 h-5" />}
            />

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">User Type</label>
              <RadioGroup
                options={['Clinic', 'SLP', 'Parent', 'Self']}
                selectedValue={type}
                onChange={setType}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Improvement Preferences
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg">
                <CheckBox
                  checked={improvementPreferences.includes('articulation')}
                  onChange={() => handleCheckboxChange('articulation')}
                  label="Articulation"
                />
                <CheckBox
                  checked={improvementPreferences.includes('stammering')}
                  onChange={() => handleCheckboxChange('stammering')}
                  label="Stammering"
                />
                <CheckBox
                  checked={improvementPreferences.includes('voice')}
                  onChange={() => handleCheckboxChange('voice')}
                  label="Voice"
                />
                <CheckBox
                  checked={improvementPreferences.includes('receptive')}
                  onChange={() => handleCheckboxChange('receptive')}
                  label="Receptive Language"
                />
                <CheckBox
                  checked={improvementPreferences.includes('expressive')}
                  onChange={() => handleCheckboxChange('expressive')}
                  label="Expressive Language"
                />
              </div>
            </div>

            <button
              onClick={Update}
              disabled={isLoading}
              className="w-full px-6 py-3 text-white bg-black rounded-full font-semibold 
                transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 
                disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Profile Updated Successfully!</h3>
              <button
                onClick={() => setIsModalVisible(false)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BioDataPage;