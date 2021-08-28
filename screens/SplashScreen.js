import React, { Component } from 'react';
import { View, Text, StyleSheet, Appearance, Dimensions,Image } from 'react-native';

const { height, width } = Dimensions.get('window');
const colorScheme = "dark" //Appearance.getColorScheme();


const Splash = () => {
    
    return (
      <View style={styles.main}>
        <Image style={styles.image}
        source={
            colorScheme === "dark" ? 
            require(`../assets/images/old/whiteLogo.png`):
            require(`../assets/images/old/blueLogo.png`)
        }
        >
        </Image>
      </View>
    );
}

export default Splash;

const styles = colorScheme === "dark" ?
    StyleSheet.create({
        main:{
            flex:1,
            backgroundColor: '#345ADE',
            alignItems:"center"
        },
        image:{
            marginTop:179
        }
    })
    :
    StyleSheet.create({
        main:{
            flex:1,
            backgroundColor: '#FFFFFF',
            alignItems:"center"
        },
        image:{
            marginTop:179
        }
    }); 