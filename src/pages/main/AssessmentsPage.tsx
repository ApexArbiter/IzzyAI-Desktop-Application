import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';

function AssessmentsPage({navigation}: any) {
  return (
    <SafeAreaView style={{flex:1}} >
      <View>
        <ScrollView>
          <Text style={{color: '#000'}}>AssessmentsPage</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
    // <BottomNavigation navigation={navigation} />
  );
}

export default AssessmentsPage;
