import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import ArrowLeft from '../assets/ArrowLeft';
import Skip from '../assets/Skip';

const CustomHeaderBaseline = (props: any) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => props.goBack()}>
        <ArrowLeft />
      </TouchableOpacity>
      <Text style={[styles.base, styles.text]}>{props.title}</Text>
      <TouchableOpacity
        onPress={() => props.navigation.navigate('profileSetupSuccess')}
        style={{marginRight: 10}}></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'SF-Pro-Display-Regular',
    color: '#111920',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 40,
    marginRight: 35,
  },
  container: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginHorizontal: '',
    width: '100%',
  },
});

export default CustomHeaderBaseline;
