import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Vibration, Appearance,AppRegistry } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/dist/SimpleLineIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import Store from '../assets/store/Store'
import { observer } from 'mobx-react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Geolocation from 'react-native-geolocation-service';
import Modal from 'react-native-modal';
import SoundPlayer from 'react-native-sound-player';
import { mapStyle } from '../assets/store/MapStyle';
import { getPreciseDistance } from 'geolib';
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { strings } from '../assets/store/strings'

const colorScheme = Appearance.getColorScheme();

const { height, width } = Dimensions.get('window');

const ActiveAlarm = observer(({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isAlarmStopped, setIsAlarmStopped] = useState(false)

  const map = useRef(null);
  const circle = useRef(null);

  useEffect(() => {
    if (Platform.OS === "ios") {
      circle.current.setNativeProps(
        { 
          fillColor: "rgba(143,30,19,0.45)", 
          strokeColor: 'rgb(255,92,78)', 
          strokeWidth: 1.5, radius: Store.radius 
        }
      )
    } else if (Platform.OS === "android") {
      PushNotification.createChannel(
        {
          channelId: "channel-id",
          channelName: "My channel",
          channelDescription: "A channel to categorise your notifications",
        },
        (created) => console.log(`createChannel returned '${created}'`)
      );
      PushNotification.configure({
        onNotification: function (notification) {
          console.log("NOTIFICATION:", notification);
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        },
        popInitialNotification: true,
        requestPermissions: Platform.OS === 'ios'
      });
    }

    BackgroundGeolocation.start();
    const interval = setInterval(() => {
      BackgroundGeolocation.getCurrentLocation(position => {
        console.log(position.latitude,  position.longitude)
        const distance = getPreciseDistance({ latitude: position.latitude, longitude: position.longitude },
          { latitude: Store.latitude, longitude: Store.longitude }, 0.01) - Store.radius;
        console.log(distance)
        Store._remaining(distance)
        if (Store.remaining <= 0 && Store.alarm) {
          if (Platform.OS === "ios") {
            PushNotificationIOS.presentLocalNotification({
              alertTitle: `${strings.notification_title}`,
              alertBody: `${strings.notification_info}`,
              applicationIconBadgeNumber: 0,
              category: 'SALE_NOTIFICATION',
              isSilent: false,
              soundName: 'default',
            });
            playSound();
            Vibration.vibrate([1000], true);
          } else if (Platform.OS === "android") {
            PushNotification.localNotification({
              channelId: "channel-id",
              title: `${strings.notification_title}`,
              message: `${strings.notification_info}`,
            })
            playSound()
            Vibration.vibrate([1000, 1000], true);
          }
          setIsModalVisible(true)
          BackgroundGeolocation.stop()
          clearInterval(interval)
        }
      }, () => {
        console.log('Position could not be determined.');
      }, { enableHighAccuracy: true, timeout: 1000, maximumAge: 1000, })
    }, 1000)
  }, [])



  playSound = () => {
    SoundPlayer.playSoundFile('sound', 'mp3')
    SoundPlayer.onFinishedPlaying(() => SoundPlayer.playSoundFile('sound', 'mp3'))
  }

  closeModal = () => {
    setIsModalVisible(false)
    SoundPlayer.stop()
    Vibration.cancel();
    Store._alarm(false)
    navigation.goBack()
  }

  stopAlarm = () => {
    BackgroundGeolocation.stop();
    setIsAlarmStopped(true)
    Store._alarm(false)
    SoundPlayer.stop()
    Vibration.cancel();
  }

  goUserLocation = async () => {
    const { coords } = await getCurrentPosition()
    console.log(coords)
    map.current.animateToRegion({
      latitude: parseFloat(coords.latitude.toString().substring(0, 7)),
      longitude: parseFloat(coords.longitude.toString().substring(0, 7)),
      latitudeDelta: 0.0075,
      longitudeDelta: 0.0075
    }, 100)
  }

  goTargetLocation = () => {
    map.current.animateToRegion({
      latitude: Store.latitude,
      longitude: Store.longitude,
      latitudeDelta: Store.latitudeDelta,
      longitudeDelta: Store.longitudeDelta
    }, 100)
  }

  getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition((position) => resolve(position), (error => {
        getCurrentPosition();
        reject(error);
      }), 
      {
        timeout: 10000,
        maximumAge: 1000,
        enableHighAccuracy: true,
      });
    });
  };

  checkRemaining = async () => {
    const { coords } = await getCurrentPosition()
    const coordinate = coords
    console.log(coordinate)
  }

  addFavorite = () => {
    const newFav = JSON.parse(Store.history)[0]
    Store._addFavorite(newFav)
    AsyncStorage.setItem('Favorite', Store.favorite)
  }

  return (
    <View style={styles.mainContainer}>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={() => stopAlarm()} style={[styles.stopTheAlarmButton, { display: isAlarmStopped === false ? "flex" : "none" }]}>
            <Icon name="close" size={RFValue(112.5)} color="#fff" />
          </TouchableOpacity>
          <View style={[styles.buttonCon, { display: isAlarmStopped === false ? "none" : "flex" }]}>
            <TouchableOpacity style={styles.addToFavsButton} onPress={() => [addFavorite(), closeModal()]}>
              <Text style={styles.modalCancelButtonText}>{strings.add_to_favorites}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => this.closeModal()}>
              <Text style={styles.modalCancelButtonText}>{strings.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <SafeAreaView style={styles.componentContainer}>
        <MapView style={styles.map}
          ref={map}
          provider={PROVIDER_GOOGLE}
          rotateEnabled={true}
          showsUserLocation={true}
          followsUserLocation={true}
          showsTraffic={false}
          customMapStyle={mapStyle}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: Store.latitude,
            longitude: Store.longitude,
            latitudeDelta: Store.latitudeDelta,
            longitudeDelta: Store.longitudeDelta
          }}

        >
          <Marker coordinate={{ latitude: Store.latitude, longitude: Store.longitude, }}
            pinColor='rgb(255,92,78)' key={0} />
              <Circle
                ref={circle}
                center={{ latitude: Store.latitude, longitude: Store.longitude }}
                strokeWidth={1}
                zIndex={1}
                radius={Store.radius}
                {...Platform.OS === "android" ?
                  {
                    fillColor: "rgba(143,30,19,0.45)",
                    strokeColor: 'rgb(255,92,78)'
                  } : null}
                onPress={() => (pin ? console.log(true) : console.log(false))}
              />
        </MapView>
        <View style={styles.topComponent}>

        </View>
        <View style={styles.mainComponent}>

          <View style={styles.alarmSettings}>
            <TouchableOpacity style={[styles.setRadiusContainer]} onPress={() => [this.goTargetLocation()]}>
              <View style={styles.radiusSelectionContainer}>
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <View style={{ marginRight: width * 0.0275 }}>
                    <Icon name="target" size={RFValue(22)} color="#2284F0" />
                  </View>
                  <Text style={styles.mainComponentTitle}>{strings.radius}</Text>
                </View>
                <Text style={styles.radiusSelectionValue}>{`${Store.radius}m`}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.setRadiusContainer]} onPress={() => this.goUserLocation()}>
              <View style={styles.remainingDistanceContainer}>
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <View style={{ marginRight: width * 0.0275 }}>
                    <Icon name="graph" size={RFValue(22)} color="#2284F0" />
                  </View>
                  <Text style={styles.mainComponentTitle}>{strings.remaining}</Text>
                </View>
                <Text style={styles.remainingCounter}>{Store.remaining / 1000 > 0 ? `${(Store.remaining / 1000).toFixed(1)}km` : '0.0km'}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.mainButton} onPress={() => [stopAlarm(), navigation.navigate('Home')]}>
            <Text style={styles.mainButtonText}>{strings.cancel_the_alarm}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );

})

