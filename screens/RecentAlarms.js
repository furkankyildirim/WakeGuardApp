import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, TextInput, FlatList } from 'react-native';
import { NavigationContext } from 'react-navigation';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/dist/SimpleLineIcons';
import Swipeout from 'react-native-swipeout';
import Store from '../assets/store/Store';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { observer } from 'mobx-react'
import { strings } from '../assets/store/strings'
import firestore from '@react-native-firebase/firestore';
import Purchase from '../assets/components/Purchase';

const { height, width } = Dimensions.get('window');

@observer
export default class RecentAlarms extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  setNavigate = item => {
    Store._latitude(item.region.latitude)
    Store._longitude(item.region.longitude)
    Store._latitudeDelta(item.region.latitudeDelta)
    Store._longitudeDelta(item.region.longitudeDelta)
    Store._radius(item.radius)

    if (Store.token > 0) {
      Store._alarm(true)
      Store._token(Store.token - 1);
      firestore().collection('Users').doc(Store.userId).update({
        token: Store.token
      }).catch(e => console.log(e))
      this.props.navigation.navigate("ActiveAlarm")
    } else { Store._purchase(true) }
  }

  renderPredictions = ({ item, index }) => {
    const swipeSettings = {
      autoClose: true,
      right: [
        {
          onPress: () => {
            Store._addFavorite(item)
            AsyncStorage.setItem('Favorite', Store.favorite)
          },
          text: `${strings.favorite}`, type: "default",
          backgroundColor: "#2284F0",
        },
        {
          onPress: () => {
            Store._deleteHistory(item)
            AsyncStorage.setItem('History', Store.history)
          },
          text: `${strings.delete}`, type: "delete",
        },
      ],
    }
    return (
      <Swipeout style={{ backgroundColor: "rgba(0,0,0,0)" }} {...swipeSettings} >
        <View style={[styles.listItem]} key={item.place_id}>
          <View style={styles.listItemIcon}>
            <Icon name="clock" size={RFValue(28)} color="#2284F0" />
          </View>
          <View style={styles.listItemTextContainer}>
            <Text numberOfLines={1} style={styles.listItemTitle}>{strings.date}: {item.date} - {strings.radius}: {item.radius}m</Text>
            <Text numberOfLines={1} style={styles.listItemText}>{item.adress}</Text>
          </View>
          <TouchableOpacity style={styles.mapButton} onPress={() => this.setNavigate(item)}>
            <Icon name="map" size={RFValue(24)} color="rgb(255,92,78)" />
          </TouchableOpacity>
        </View>
      </Swipeout>
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <Purchase />
        <View style={styles.topComponent}>
          <TouchableOpacity onPress={this.props.navigation.openDrawer} style={styles.menuButton}>
            <Icon name="menu" size={RFValue(24)} color="#fff" />
          </TouchableOpacity>
        </View>
        <FlatList
          renderItem={this.renderPredictions}
          keyExtractor={(item) => item.number}
          data={JSON.parse(Store.history)}
          pagingEnabled={true}
          showsVerticalScrollIndicator={false}
          style={styles.listComponent}
          horizontal={false}
        />
        <View style={styles.bottomSafeAreaViewBackgroundColor} />
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "rgb(55,68,100)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  topComponent: {
    width: width,
    height: width * 0.115 + width * 0.0275,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: width * 0.02,
    paddingBottom: width * 0.0275,
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
  mapButton: {
    height: width * 0.115,
    width: width * 0.115,
    borderRadius: 8,
    marginLeft: width * 0.0275,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  chooseDestinationContainer: {
    width: width - (width * 0.0275) - width * 0.115,
    height: width * 0.115,
    display: "flex",
    flexDirection: "column",
    justifyContent: 'space-evenly',
    backgroundColor: "rgba(10,10,10,0.6)",
    borderRadius: 8,
  },
  locationInput: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: width - (width * 0.0275) - width * 0.115,
    height: width * 0.115,
    borderRadius: 8,
    marginLeft: 5,
  },
  adress: {
    fontSize: RFValue(15),
    width: width * 0.745,
    color: "rgba(255,255,255,0.85)",
    paddingHorizontal: 5,
    marginRight: 4,
  },
  alarmSettings: {
    marginRight: width * 0.0275,
  },
  listComponent: {
    width: width,
    height: height - (width * 0.115 + width * 0.0275 + width * 0.0275),
    backgroundColor: "rgb(29,33,45)",
    overflow: "hidden",
  },
  listItem: {
    height: width * 0.2,
    borderColor: "rgb(55,68,100)",
    borderBottomWidth: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  firstListItem: {
    borderTopWidth: 1,
    borderColor: "rgb(55,68,100)",
  },
  listItemIcon: {
    height: width * 0.115,
    width: width * 0.115,
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: width * 0.0275,
  },
  listItemTextContainer: {
    width: width - (width * 0.115 * 2) - (width * 0.0275 * 4),
    height: "57.5%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  listItemTitle: {
    fontSize: RFValue(16),
    color: "#fff",
  },
  listItemText: {
    fontSize: RFValue(13),
    color: "rgba(200,200,200,0.75)",
  },
  bottomSafeAreaViewBackgroundColor: {
    width: width,
    height: 100,
    backgroundColor: "rgb(29,33,45)",
    position: "absolute",
    bottom: 0,
    zIndex: -1,
  },
  history: {
    width: width * 0.9,
    height: width * 0.1875,
    marginHorizontal: width * 0.05,
    display: 'flex',
    flexDirection: "column",
    justifyContent: "center",
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
  },
});

