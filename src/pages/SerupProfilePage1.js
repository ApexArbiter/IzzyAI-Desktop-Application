import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import BarFilled from '../assets/BarFilled';
import Bar from '../assets/Bar';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { fonts } from '../theme';
import { getToken } from '../utils/functions';
import styled from 'styled-components';

const CustomButton = (props) => {
  return (
    <Button onClick={props.onPress}>
      {props.loading ? (
        <ActivityIndicator />
      ) : (
        <ButtonText>{props.title}</ButtonText>
      )}
    </Button>
  );
};

function SetupProfilePage1() {
  const location = useLocation();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [gender, setGender] = useState('Male');
  const { userId, updateUserDetail } = useDataContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.gender) {
      setGender(location.state.gender);
    }
  }, [location.state?.gender]);

  const navigateNext = async () => {
    const token = await getToken();
    if (selectedAvatar) {
      const formData = new FormData();
      setIsLoading(true);

      formData.append('UserID', userId);
      formData.append('AvatarID', selectedAvatar);

      fetch(`${BaseURL}/update_avatar_id`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData,
      })
        .then(async (response) => {
          updateUserDetail({
            AvatarID: selectedAvatar,
          });
          setIsLoading(false);
          navigate('/setupProfile2', { state: location.state });
        })
        .catch((error) => {
          setIsLoading(false);
          console.error('Error:', error);
        });
    } else {
      alert('Please select an avatar');
    }
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const selectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
  };

  return (
    <SafeArea>
      <CustomHeader title="Setup Profile" goBack={navigateBack} />
      <MainView>
        <ImageView>
          <LogoImage
            src={require('../assets/images/logo.png')}
            alt="Logo"
          />
        </ImageView>

        <ProgressBar>
          <BarFilled />
          <BarFilled />
          <Bar />
          <Bar />
          <Bar />
        </ProgressBar>

        <Heading>Choose your Avatar</Heading>

        {gender === 'Male' && (
          <AvatarRow>
            <AvatarContainer
              selected={selectedAvatar === 1}
              onClick={() => selectAvatar(1)}
            >
              <AvatarImage
                src={require('../assets/images/male1.png')}
                alt="Male Avatar 1"
              />
            </AvatarContainer>
            <AvatarContainer
              selected={selectedAvatar === 2}
              onClick={() => selectAvatar(2)}
            >
              <AvatarImage
                src={require('../assets/images/male2.png')}
                alt="Male Avatar 2"
              />
            </AvatarContainer>
          </AvatarRow>
        )}

        {(gender === 'Transgender' || gender === 'Prefer not to say') && (
          <>
            <LabelText>Male Avatars</LabelText>
            <AvatarRow>
              <AvatarContainer
                selected={selectedAvatar === 1}
                onClick={() => selectAvatar(1)}
              >
                <AvatarImage
                  src={require('../assets/images/male1.png')}
                  alt="Male Avatar 1"
                />
              </AvatarContainer>
              <AvatarContainer
                selected={selectedAvatar === 2}
                onClick={() => selectAvatar(2)}
              >
                <AvatarImage
                  src={require('../assets/images/male2.png')}
                  alt="Male Avatar 2"
                />
              </AvatarContainer>
            </AvatarRow>

            <LabelText>Female Avatars</LabelText>
            <AvatarRow>
              <AvatarContainer
                selected={selectedAvatar === 3}
                onClick={() => selectAvatar(3)}
              >
                <AvatarImage
                  src={require('../assets/images/female1.jpeg')}
                  alt="Female Avatar 1"
                />
              </AvatarContainer>
              <AvatarContainer
                selected={selectedAvatar === 4}
                onClick={() => selectAvatar(4)}
              >
                <AvatarImage
                  src={require('../assets/images/female2.png')}
                  alt="Female Avatar 2"
                />
              </AvatarContainer>
            </AvatarRow>
          </>
        )}

        {gender === 'Female' && (
          <AvatarRow>
            <AvatarContainer
              selected={selectedAvatar === 3}
              onClick={() => selectAvatar(3)}
            >
              <AvatarImage
                src={require('../assets/images/female1.jpeg')}
                alt="Female Avatar 1"
              />
            </AvatarContainer>
            <AvatarContainer
              selected={selectedAvatar === 4}
              onClick={() => selectAvatar(4)}
            >
              <AvatarImage
                src={require('../assets/images/female2.png')}
                alt="Female Avatar 2"
              />
            </AvatarContainer>
          </AvatarRow>
        )}

        <CustomButton onPress={navigateNext} title="Next" loading={isLoading} />
      </MainView>
    </SafeArea>
  );
}

export default SetupProfilePage1;

// Styled Components
const SafeArea = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MainView = styled.div`
  width: 100%;
  max-width: 800px;
  margin: auto;
`;

const ImageView = styled.div`
  height: 80px;
  width: 40%;
  margin: auto;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const Heading = styled.h2`
  font-family: ${fonts.regular};
  color: #111920;
  margin-top: 30px;
  text-align: center;
  font-size: 24px;
  font-weight: 500;
`;

const LabelText = styled.p`
  font-family: ${fonts.regular};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
  margin-top: 10px;
  margin-right: 200px;
  text-align: left;
`;

const AvatarRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
  margin-top: 30px;
`;

const AvatarContainer = styled.button`
  border-radius: 10px;
  width: 45%;
  height: 170px;
  border: ${(props) => (props.selected ? '2px solid #2DEEAA' : 'none')};
  background: none;
  cursor: pointer;
`;

const AvatarImage = styled.img`
  width: 80%;
  height: 100%;
  border-radius: 10px;
`;

const Button = styled.button`
  background-color: #111920;
  color: white;
  border-radius: 25px;
  padding: 15px;
  width: 100%;
  text-align: center;
  cursor: pointer;
  border: none;
  font-weight: 600;
`;

const ButtonText = styled.span`
  color: #fff;
  font-weight: 600;
`;

const ActivityIndicator = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #111920;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
`;
