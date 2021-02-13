import React, { Component } from 'react';
import { View, Text, Dimensions,LogBox } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from "react-navigation-stack";
import { createDrawerNavigator } from 'react-navigation-drawer';
import Home from './screens/Home'
import FavoriteAlarms from './screens/FavoriteAlarms'
import RecentAlarms from './screens/RecentAlarms'
import Support from './screens/Support'
import SearchScreen from './screens/SearchScreen'
import ActiveAlarm from './screens/ActiveAlarm'
import Icon from 'react-native-vector-icons/dist/SimpleLineIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import {strings} from './assets/store/strings'

LogBox.ignoreAllLogs(true)
const { height, width } = Dimensions.get('window');

const HomeNavigator = createStackNavigator({
  Home: {
    screen: Home,
    navigationOptions: { headerShown: false, gestureEnabled: true, }
  },
  SearchScreen: {
    screen: SearchScreen,
    navigationOptions: {
      drawerLabel: `${strings.search_screen}`,
      headerShown: false,
      gestureEnabled: false,
      drawerIcon: ({ tintColor }) => (
        <Icon name="magnifier" size={RFValue(20)} color={tintColor} />
      )
    },
  },
  ActiveAlarm: {
    screen: ActiveAlarm,
    navigationOptions: {
      drawerLabel: `${strings.active_alarm}`,
      headerShown: false,
      gestureEnabled: false,
      drawerIcon: ({ tintColor }) => (
        <Icon name="bell" size={RFValue(20)} color={tintColor} />
      )
    },
  },


}, { initialRouteName: 'Home' })

const DrawerNavigator = createDrawerNavigator({
  Home: {
    screen: HomeNavigator,
    navigationOptions: {
      drawerLabel: `${strings.create_new_alarm}`,
      headerShown: false,
      gestureEnabled: false,
      drawerIcon: ({ tintColor }) => (
        <Icon name="map" size={RFValue(20)} color={tintColor} />
      )
    },
  },
  RecentAlarms: {
    screen: RecentAlarms,
    navigationOptions: {
      drawerLabel: `${strings.recent_alarms}`,
      headerShown: false,
      gestureEnabled: false,
      drawerIcon: ({ tintColor }) => (
        <Icon name="clock" size={RFValue(20)} color={tintColor} />
      )
    },
  },
  FavoriteAlarms: {
    screen: FavoriteAlarms,
    navigationOptions: {
      drawerLabel: `${strings.favorite_alarms}`,
      headerShown: false,
      gestureEnabled: false,
      drawerIcon: ({ tintColor }) => (
        <Icon name="star" size={RFValue(20)} color={tintColor} />
      )
    },
  },
  Support: {
    screen: Support,
    navigationOptions: {
      drawerLabel: `${strings.support}`,
      headerShown: false,
      gestureEnabled: false,
      drawerIcon: ({ tintColor }) => (
        <Icon name="support" size={RFValue(20)} color={tintColor} />
      )
    },
  },

},
  {
    drawerPosition: "left",
    drawerWidth: width * 0.7,
    overlayColor: "rgba(0,0,0,0.5)",
    initialRouteName: "Home",
    contentOptions: {
      activeTintColor: "#2284F0",
      itemStyle: {
        height: width * 0.115 * 9 / 7,
        marginTop: width * 0.0275 / 2,
        justifyContent: 'flex-start',
        paddingLeft: RFValue(15),
      },
      labelStyle: {
        fontWeight: "normal",
        fontSize: RFValue(14),
      }
    }
  });

const AppContainer = createAppContainer(DrawerNavigator);
export default class App extends Component {
  render() {
    return (
      <AppContainer theme={'dark'} />
    );
  };
};
