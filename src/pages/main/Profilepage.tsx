import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomHeader from '../../components/CustomHeader';
import GearIcon from '../../assets/GearIcon';
import GradientChevronRight from '../../assets/GradientChevronRight';
import UserBioIcon from '../../assets/UserBioIcon';
import QuestionMarkIcon from '../../assets/QuestionMarkIcon';
import LogoutIcon from '../../assets/LogoutIcon';
import { useDataContext } from '../../contexts/DataContext';
import { useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { COLORS, fonts } from '../../theme';
import { SvgXml } from 'react-native-svg';
import { subscription_icon } from "../../assets/icons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import FeedbackModal from '../../components/FeedbackModal';


function ProfilePage({ navigation }: any) {
  const { userDetail, updateUserDetail } = useDataContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigateBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    updateUserDetail({});
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safe_area} >
      <CustomHeader title="My Profile" goBack={navigateBack} />
      <View style={styles.main_view}>
        <ScrollView
          showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#0cc8e81f', '#2deeaa1f']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 0.0 }}
            style={[styles.linearGradient, { marginTop: 40 }]}>
            <View style={styles.profile_row}>
              <View style={styles.profile_image_view} >
                <Image
                  source={{ uri: userDetail.avatarUrl }}
                  style={styles.profile_image}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.text_view}>
                <Text
                  style={[
                    styles.base,
                    {
                      fontSize: 20,
                      fontWeight: '500',
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {userDetail.FullName}
                </Text>
                <Text
                  style={[
                    styles.base,
                    {
                      fontSize: 15,
                      fontWeight: '500',
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {userDetail.email}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showLogoutModal}
            onRequestClose={() => setShowLogoutModal(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  Are you sure you want to logout?
                </Text>
                <View style={styles.modalButtonsView}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowLogoutModal(false)}>
                    <Text style={styles.modalButtonText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleLogout}>
                    <Text style={styles.modalButtonText}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <LinearGradient
            colors={['#0cc8e81f', '#2deeaa1f']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 0.0 }}
            style={[styles.linearGradient, { marginTop: 20 }]}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigation.navigate("Settings")}
              style={styles.profile_row}>
              <GearIcon />
              <View
                style={styles.text_view}>
                <Text
                  style={[
                    styles.base,
                    { fontSize: 15, fontWeight: '500' },
                  ]}>
                  Settings
                </Text>
              </View>
              <GradientChevronRight />
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#0cc8e81f', '#2deeaa1f']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 0.0 }}
            style={[styles.linearGradient, { marginTop: 20 }]}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ManageSubscriptions')
              }}
              style={styles.profile_row}>
              <SvgXml
                xml={subscription_icon}
                style={{ width: 10 }}
                width={23}
              />
              <View
                style={styles.text_view}>
                <Text
                  style={[
                    styles.base,
                    { fontSize: 15, fontWeight: '500' },
                  ]}>
                  Manage Subscriptions
                </Text>
              </View>
              <GradientChevronRight />
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#0cc8e81f', '#2deeaa1f']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 0.0 }}
            style={[styles.linearGradient, { marginTop: 20 }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('bioDataPage')}
              style={styles.profile_row}>
              <UserBioIcon />
              <View
                style={styles.text_view}>
                <Text
                  style={[
                    styles.base,
                    { fontSize: 15, fontWeight: '500' },
                  ]}>
                  Bio Data
                </Text>
              </View>
              <GradientChevronRight />
            </TouchableOpacity>
          </LinearGradient>


          <LinearGradient
            colors={['#0cc8e81f', '#2deeaa1f']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 0.0 }}
            style={[styles.linearGradient, { marginTop: 20 }]}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigation.navigate("AboutUs")}
              style={styles.profile_row}>
              <QuestionMarkIcon />
              <View
                style={styles.text_view}>
                <Text
                  style={[
                    styles.base,
                    { fontSize: 15, fontWeight: '500' },
                  ]}>
                  About App
                </Text>
              </View>
              <GradientChevronRight />
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#0cc8e81f', '#2deeaa1f']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 0.0 }}
            style={[styles.linearGradient, { marginTop: 20 }]}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setShowModal(true)}
              style={styles.profile_row}>
              <MaterialIcons name='feedback' color={COLORS.black} size={23} />
              <View
                style={styles.text_view}>
                <Text
                  style={[
                    styles.base,
                    { fontSize: 15, fontWeight: '500' },
                  ]}>
                  Feedback
                </Text>
              </View>
              <GradientChevronRight />
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#0cc8e81f', '#2deeaa1f']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 0.0 }}
            style={[styles.linearGradient, { marginTop: 20 }]}>
            <TouchableOpacity
              onPress={() => setShowLogoutModal(true)}
              style={styles.profile_row}>
              <LogoutIcon />
              <View
                style={styles.text_view}>
                <Text
                  style={[
                    styles.base,
                    { fontSize: 15, fontWeight: '500' },
                  ]}>
                  Logout
                </Text>
              </View>
              <GradientChevronRight />
            </TouchableOpacity>
          </LinearGradient>



          <FeedbackModal
            visible={showModal}
            onPressClose={() => setShowModal(false)}
          />


        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe_area: {
    flex: 1
  },
  main_view: {
    flex: 1,
    paddingHorizontal: 20
  },
  base: {
    fontFamily: fonts.regular,
    color: '#111920',
  },
  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 16,
  },
  profile_row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  profile_image_view: {
    height: 80,
    width: 80,
    borderRadius: 100,
  },
  profile_image: {
    height: "100%",
    width: "100%",
    borderRadius: 100,
  },
  text_view: {
    flex: 1,
    marginLeft: 12
  },


  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    gap: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  modalButtonsView: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#0cc8e8',
    width: 80,
    alignItems: 'center',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'red',
    width: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProfilePage;
