import React, { Component } from 'react';
import { View, Text, StyleSheet, Appearance, Dimensions, Image, ImageBackground } from 'react-native';

const { height, width } = Dimensions.get('window');

const Splash = () => {

  return (
    <ImageBackground style={styles.main} source={require(`../assets/images/splash/splash_bg.png`)}>
      <Image style={styles.image} source={require(`../assets/images/splash/splash_logo.png`)} />
    </ImageBackground>
  );
}

export default Splash;

const styles =
  StyleSheet.create({
    main: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    image: {
      width: width * 500 / 2160,
      resizeMode: "contain"
    }
  });