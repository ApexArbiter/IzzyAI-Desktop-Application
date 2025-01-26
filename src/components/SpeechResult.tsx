import React from 'react';
import {Actionsheet, Box} from 'native-base';
import {View, StyleSheet, Text, Image} from 'react-native';
import CustomButton from './Button';

const IzzyDialogue = ({text}: any) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '90%',
        marginTop: 30,
        marginLeft: 20,
      }}>
      <Image source={require('../assets/images/izzy_bot.png')} />
      <View style={{marginLeft: 15, marginTop: 10}}>
        <Text style={[styles.base, {maxWidth: 230}]}>{text}</Text>
      </View>
    </View>
  );
};

const UserDialogue = ({showSecondLine, username}: any) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '90%',
        marginTop: 30,
        marginRight: 20,
      }}>
      <Image source={require('../assets/images/izzy_dialogue.png')} />
      <View style={{marginLeft: 10, marginTop: 10}}>
        <Image
          style={{height: 32, width: 32, borderRadius: 100}}
          source={require('../assets/images/avatar.png')}
        />
        <Text style={[styles.base, {textAlign: 'center'}]}>{username}</Text>
      </View>
    </View>
  );
};

function SpeechResult({closeDetails, detailsOpen, navigation}: any) {
  return (
    <Actionsheet isOpen={detailsOpen} onClose={() => closeDetails(false)}>
      <Actionsheet.Content style={{}}>
        <Box w="100%" h={550} px={4}>
          <Text
            style={[
              styles.base,
              {
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 30,
              },
            ]}>
            Results
          </Text>

          <IzzyDialogue text="Hello there! you can start saying words you feel difficult to pronounce" />
          <UserDialogue username="You" />

          <View
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 'auto',
            }}>
            <CustomButton title="Try Again" />
          </View>
        </Box>
      </Actionsheet.Content>
    </Actionsheet>
  );
}

export default SpeechResult;

const styles = StyleSheet.create({
  base: {
    fontFamily: 'SF-Pro-Display-Regular',
    color: '#111920',
  },
});
