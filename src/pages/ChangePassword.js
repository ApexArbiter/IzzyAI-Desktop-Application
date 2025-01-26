import React, { useState } from 'react';

import LockIcon from '../assets/LockIcon';
import CustomHeader from '../components/CustomHeader';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import InputField from '../components/InputField';
import { COLORS, fonts } from '../theme';
import { changeUserPassword, setToken } from '../utils/functions';
import { useNavigate } from 'react-router-dom';  // React Router for navigation

const CustomButton = (props) => {
  return (
    <button
      onClick={() => props.onPress()}
      style={styles.button}
      disabled={props.loading}>
      {props.loading ? (
        <ActivityIndicator color={'white'} size={26} />
      ) : (
        <Text style={styles.buttonText}>{props.title}</Text>
      )}
    </button>
  );
};

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { userDetail, updateUserDetail } = useDataContext();
  const history = useNavigate();

  const handleChange = async () => {
    if (!oldPassword || !password) {
      alert('Old and new password are required');
      return;
    }
    if (password?.length <8) {
      alert('Password must be at least 8 characters');
      return;
    }

    if (confirmPassword !== password) {
      alert('Password & Confirm Password must be the same');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    formData.append('Email', userDetail?.email?.trim()?.toLowerCase());
    formData.append('oldPassword', oldPassword);
    formData.append('newPassword', password);
    formData.append('confirmNewPassword', confirmPassword);

    Keyboard.dismiss();

    try {
      const response = await changeUserPassword(formData);
      setIsLoading(false);
      if (response?.status === 200) {
        alert('Password Updated Successfully');
        updateUserDetail({});
        history('/auth');  // Using React Router to navigate
      } else {
        alert(response?.response?.data?.error || 'Something went wrong');
      }
    } catch (error) {
      setIsLoading(false);
      alert('Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.safe_area}>
      <CustomHeader goBack={() => history.goBack()} title="Change Password" />
      <div style={styles.main_view}>
        <ScrollView style={styles.scrollView}>

          <div style={styles.image_view}>
            <Image
              resizeMode='contain'
              style={styles.image}
              src="../assets/images/logo.png"
              alt="Logo"
            />
          </div>

          <Text style={styles.labelText}>
            Old Password <span style={{ color: 'red' }}>*</span>
          </Text>

          <InputField
            LeftIcon={<LockIcon />}
            onChangeText={setOldPassword}
            placeholder='Old Password'
            value={oldPassword}
            isPassword={true}
          />

          <Text style={styles.labelText}>
            New Password <span style={{ color: 'red' }}>*</span>
          </Text>

          <InputField
            LeftIcon={<LockIcon />}
            onChangeText={setPassword}
            placeholder='Password'
            value={password}
            isPassword={true}
          />

          <Text style={styles.labelText}>
            Confirm Password <span style={{ color: 'red' }}>*</span>
          </Text>

          <InputField
            LeftIcon={<LockIcon />}
            onChangeText={setConfirmPassword}
            placeholder='Confirm Password'
            value={confirmPassword}
            isPassword={true}
          />

        </ScrollView>
        <CustomButton
          onPress={handleChange}
          title="Change"
          loading={isLoading}
        />
      </div>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe_area: {
    flex: 1
  },
  main_view: {
    flex: 1,
    padding: 20
  },
  image_view: {
    height: 80,
    width: "40%",
    marginTop: 20,
    alignSelf: "center"
  },
  image: {
    height: "100%",
    width: "100%"
  },
  labelText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    fontFamily: fonts.regular,
    color: COLORS.text_black_color
  },
  forgot_password_view: {
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 5,
  },

  forgotPassword: {
    marginLeft: 'auto',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: fonts.regular,
    color: COLORS.text_black_color
  },

  heading: {
    paddingTop: 40,
    fontSize: 24,
    fontWeight: '500',
    textAlign: "center",
    color: COLORS.text_black_color,
    fontFamily: fonts.regular
  },
  para: {
    paddingTop: 5,
    fontSize: 16,
    paddingHorizontal: 30,
    textAlign: 'center',
    fontWeight: '400',
  },
  button: {
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: COLORS.text_black_color,
    padding: 10,
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    color: COLORS.text_black_color
  },
  bold: {
    fontWeight: '700',
  },
  socialAuthBtn: {
    width: '48%',
    height: 50,
    borderColor: '#D0D5DD',
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    margin: 5,
  },
});

export default ChangePassword;
