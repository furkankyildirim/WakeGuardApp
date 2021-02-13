import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/dist/SimpleLineIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import email from 'react-native-email'
import Store from '../assets/store/Store'
import { observer } from 'mobx-react';
import {strings} from '../assets/store/strings';

const { height, width } = Dimensions.get('window');

@observer
export default class Usage extends Component {
  handleEmail1 = () => {
    const to = ['wakeguard@gmail.com']
    email(to, {
        subject: `Report from user ${Store.userId}`,
        body: '<<< Please do not delete your user id from the subject. Otherwise, we can not help you. >>>'
    }).catch(console.error)
  }
  handleEmail2 = () => {
    const to = ['wakeguard@gmail.com']
    email(to, {
        subject: `Suggestion from user ${Store.userId}`,
        body: '<<< Please do not delete your user id from the subject. Otherwise, we can not help you. >>>'
    }).catch(console.error)
  }
  handleEmail3 = () => {
    const to = ['wakeguard@gmail.com']
    email(to, {
        subject: `Question from user ${Store.userId}`,
        body: '<<< Please do not delete your user id from the subject. Otherwise, we can not help you. >>>'
    }).catch(console.error)
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.topComponent}>
          <TouchableOpacity /*onPress={this.props.navigation.openDrawer}*/ style={styles.menuButton}>
            <Icon name="menu" size={RFValue(24)} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.iconTextContainer}>
          <Icon style={{marginBottom: width * 0.0375}} name="support" size={RFValue(36)} color="rgba(0,0,0,0.45)"/>
          <Text style={styles.infoText}>{strings.support_description}</Text>
        </View>
        <View>
          <TouchableOpacity onPress={() => this.handleEmail1()} style={[styles.button, { backgroundColor: "rgb(255,92,78)" }]}>
            <Icon name="bubbles" size={RFValue(24)} color="#fff" />
            <Text style={styles.buttonText}>{strings.report_text}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.handleEmail2()} style={[styles.button, { backgroundColor: "#2284F0" }]}>
            <Icon name="bulb" size={RFValue(24)} color="#fff" />
            <Text style={styles.buttonText}>{strings.suggest_text}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.handleEmail3()} style={[styles.button, { backgroundColor: "#2284F0" }]}>
            <Icon style={styles.buttonIcon} name="question" size={RFValue(24)} color="#fff" />
            <Text style={styles.buttonText}>{strings.ask_question_text}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: RFValue(12.5), color: "rgba(0,0,0,0.575)", marginBottom: width * 0.0275 }}>38-454-5123-4324</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
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
  button: {
    marginBottom: width * 0.0275 * 2.25,
    width: width - (width * 0.0275 * 7.5),
    borderRadius: 8,
    height: width * 0.15,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    paddingHorizontal: width * 0.0275 * 1.5,
  },
  buttonText: {
    fontSize: RFValue(15),
    fontWeight: "400",
    color: "#fff",
  },
  infoText: {
    fontSize: RFValue(15),
    fontWeight: "400",
    width: width*0.8,
    textAlign: "center",
    color: "rgba(0,0,0,0.575)",
  },
  iconTextContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.035,
  }
});