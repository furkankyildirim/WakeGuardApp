import 'react-native-gesture-handler';
import React from 'react';
import { LogBox} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './screens/Home'
import SearchScreen from './screens/SearchScreen'
import ActiveAlarm from './screens/ActiveAlarm'
import FavoriteAlarms from './screens/FavoriteAlarms'
import RecentAlarms from './screens/RecentAlarms'

LogBox.ignoreAllLogs();

const App = () => {
  const Main = createStackNavigator();



  return (
    <NavigationContainer>
      <Main.Navigator initialRouteName='Home'>
        <Main.Screen
          name="Home"
          component={Home}
          options={{ gestureEnabled: false, headerShown: false, }} />
        <Main.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{ gestureEnabled: false, headerShown: false, }} />
        <Main.Screen
          name="ActiveAlarm"
          component={ActiveAlarm}
          options={{ gestureEnabled: false, headerShown: false, }} />
        <Main.Screen
          name="RecentAlarms"
          component={RecentAlarms}
          options={{ gestureEnabled: false, headerShown: false, }} />
        <Main.Screen
          name="FavoriteAlarms"
          component={FavoriteAlarms}
          options={{ gestureEnabled: false, headerShown: false, }} />
      </Main.Navigator>
    </NavigationContainer>
  )
}

export default App;