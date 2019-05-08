import React from 'react';
import { View, Image, Text, StyleSheet, ImageBackground, Platform, TouchableOpacity, Linking, Alert, ToastAndroid } from "react-native";
import { ParallaxImage } from "react-native-snap-carousel";

import Constants from "../Constants";
import Calls from "../Calls";

const styles = StyleSheet.create({
  mainStyle:{
    flex: 1,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Constants.SHAADOW,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
    textStyle:{
        fontSize: 12,
        color: Constants.PRIMARY,
    },
    imageStyle: {
      width: 162,
      height: 180,
      elevation: 20,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: 6,
      overflow: 'hidden',
      borderRadius: 6,
      resizeMode: 'contain'
    },
});

export default class SnapItem extends React.Component{

  openURL = async () => {
    if(this.props.other.isTv)
      url = await Calls.getTvTrailerUrl(this.props.data.id);
    else
      url = await Calls.getMovieTrailerUrl(this.props.data.id);
    if(url==null)
      (Platform.OS==="android")?(ToastAndroid.show("Sorry, trailer unavailable:(", ToastAndroid.LONG)):(Alert.alert("Sorry, trailer unavailable :("));
    else
    {
      Linking.canOpenURL(url).then(supported => {
          if (supported)
            Linking.openURL(url);
          else
            console.log("Don't know how to open URI: " + url);
      });
    }
  }

    render(){
        return(
          <View style={styles.mainStyle}>
            <TouchableOpacity activeOpacity={0.9} onPress={this.openURL}>
                <ImageBackground style={styles.imageStyle}
                  resizeMethod='resize'
                  source={{uri: Constants.IMAGEBASE_URL_342 + this.props.data.poster_path }}>
                        <Text style={styles.textStyle} numberOfLines={2}>
                          {(this.props.other.isTv)?(this.props.data.name+" "):(this.props.data.title+" ")}
                        </Text>
                        <View style={{flex: 1}}/>
                        <Image style={{height: 18, width: 18, alignSelf: 'flex-end'}} source={require("../Assets/play.png")}/>
                  </ImageBackground>
              </TouchableOpacity>
            </View>
        );
    }

}
