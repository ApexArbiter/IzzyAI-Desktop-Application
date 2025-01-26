import {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import CustomButton from '../components/Button';
import { fonts } from '../theme';

function InstructionsPageTwo({ navigation, route }) {
  // Extract session ID from route params
  const sessionId = route.params?.sessionId;

  // Function to navigate to speechArticulationPage
  const navigate = () => {
    navigation.navigate('voiceDisorderPage', { sessionId: sessionId });
  };

  // Function to navigate back
  const navigateBack = () => {
    navigation.goBack();
  };


  return (
    <SafeAreaView style={{flex:1}} >
      <View style={{flex:1}}>
        <ScrollView
        showsVerticalScrollIndicator={false}  keyboardShouldPersistTaps={"handled"}
          style={{flex: 1}}
          contentContainerStyle={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
          }}>
          <CustomHeader title="Instructions" goBack={navigateBack} />
          <Image
            style={{marginTop: 40}}
            source={require('../assets/images/mouth.png')}
          />

          <Text
            style={[
              styles.base,
              styles.heading,
              {maxWidth: 350, textAlign: 'center'},
            ]}>
            Voice Disorder Screening Instruction
          </Text>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 10,
              maxWidth: '80%',
            }}>
            <Text style={[styles.base, {fontSize: 14, fontWeight: '400'}]}>
              {'\u2B24'}
            </Text>
            <Text
              style={[
                styles.base,
                {
                  fontSize: 14,
                  fontWeight: '400',
                  marginLeft: 10,
                },
              ]}>
              You will be shown some images of random objects and you will have
              to pronounce their names with your mic
            </Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 10,
              maxWidth: '80%',
            }}>
            <Text style={[styles.base, {fontSize: 14, fontWeight: '400'}]}>
              {'\u2B24'}
            </Text>
            <Text
              style={[
                styles.base,
                {
                  fontSize: 14,
                  fontWeight: '400',
                  marginLeft: 10,
                },
              ]}>
              Hit “Record” button and start pronouncing the name of the object
            </Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 10,
              maxWidth: '80%',
            }}>
            <Text style={[styles.base, {fontSize: 14, fontWeight: '400'}]}>
              {'\u2B24'}
            </Text>
            <Text
              style={[
                styles.base,
                {
                  fontSize: 14,
                  fontWeight: '400',
                  marginLeft: 10,
                },
              ]}>
              IzzyAI will respond if you pronounced the name correctly
            </Text>
          </View>

          <CustomButton onPress={() => navigate()} title="Start Now" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.regular,
    color: '#111920',
  },
  heading: {
    paddingTop: 50,
    fontSize: 24,
    fontWeight: '500',
  },
});

export default InstructionsPageTwo;