export default ActiveAlarm

const styles =
  colorScheme === 'dark'
    ? StyleSheet.create({
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
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
        marginRight: width * 0.0275,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2284F0",
        borderRadius: 8,
        justifyContent: "center",
      },
      targetLocation: {
        height: width * 0.115,
        width: width * 0.115,
        marginRight: width * 0.0275,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(10,10,10,0.6)",
        borderRadius: 8,
        justifyContent: "center",
        position: "absolute",
        bottom: (((width * 0.65 - (width * 0.115 + width * 0.0275 + width * 0.0275)) * 0.5) * 1.075) + width * 0.115 + (width * 0.0275 * 3),
        right: 0,
      },
      readyTokenCount: {
        color: "#fff",
        fontSize: RFValue(24),
      },
      mainButton: {
        width: width - (width * 0.0275 * 2),
        height: width * 0.115,
        backgroundColor: "rgb(255,92,78)",
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
      setRadiusContainer: {
        width: ((width - (width * 0.0275 * 2)) / 2) - (width * 0.0275 * 0.5),
        height: ((width * 0.65 - (width * 0.115 + width * 0.0275 + width * 0.0275)) * 0.5) * 1.075,
        display: "flex",
        flexDirection: "row",
        justifyContent: 'space-evenly',
        backgroundColor: "rgba(10,10,10,0.6)",
        borderRadius: 8,
        marginTop: width * 0.0275,
      },
      mainComponentTitle: {
        fontSize: RFValue(16),
        color: "rgba(255,255,255,0.825)",
        marginTop: 3.5,
      },
      radiusSelectionContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: 'space-evenly',
        alignItems: "center",
        borderWidth: 2,
        borderColor: 'rgba(100,100,100,0.45)',
        borderRadius: 8,
      },
      remainingDistanceContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: 'space-evenly',
        alignItems: "center",
        borderWidth: 2,
        borderColor: 'rgba(100,100,100,0.45)',
        borderRadius: 8,
      },
      alarmSettings: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: (width - (width * 0.0275 * 2)),
        paddingBottom: width * 0.0275,
      },
      remainingCounter: {
        color: "#fff",
        fontSize: RFValue(36),
      },
      radiusSelectionValue: {
        color: "#fff",
        fontSize: RFValue(36),
      },
      modal: {
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      },
      modalCancelButton: {
        width: "94%",
        height: width * 0.115,
        backgroundColor: "rgb(255,92,78)",
        borderRadius: 8,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: width * 0.0275,
      },
      addToFavsButton: {
        width: "94%",
        height: width * 0.115,
        backgroundColor: "#2284F0",
        borderRadius: 8,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: width * 0.0275,
      },
      buttonCon: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      modalCancelButtonText: {
        color: "#fff",
        fontSize: RFValue(18),
      },
      paymentMethodCard: {
        width: "94%",
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
      },
      stopTheAlarmButton: {
        width: width * 0.45,
        height: width * 0.45,
        borderRadius: width * 0.45 * 0.5,
        backgroundColor: "rgb(255,92,78)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: width * 0.0275,
      }
    })
    : StyleSheet.create({
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
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
        marginRight: width * 0.0275,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2284F0",
        borderRadius: 8,
        justifyContent: "center",
      },
      targetLocation: {
        height: width * 0.115,
        width: width * 0.115,
        marginRight: width * 0.0275,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(10,10,10,0.6)",
        borderRadius: 8,
        justifyContent: "center",
        position: "absolute",
        bottom: (((width * 0.65 - (width * 0.115 + width * 0.0275 + width * 0.0275)) * 0.5) * 1.075) + width * 0.115 + (width * 0.0275 * 3),
        right: 0,
      },
      readyTokenCount: {
        color: "#fff",
        fontSize: RFValue(24),
      },
      mainButton: {
        width: width - (width * 0.0275 * 2),
        height: width * 0.115,
        backgroundColor: "rgb(255,92,78)",
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
      setRadiusContainer: {
        width: ((width - (width * 0.0275 * 2)) / 2) - (width * 0.0275 * 0.5),
        height: ((width * 0.65 - (width * 0.115 + width * 0.0275 + width * 0.0275)) * 0.5) * 1.075,
        display: "flex",
        flexDirection: "row",
        justifyContent: 'space-evenly',
        backgroundColor: "#fff",
        borderRadius: 8,
        marginTop: width * 0.0275,
        borderWidth: 2,
        borderColor: '#ddd',
      },
      mainComponentTitle: {
        fontSize: RFValue(16),
        color: "rgba(0,0,0,0.4)",
        marginTop: 3.5,
      },
      radiusSelectionContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: 'space-evenly',
        alignItems: "center",
      },
      remainingDistanceContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: 'space-evenly',
        alignItems: "center",
      },
      alarmSettings: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: (width - (width * 0.0275 * 2)),
        paddingBottom: width * 0.0275,
      },
      remainingCounter: {
        color: "#000",
        fontSize: RFValue(36),
      },
      radiusSelectionValue: {
        color: "#000",
        fontSize: RFValue(36),
      },
      modal: {
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      },
      modalCancelButton: {
        width: "94%",
        height: width * 0.115,
        backgroundColor: "rgb(255,92,78)",
        borderRadius: 8,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: width * 0.0275,
      },
      addToFavsButton: {
        width: "94%",
        height: width * 0.115,
        backgroundColor: "#2284F0",
        borderRadius: 8,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: width * 0.0275,
      },
      buttonCon: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      modalCancelButtonText: {
        color: "#fff",
        fontSize: RFValue(18),
      },
      paymentMethodCard: {
        width: "94%",
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
      },
      stopTheAlarmButton: {
        width: width * 0.45,
        height: width * 0.45,
        borderRadius: width * 0.45 * 0.5,
        backgroundColor: "rgb(255,92,78)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: width * 0.0275,
      }
    });
