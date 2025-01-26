import React, { useState } from 'react';
import Select from 'react-select'; // Using 'react-select' for dropdown selection
import { useDataContext } from '../contexts/DataContext';
import { getToken, updateUserId } from '../utils/functions';
import InputField from '../components/InputField';
import CheckBox from '../components/CheckBox';
import BaseURL from '../components/ApiCreds';
import { useNavigate } from 'react-router-dom';

const genders = ['Male', 'Female', 'Transgender', 'Prefer not to say'];

const CustomButton = (props) => {
  return (
    <button onClick={props.onPress} style={styles.button}>
      {props.loading ? (
        <div style={{ color: 'white' }}>Loading...</div> // Simple loading text for demo
      ) : (
        <span style={styles.buttonText}>{props.title}</span>
      )}
    </button>
  );
};

function SetupProfilePage({ navigate }) {
  const { userId, updateUserDetail } = useDataContext();
const navigation = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [improvementPreferences, setImprovementPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(null);

  const handleCheckboxChange = (preference) => {
    const updatedPreferences = improvementPreferences.includes(preference)
      ? improvementPreferences.filter((item) => item !== preference)
      : [...improvementPreferences, preference];
    setImprovementPreferences(updatedPreferences);
  };

  const handleSubmit = async () => {
    if (name.trim() === '' || age.trim() === '') {
      alert('Please fill out all required fields.');
      return;
    }
    if (!type) {
      alert('Please select User Type.');
      return;
    }

    setIsLoading(true);
    const profileData = {
      name,
      age,
      gender: selectedGender,
      improvementPreferences,
    };
    const token = await getToken();
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('FullName', profileData.name);
    formData.append('Age', profileData.age);
    formData.append('Gender', profileData.gender);
    formData.append('checkboxes', profileData.improvementPreferences.join(','));

    const typeForm = new FormData();
    typeForm.append("UserID", userId);
    typeForm.append("NewUserType", type);

    fetch(`${BaseURL}/insert_user_profile`, {
      method: 'POST',
      headers: { 'Authorization': "Bearer " + token },
      body: formData,
    })
      .then(async (response) => {
        const res = await updateUserId(typeForm);
        setIsLoading(false);
        updateUserDetail({
          FullName: profileData.name,
          Age: profileData.age,
          Gender: profileData.gender,
          UserType: type,
        });
        navigation('setupProfile1', profileData);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Error:', error);
      });
  };

  return (
    <div style={styles.safeArea}>
      <header style={styles.header}>
        <h1>Setup Profile</h1>
      </header>

      <div style={styles.mainView}>
        <div style={styles.scrollView}>
          <div style={styles.imageView}>
          <img
            src={require('../assets/images/logo.png')}
            alt="Logo"
            style={styles.image}
          />
          </div>

          <div style={styles.progressBar}>
            <div style={styles.barFilled}></div>
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
          </div>

          <h2 style={styles.heading}>Setup your profile to continue</h2>
          <div style={styles.labelText}>
            Your Name <span style={{ color: 'red' }}>*</span>
          </div>
          <InputField
            value={name}
            onChange={setName}
            placeholder="e.g., John Doe"
          />
          <div style={styles.labelText}>
            Your Age <span style={{ color: 'red' }}>*</span>
          </div>
          <InputField
            value={age}
            onChange={setAge}
            placeholder="e.g., 28"
            type="number"
          />
          <div style={styles.labelText}>
            Your Gender <span style={{ color: 'red' }}>*</span>
          </div>
          <Select
            defaultValue="Male"
            options={genders.map((gender) => ({ label: gender, value: gender }))}
            onChange={(selectedOption) => setSelectedGender(selectedOption.value)}
          />

          <div style={styles.labelText}>User Type:</div>
          <CheckBox
            checked={type === 'Clinic'}
            onPress={() => setType('Clinic')}
            title="Clinic"
          />
          <CheckBox
            checked={type === 'SLP'}
            onPress={() => setType('SLP')}
            title="SLP"
          />
          <CheckBox
            checked={type === 'Parent'}
            onPress={() => setType('Parent')}
            title="Parent"
          />
          <CheckBox
            checked={type === 'Self'}
            onPress={() => setType('Self')}
            title="Self"
          />

          <div style={styles.labelText}>What do you want to improve?</div>
          <CheckBox
            checked={improvementPreferences.includes('articulation')}
            onPress={() => handleCheckboxChange('articulation')}
            title="Articulation"
          />
          <CheckBox
            checked={improvementPreferences.includes('stammering')}
            onPress={() => handleCheckboxChange('stammering')}
            title="Stammering"
          />
          <CheckBox
            checked={improvementPreferences.includes('voice')}
            onPress={() => handleCheckboxChange('voice')}
            title="Voice"
          />
          <CheckBox
            checked={improvementPreferences.includes('receptive')}
            onPress={() => handleCheckboxChange('receptive')}
            title="Receptive Language"
          />
          <CheckBox
            checked={improvementPreferences.includes('expressive')}
            onPress={() => handleCheckboxChange('expressive')}
            title="Expressive Language"
          />

          <CustomButton onPress={handleSubmit} title="Next" loading={isLoading} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  safeArea: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
  },
  mainView: {
    padding: '20px',
  },
  scrollView: {
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  imageView: {
    width: '40%',
    margin: 'auto',
  },
  image: {
    width: '100%',
    height: 'auto',
  },
  progressBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '30px',
  },
  barFilled: {
    flex: 1,
    height: '10px',
    backgroundColor: '#111920',
  },
  bar: {
    flex: 1,
    height: '10px',
    backgroundColor: '#ccc',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '500',
  },
  labelText: {
    fontSize: '16px',
    marginTop: '20px',
  },
  button: {
    backgroundColor: '#111920',
    padding: '12px',
    borderRadius: '50px',
    color: '#fff',
    cursor: 'pointer',
    width: '100%',
    marginTop: '20px',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
};

export default SetupProfilePage;
