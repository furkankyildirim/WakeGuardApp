import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/dist/SimpleLineIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import Permissions from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import Store from '../assets/store/Store'
import { observer } from 'mobx-react';
import axios from 'axios';
import { API_KEY, GEOCODING_API } from '../assets/store/GoogleAPI'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Purchase from '../assets/components/Purchase';
import { mapStyle } from '../assets/store/MapStyle';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {strings} from '../assets/store/strings'
import firestore from '@react-native-firebase/firestore';



const { height, width } = Dimensions.get('window');

@observer
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRadiusColor: "#2284F0",
      passiveRadiusColor: "rgba(100,100,100,0.1125)",
      radiusTextColor: "#fff",
      passiveRadiusValueTextColor: "rgba(255,255,255,0.725)",
      radius: 50,
      map: this.map,
      region: {},
      isModalVisible: false,
      pin: true
    };
  }

  async componentDidMount() {
    Store._mapReferance(this.map)
    PushNotificationIOS.requestPermissions()
    this.checkPermissions()
    await this.getData()
  }

  getData = async () => {
    const historyData = await AsyncStorage.getItem('History')
    const favoriteData = await AsyncStorage.getItem('Favorite')

    if (historyData != null) {
      Store._history(historyData)
    } else {
      console.log(Store.history)
    }

    if (favoriteData != null) {
      Store._favorite(favoriteData)
    } else {
      console.log(Store.favorite)
    }
  }

  sendLocation = (position) => {
    Store._latitude(position.latitude)
    Store._longitude(position.longitude)
    Store._latitudeDelta(position.latitudeDelta)
    Store._longitudeDelta(position.longitudeDelta)
    Store._mapReferance(this.map)
  }

  checkPermissions = async () => {
    let permission = await Permissions.check('location')
    console.log(permission)
    if (permission === 'authorized') {
      this.setFirstConfigure()
    } else {
      permission = await Permissions.request('location')
      if (permission === 'authorized') {
        Alert.alert(
          `${strings.access_location_title}`,
          `${strings.access_location_info}`,
          [
            {
              text: `${strings.dont_allow}`, style: 'default', onPress: () => console.log('Cancel Pressed')
            },
            {
              text: `${strings.settings}`, style: 'default',
              onPress: async () => {
                await Permissions.openSettings()
                permission = await Permissions.check('location')
                console.log(permission)
                permission === 'authorized' ? this.setFirstConfigure() : this.setState({ userlocation: false })
              }
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          `${strings.no_access_location_title}`,
          `${strings.no_access_location_info}`,
          [
            {
              text: `${strings.settings}`, style: 'default',
              onPress: async () => {
                await Permissions.openSettings()
                permission = await Permissions.check('location')
                console.log(permission)
                permission === 'authorized' ? this.setFirstConfigure() : this.setState({ userlocation: false })
              }
            }
          ]
        )
        this.setState({ userlocation: false })
      }

    }
  }

  setFirstConfigure = async () => {
    const { coords } = await this.getCurrentPosition()
    this.setState({
      region: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0075,
        longitudeDelta: 0.0075,
      },
    })
    Store._latitude(coords.latitude)
    Store._longitude(coords.longitude)
    Store._latitudeDelta(0.0075)
    Store._longitudeDelta(0.0075)
    setTimeout(() => {
      this.setState({ showMap: true })
      this.circle.setNativeProps({ fillColor: "rgba(143,30,19,0.45)", strokeColor: 'rgb(255,92,78)' })
      Store._mapReferance(this.map)
    }, 1)
  }

  goUserLocation = async () => {
    const { coords } = await this.getCurrentPosition()
    Store._longitude(coords.longitude)
    Store._latitude(coords.latitude)
    Store._latitudeDelta(0.0075)
    Store._longitudeDelta(0.0075)

    this.map.animateToRegion({
      latitude: Store.latitude,
      longitude: Store.longitude,
      latitudeDelta: Store.latitudeDelta,
      longitudeDelta: Store.longitudeDelta
    }, 100)
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition((position => resolve(position)), reject,
        { enableHighAccuracy: true, timeout: 1000, maximumAge: 1000, })
    })
  }

  getPositionInfo = async  () => {
    const info = await axios.get(`${GEOCODING_API}key=${API_KEY}&latlng=${Store.latitude},${Store.longitude}
    &location_type=ROOFTOP&result_type=street_address`);
    if(info.data.status === 'OK'){
      Store._targetName(info.data.results[0].formatted_address)
    }else{
      Store._targetName(strings.undefined_adress)
    }
  }

  setNavigate = async () => {
    Store._radius(this.state.radius)
    await this.getPositionInfo()

    const monthNames = [strings.january,strings.february,strings.march,strings.april,strings.may,strings.june,
      strings.july,strings.august,strings.september,strings.october,strings.november,strings.december];

    const date = new Date()
    console.log(date)
    const history = {
      date: `${date.getDate()} ${monthNames[date.getMonth()]}`,
      time: `${date}`,
      adress: Store.targetName,
      radius: this.state.radius,
      region: {
        latitude: Store.latitude,
        longitude: Store.longitude,
        latitudeDelta: Store.latitudeDelta,
        longitudeDelta: Store.longitudeDelta
      }
    }
    console.log(history)
    if(Store.token >0){
      Store._alarm(true)
      Store._addHistory(history)
      AsyncStorage.setItem('History', Store.history)
      Store._token(Store.token - 1);
      firestore().collection('Users').doc(Store.userId).update({
        token: Store.token
      }).catch(e => console.log(e))
      this.props.navigation.navigate("ActiveAlarm")
    }else{Store._purchase(true)}

  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {this.state.showMap === true ?
          <View style={{ flex: 1 }}>
            <Purchase />
            <SafeAreaView style={styles.componentContainer}>
              <MapView style={styles.map}
                ref={map => (this.map = map)}
                provider={PROVIDER_GOOGLE}
                rotateEnabled={true}
                showsUserLocation={true}
                showsTraffic={false}
                showsMyLocationButton={false}
                customMapStyle={mapStyle}
                initialRegion={{
                  latitude: Store.latitude,
                  longitude: Store.longitude,
                  latitudeDelta: Store.latitudeDelta,
                  longitudeDelta: Store.longitudeDelta
                }}
                onRegionChange={region => {
                  this.sendLocation(region)
                }}
              >
                <Marker coordinate={this.state.pin ? { latitude: Store.latitude, longitude: Store.longitude, } : null}
                  pinColor='rgb(255,92,78)' key={0} />
                <Circle ref={ref => (this.circle = ref)} center={{ latitude: Store.latitude, longitude: Store.longitude, }} strokeWidth={1} zIndex={1}
                  radius={this.state.radius} onPress={() => this.state.pin ? console.log(true) : console.log(false)} />
              </MapView>
              <View style={styles.topComponent}>
                <TouchableOpacity onPress={this.props.navigation.openDrawer} style={styles.menuButton}>
                  <Icon name="menu" size={RFValue(24)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Store._purchase(true)} style={styles.readyTokensContainer}>
                  <Text style={styles.readyTokenCount}>{Store.token}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.mainComponent}>
                <TouchableOpacity style={styles.myLocation} onPress={async () => await this.goUserLocation()}>
                  <Icon name="cursor" size={RFValue(24)} color="#2284F0" />
                </TouchableOpacity>
                <View style={styles.alarmSettings}>
                  <View style={styles.chooseDestinationContainer}>
                  <Text style={styles.mainComponentTitle}>{strings.choose_destination}</Text>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate("SearchScreen")} style={styles.locationInput}>
                      <Icon name="magnifier" size={RFValue(16)} color="rgba(155,155,155,0.875)" />
                      <Text numberOfLines={1} style={styles.adress}>{Store.targetName}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.setRadiusContainer]}>
                  <Text style={styles.mainComponentTitle}>{strings.set_radius_m}</Text>
                    <View style={styles.radiusInput}>
                      <TouchableOpacity onPress={() => { this.setState({ radius: 50 }) }} style={[styles.radiusOption, styles.radiusOption1, { backgroundColor: this.state.radius === 50 ? this.state.activeRadiusColor : this.state.passiveRadiusColor }]}>
                        <Text style={[styles.radiusOptionText, { color: this.state.radius === 50 ? this.state.radiusTextColor : this.state.passiveRadiusValueTextColor }]}>50</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { this.setState({ radius: 100 }) }} style={[styles.radiusOption, styles.radiusOption2, { backgroundColor: this.state.radius === 100 ? this.state.activeRadiusColor : this.state.passiveRadiusColor }]}>
                        <Text style={[styles.radiusOptionText, { color: this.state.radius === 100 ? this.state.radiusTextColor : this.state.passiveRadiusValueTextColor }]}>100</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { this.setState({ radius: 250 }) }} style={[styles.radiusOption, styles.radiusOption3, { backgroundColor: this.state.radius === 250 ? this.state.activeRadiusColor : this.state.passiveRadiusColor }]}>
                        <Text style={[styles.radiusOptionText, { color: this.state.radius === 250 ? this.state.radiusTextColor : this.state.passiveRadiusValueTextColor }]}>250</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { this.setState({ radius: 500 }) }} style={[styles.radiusOption, styles.radiusOption4, { backgroundColor: this.state.radius === 500 ? this.state.activeRadiusColor : this.state.passiveRadiusColor }]}>
                        <Text style={[styles.radiusOptionText, { color: this.state.radius === 500 ? this.state.radiusTextColor : this.state.passiveRadiusValueTextColor }]}>500</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { this.setState({ radius: 1000 }) }} style={[styles.radiusOption, styles.radiusOption5, { backgroundColor: this.state.radius === 1000 ? this.state.activeRadiusColor : this.state.passiveRadiusColor }]}>
                        <Text style={[styles.radiusOptionText, { color: this.state.radius === 1000 ? this.state.radiusTextColor : this.state.passiveRadiusValueTextColor }]}>1000</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { this.setState({ radius: 2500 }) }} style={[styles.radiusOption, styles.radiusOption6, { backgroundColor: this.state.radius === 2500 ? this.state.activeRadiusColor : this.state.passiveRadiusColor }]}>
                        <Text style={[styles.radiusOptionText, { color: this.state.radius === 2500 ? this.state.radiusTextColor : this.state.passiveRadiusValueTextColor }]}>2500</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => this.setNavigate()} style={styles.mainButton}>
                <Text style={styles.mainButtonText}>{strings.create_new_alarm_small}</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
          :
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
            <ActivityIndicator size="small" />
          </View>}

      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
    position: "absolute",
    top: 0,
  },
  componentContainer: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    bottom: 0,
    width: width,
    height: height,
  },
  topComponent: {
    width: width,
    height: width * 0.115,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: width * 0.02,
  },
  mainComponent: {
    width: width,
    height: width * 0.65 + width * 0.0275,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuButton: {
    height: width * 0.115,
    width: width * 0.115,
    backgroundColor: "rgba(10,10,10,0.6)",
    borderRadius: 8,
    marginLeft: width * 0.0275,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  readyTokensContainer: {
    height: width * 0.115,
    minWidth: width * 0.115,
    paddingHorizontal: 7.5,
    marginRight: width * 0.0275,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2284F0",
    borderRadius: 8,
    justifyContent: "center",
  },
  myLocation: {
    height: width * 0.115,
    minWidth: width * 0.115,
    marginRight: width * 0.0275,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,10,10,0.6)",
    borderRadius: 8,
    justifyContent: "center",
    position: "absolute",
    bottom: width * 0.65 + width * 0.0275 + width * 0.0275,
    right: 0,
  },
  readyTokenCount: {
    color: "#fff",
    fontSize: RFValue(24),
  },
  mainButton: {
    width: width - (width * 0.0275 * 2),
    height: width * 0.115,
    backgroundColor: "#2284F0",
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: width * 0.0275,
  },
  mainButtonText: {
    color: "#fff",
    fontSize: RFValue(18),
  },
  alarmSettings: {
    width: width - (width * 0.0275 * 2),
    height: width * 0.65 - (width * 0.115 + width * 0.0275 + width * 0.0275),
  },
  chooseDestinationContainer: {
    width: "100%",
    height: (width * 0.65 - (width * 0.115 + width * 0.0275 + width * 0.0275)) * 0.5,
    display: "flex",
    flexDirection: "column",
    justifyContent: 'space-evenly',
    backgroundColor: "rgba(10,10,10,0.6)",
    borderRadius: 8,
  },
  setRadiusContainer: {
    width: "100%",
    height: (width * 0.65 - (width * 0.115 + width * 0.0275 + width * 0.0275)) * 0.5,
    display: "flex",
    flexDirection: "column",
    justifyContent: 'space-evenly',
    backgroundColor: "rgba(10,10,10,0.6)",
    borderRadius: 8,
    marginTop: width * 0.0275,
  },
  locationInput: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: width - (width * 0.0275 * 2) - (width * 0.0275 * 2),
    marginLeft: width * 0.0275,
    backgroundColor: "rgba(100,100,100,0.225)",
    height: width * 0.0875,
    borderRadius: 8,
  },
  radiusInput: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: width - (width * 0.0275 * 2) - (width * 0.0275 * 2),
    marginLeft: width * 0.0275,
    height: width * 0.0875,
    borderRadius: 8,
    backgroundColor: "rgba(100,100,100,0.1125)",
  },
  radiusOptionText: {
    fontSize: RFValue(14),
  },
  mainComponentTitle: {
    fontSize: RFValue(16),
    marginLeft: width * 0.0275 * 3 / 2,
    color: "rgba(255,255,255,0.825)",
  },
  adress: {
    fontSize: RFValue(14),
    width: width * 0.75,
    color: "rgba(255,255,255,0.725)",
  },
  radiusOption: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  radiusOption1: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  radiusOption6: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  modal: {
    backgroundColor: "#fff",
    height: width * 0.3 * 3 + width * 0.115 + width * 0.0275 * 5,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  modalCancelButton: {
    width: "93.5%",
    height: width * 0.115,
    backgroundColor: "rgb(255,92,78)",
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: width * 0.0275,
  },
  modalCancelButtonText: {
    color: "#fff",
    fontSize: RFValue(18),
  },
  paymentMethodCard: {
    width: "93.5%",
    height: width * 0.3,
    borderRadius: 8,
    marginTop: width * 0.0275,
  },
  deneme: {
    width: "100%",
    height: width * 0.3,
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pmcTextContainer: {
    height: width * 0.185,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  paymentMethodTitle: {
    color: "#fff",
    fontSize: RFValue(20),
    marginLeft: width * 0.0275,
    fontWeight: "500"
  },
  paymentMethodInfo: {
    width: width * 0.5,
    color: "#fff",
    fontSize: RFValue(13),
    marginLeft: width * 0.0275,
  },
  fee: {
    color: "#fff",
    fontSize: RFValue(18),
    marginRight: width * 0.0275,
    borderWidth: 1.5,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
  }
});