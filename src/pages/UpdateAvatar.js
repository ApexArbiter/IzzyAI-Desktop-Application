import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // For navigation in ReactJS
import { Button, Alert, Image, Spinner } from 'react-bootstrap'; // For Button and Spinner
import CustomHeader from '../components/CustomHeader'; // Assuming you have a similar custom header for ReactJS
import { useDataContext } from '../contexts/DataContext'; // Assuming you have a similar context
import BaseURL from '../components/ApiCreds';
import { fonts } from '../theme';
import { getToken } from '../utils/functions';

const CustomButton = ({ onPress, title, loading }) => {
  return (
    <Button onClick={onPress} style={styles.button} disabled={loading}>
      {loading ? (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
      ) : (
        <span style={styles.buttonText}>{title}</span>
      )}
    </Button>
  );
};

function UpdateAvatar() {
  const { userId, updateUserDetail, userDetail } = useDataContext();
  const history = useHistory();

  const [gender, setGender] = useState(userDetail?.Gender || "Male");
  const [selectedAvatar, setSelectedAvatar] = useState(userDetail?.AvatarID);
  const [isLoading, setIsLoading] = useState(false);

  const navigateNext = async () => {
    const token = await getToken();
    if (selectedAvatar) {
      const formData = new FormData();
      setIsLoading(true);

      formData.append('UserID', userId);
      formData.append('AvatarID', selectedAvatar);

      try {
        await fetch(`${BaseURL}/update_avatar_id`, {
          method: 'PUT',
          headers: { 'Authorization': "Bearer " + token },
          body: formData,
        });

        const res = await fetch(`${BaseURL}/get_avatar/${selectedAvatar}`, {
          headers: { 'Authorization': "Bearer " + token }
        });
        const avatarData = await res.json();

        updateUserDetail({
          AvatarID: avatarData?.avatarData,
          avatarUrl: `${BaseURL}${avatarData.AvatarURL}`
        });
        setIsLoading(false);
        alert("Avatar Updated Successfully");
        history.goBack();
      } catch (error) {
        setIsLoading(false);
        console.error('Error:', error);
      }
    } else {
      alert('Please select an avatar');
    }
  };

  const navigateBack = () => {
    history.goBack();
  };

  const selectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
  };

  return (
    <div style={styles.safe_area}>
      <CustomHeader title="Update Avatar" goBack={navigateBack} />
      <div style={styles.main_view}>
        <div style={{ overflowY: 'auto', paddingBottom: '20px' }}>
          <div style={styles.image_view}>
            <Image
              style={styles.image}
              src={require("../assets/images/logo.png")} // Ensure image path works
              alt="Logo"
            />
          </div>

          {gender === 'Male' && (
            <div style={styles.avatarRow}>
              <div onClick={() => selectAvatar(1)} style={[styles.avatarContainer, selectedAvatar === 1 && styles.selectedAvatarContainer]}>
                <Image style={styles.avatarImage} src={require('../assets/images/male1.png')} />
              </div>
              <div onClick={() => selectAvatar(2)} style={[styles.avatarContainer, selectedAvatar === 2 && styles.selectedAvatarContainer]}>
                <Image style={styles.avatarImage} src={require('../assets/images/male2.png')} />
              </div>
            </div>
          )}

          {(gender === 'Transgender' || gender === 'Prefer not to say') && (
            <>
              <div style={styles.avatarRow}>
                <div onClick={() => selectAvatar(1)} style={[styles.avatarContainer, selectedAvatar === 1 && styles.selectedAvatarContainer]}>
                  <Image style={styles.avatarImage} src={require('../assets/images/male1.png')} />
                </div>
                <div onClick={() => selectAvatar(2)} style={[styles.avatarContainer, selectedAvatar === 2 && styles.selectedAvatarContainer]}>
                  <Image style={styles.avatarImage} src={require('../assets/images/male2.png')} />
                </div>
              </div>
              <span style={styles.labelText}>Female Avatars</span>
              <div style={styles.avatarRow}>
                <div onClick={() => selectAvatar(3)} style={[styles.avatarContainer, selectedAvatar === 3 && styles.selectedAvatarContainer]}>
                  <Image style={styles.avatarImage} src={require('../assets/images/female1.jpeg')} />
                </div>
                <div onClick={() => selectAvatar(4)} style={[styles.avatarContainer, selectedAvatar === 4 && styles.selectedAvatarContainer]}>
                  <Image style={styles.avatarImage} src={require('../assets/images/female2.png')} />
                </div>
              </div>
            </>
          )}

          {gender === 'Female' && (
            <div style={styles.avatarRow}>
              <div onClick={() => selectAvatar(3)} style={[styles.avatarContainer, selectedAvatar === 3 && styles.selectedAvatarContainer]}>
                <Image style={styles.avatarImage} src={require('../assets/images/female1.jpeg')} />
              </div>
              <div onClick={() => selectAvatar(4)} style={[styles.avatarContainer, selectedAvatar === 4 && styles.selectedAvatarContainer]}>
                <Image style={styles.avatarImage} src={require('../assets/images/female2.png')} />
              </div>
            </div>
          )}
        </div>

        <CustomButton onPress={navigateNext} title="Update" loading={isLoading} />
      </div>
    </div>
  );
}

const styles = {
  safe_area: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  main_view: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  image_view: {
    height: '80px',
    width: '40%',
    alignSelf: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  base: {
    fontFamily: fonts.regular,
    color: '#111920',
    marginBottom: '10px',
  },
  heading: {
    paddingTop: '30px',
    fontSize: '24px',
    fontWeight: '500',
    textAlign: 'center',
  },
  labelText: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '5px',
    marginTop: '10px',
    textAlign: 'left',
  },
  button: {
    borderRadius: '50px',
    alignItems: 'center',
    backgroundColor: '#111920',
    padding: '10px',
    height: '50px',
    justifyContent: 'center',
    marginTop: '20px',
    marginBottom: '20px',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  avatarRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '50px',
    marginTop: '30px',
  },
  avatarContainer: {
    borderRadius: '10px',
    width: '45%',
    height: '170px',
    cursor: 'pointer',
  },
  selectedAvatarContainer: {
    borderWidth: '2px',
    borderColor: '#2DEEAA',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '10px',
  },
};

export default UpdateAvatar;
