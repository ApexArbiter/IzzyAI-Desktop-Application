import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BottomNavigation from './BottomNavigation';
import HomePage from '../pages/main/HomePage';
import ProfilePage from '../pages/main/Profilepage';
// import AssessmentsPage from '../pages/main/AssessmentsPage';
import AssessmentPage from '../pages/AssessmentPage';
import TherapistsPage from '../pages/main/TherapistsPage';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="home"
      tabBar={props => <BottomNavigation {...props} />}>
      <Tab.Screen name="home" component={HomePage} />
      <Tab.Screen name="assessments" component={AssessmentPage} />
      <Tab.Screen name="therapists" component={TherapistsPage} />
      <Tab.Screen name="profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}

export default TabNavigator;
