import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  Appearance,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/dist/SimpleLineIcons';
import {
  API_KEY,
  AUTOCOMPLETE_API,
  GEOCODING_API,
} from '../assets/store/GoogleAPI';
import _ from 'lodash';
import {observer} from 'mobx-react';
import axios from 'axios';
import Store from '../assets/store/Store';
import {strings} from '../assets/store/strings';

const colorScheme = Appearance.getColorScheme();

const {height, width} = Dimensions.get('window');

@observer
export default class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      predictions: '',
    };
  }

  showResults = (value) => {
    value !== ''
      ? this.setState({search: value})
      : this.setState({search: value, predictions: ''});
  };

  sendLocation = (position) => {
    Store._latitude(position.latitude);
    Store._longitude(position.longitude);
    Store._latitudeDelta(position.latitudeDelta);
    Store._longitudeDelta(position.longitudeDelta);
  };

  getPlaces = _.debounce((value) => this.searchPlaces(value), 500);

  searchPlaces = async (value) => {
    if (value !== '') {
      const places =
        await axios.get(`${AUTOCOMPLETE_API}key=${API_KEY}&input=${value}
      &location=${Store.latitude},${Store.longitude}&radius=10000`);
      this.setState({predictions: places.data.predictions});
    } else {
      this.setState({predictions: ''});
    }
  };

  getPositionCoordinate = async (place_id) => {
    const position = await axios.get(
      `${GEOCODING_API}key=${API_KEY}&place_id=${place_id}`,
    );
    const targetLocation = await position.data.results[0].geometry.location;
    console.log(targetLocation.lat, targetLocation.lng);
    Store._latitude(targetLocation.lat);
    Store._longitude(targetLocation.lng);
  };

  renderPredictions = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        key={item.place_id}
        onPress={async () => {
          Store._targetName(item.structured_formatting.main_text);
          await this.getPositionCoordinate(item.place_id);
          console.log(Store.latitude, Store.longitude);
          await Store.mapReferance.animateToRegion(
            {
              latitude: Store.latitude,
              longitude: Store.longitude,
              latitudeDelta: Store.latitudeDelta,
              longitudeDelta: Store.longitudeDelta,
            },
            1,
          ),
            this.props.navigation.navigate('Home');
        }}>
        <View style={styles.listItemIcon}>
          <Icon name="location-pin" size={RFValue(28)} color="#2284F0" />
        </View>
        <View style={styles.listItemTextContainer}>
          <Text numberOfLines={1} style={styles.listItemTitle}>
            {item.structured_formatting.main_text}
          </Text>
          <Text numberOfLines={1} style={styles.listItemText}>
            {item.structured_formatting.secondary_text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.topComponent}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Home')}
            style={styles.menuButton}>
            <Icon name="arrow-left" size={RFValue(18)} color=
            {colorScheme === "dark" ? "#FFFFFF": "#000000"} />
          </TouchableOpacity>
          <View style={styles.alarmSettings}>
            <View style={styles.chooseDestinationContainer}>
              <View style={styles.locationInput}>
                <Icon name="magnifier" size={RFValue(18)} color="#fff" />
                <TextInput
                  clearButtonMode="while-editing"
                  placeholder={
                    Store.targetName !== 'Use to search detailed locations'
                      ? Store.targetName
                      : strings.search_placeholder
                  }
                  numberOfLines={1}
                  style={styles.adress}
                  value={this.state.search}
                  onChangeText={(value) => [
                    this.showResults(value),
                    this.getPlaces(value),
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
        <FlatList
          renderItem={this.renderPredictions}
          keyExtractor={(item) => item.number}
          data={this.state.predictions}
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

const styles =
  colorScheme === 'dark'
    ? StyleSheet.create({
        mainContainer: {
          flex: 1,
          backgroundColor: 'rgb(55,68,100)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        topComponent: {
          width: width,
          height: width * 0.115 + width * 0.0275,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: width * 0.02,
          paddingBottom: width * 0.0275,
        },
        menuButton: {
          height: width * 0.115,
          width: width * 0.115,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        chooseDestinationContainer: {
          width: width - width * 0.0275 - width * 0.115,
          height: width * 0.115,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          backgroundColor: 'rgba(10,10,10,0.6)',
          borderRadius: 8,
        },
        locationInput: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          width: width - width * 0.0275 - width * 0.115,
          height: width * 0.115,
          borderRadius: 8,
          marginLeft: 5,
        },
        adress: {
          fontSize: RFValue(15),
          width: width * 0.745,
          color: 'rgba(255,255,255,0.85)',
          paddingHorizontal: 5,
          marginRight: 4,
        },
        alarmSettings: {
          marginRight: width * 0.0275,
        },
        listComponent: {
          width: width,
          height: height - (width * 0.115 + width * 0.0275 + width * 0.0275),
          backgroundColor: 'rgb(29,33,45)',
          overflow: 'hidden',
        },
        listItem: {
          height: width * 0.2,
          borderColor: 'rgb(55,68,100)',
          borderBottomWidth: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        firstListItem: {
          borderTopWidth: 1,
          borderColor: 'rgb(55,68,100)',
        },
        listItemIcon: {
          height: width * 0.115,
          width: width * 0.115,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: width * 0.0275,
        },
        listItemTextContainer: {
          width: width - width * 0.115 * 2,
          height: '57.5%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
        listItemTitle: {
          fontSize: RFValue(16),
          color: '#fff',
        },
        listItemText: {
          fontSize: RFValue(13),
          color: 'rgba(200,200,200,0.75)',
        },
        bottomSafeAreaViewBackgroundColor: {
          width: width,
          height: 100,
          backgroundColor: 'rgb(29,33,45)',
          position: 'absolute',
          bottom: 0,
          zIndex: -1,
        },
        history: {
          width: width * 0.9,
          height: width * 0.1875,
          marginHorizontal: width * 0.05,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderBottomColor: '#DDDDDD',
          borderBottomWidth: 1,
        },
      })
    : StyleSheet.create({
        mainContainer: {
          flex: 1,
          backgroundColor: '#f2f2f2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        topComponent: {
          width: width,
          height: width * 0.115 + width * 0.0275,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: width * 0.02,
          paddingBottom: width * 0.0275,
        },
        menuButton: {
          height: width * 0.115,
          width: width * 0.115,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        chooseDestinationContainer: {
          width: width - width * 0.0275 - width * 0.115,
          height: width * 0.115,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          backgroundColor: '#fff',
          borderRadius: 8,
        },
        locationInput: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          width: width - width * 0.0275 - width * 0.115,
          height: width * 0.115,
          borderRadius: 8,
          marginLeft: 5,
        },
        adress: {
          fontSize: RFValue(15),
          width: width * 0.745,
          color: '#000',
          paddingHorizontal: 5,
          marginRight: 4,
        },
        alarmSettings: {
          marginRight: width * 0.0275,
        },
        listComponent: {
          width: width,
          height: height - (width * 0.115 + width * 0.0275 + width * 0.0275),
          backgroundColor: '#fff',
          overflow: 'hidden',
        },
        listItem: {
          height: width * 0.2,
          borderColor: '#ddd',
          borderBottomWidth: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        firstListItem: {
          borderTopWidth: 1,
          borderColor: '#ddd',
        },
        listItemIcon: {
          height: width * 0.115,
          width: width * 0.115,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: width * 0.0275,
        },
        listItemTextContainer: {
          width: width - width * 0.115 * 2,
          height: '57.5%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
        listItemTitle: {
          fontSize: RFValue(16),
          color: '#000',
        },
        listItemText: {
          fontSize: RFValue(13),
          color: 'rgba(0,0,0,0.4)',
        },
        bottomSafeAreaViewBackgroundColor: {
          width: width,
          height: 100,
          backgroundColor: '#fff',
          position: 'absolute',
          bottom: 0,
          zIndex: -1,
        },
        history: {
          width: width * 0.9,
          height: width * 0.1875,
          marginHorizontal: width * 0.05,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderBottomColor: '#ddd',
          borderBottomWidth: 1,
        },
      });
