import React from 'react';
import {Actionsheet, Box} from 'native-base';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import CustomButton from './Button';

const DarkButton = (props: any) => {
  return (
    <TouchableOpacity onPress={props.onPress} style={styles.darkButton}>
      <Text style={styles.buttonText}>{props.title}</Text>
    </TouchableOpacity>
  );
};

const Card = ({title, onPress}: any) => {
  return (
    <View style={styles.cardContainer}>
      <View>
        <Text style={[styles.base, {fontSize: 20, fontWeight: '500'}]}>
          {title}
        </Text>
      </View>
      <DarkButton onPress={onPress} title="Start" />
    </View>
  );
};

function VoiceDisorderDetails({
  closeDetails,
  detailsOpen,
  navigation,
  sessionId,
}: any) {
  console.log('Session', sessionId);
  return (
    <Actionsheet isOpen={detailsOpen} onClose={() => closeDetails(false)}>
      <Actionsheet.Content style={{}}>
        <Box w="100%" h={350} px={4}>
          <Text
            style={[
              styles.base,
              {textAlign: 'center', fontSize: 16, fontWeight: '500'},
            ]}>
            Stammering Passages
          </Text>

          <View
            style={{
              marginTop: 30,
              display: 'flex',
              alignItems: 'center',
            }}>
            {sessionId && (
              <Card
                onPress={() =>
                  navigation.navigate('passagePage', {sessionId: sessionId})
                }
                title="Grandfather Passage"
              />
            )}
            {sessionId && (
              <Card
                onPress={() =>
                  navigation.navigate('passagePage2', {sessionId: sessionId})
                }
                title="The Rainbow Passage"
              />
            )}
          </View>
        </Box>
      </Actionsheet.Content>
    </Actionsheet>
  );
}

export default VoiceDisorderDetails;

const styles = StyleSheet.create({
  base: {
    fontFamily: 'SF-Pro-Display-Regular',
    color: '#111920',
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: '#0CC8E8',
    borderRadius: 16,
    padding: 14,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
    gap: 20,
  },
  darkButton: {
    marginLeft: 'auto',
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#111920',
    padding: 10,
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 24,
    paddingRight: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
