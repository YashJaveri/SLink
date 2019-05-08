import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, Platform, ImageBackground, NetInfo } from "react-native";
import Constants from "../Constants";

const styles = StyleSheet.create({
    textStyle:{
        fontSize: 14,
        marginTop: 6,
        fontWeight: (Platform.OS==='android')?('500'):('600'),
        //fontFamily: 'Gill_Sans_Nova_Light',
        color: Constants.PRIMARY,
        marginLeft: 6,
        width: 120
    },
    imageStyle: {
      width: 122,
      height: 162,
      overflow: 'hidden',
      borderRadius: 7,
      position: 'absolute'
    },
});

export default class PosterItem extends React.Component{
    render(){
        return(
            <View style={{flex:1, flexDirection: 'column', justifyContent: 'flex-start', marginRight:20, marginVertical: 9}}>
              <TouchableOpacity activeOpacity={0.8} style={{height:styles.imageStyle.height, width: styles.imageStyle.width}}
                onPress= {() => {
                  NetInfo.isConnected.fetch().then(async isConnected => {
                    if(isConnected){
                      (this.props.other.replace)?
                        (this.props.routedNavigator.replace("details", { data: this.props.data,  other: this.props.other }))
                        :(this.props.routedNavigator.navigate("details", { data: this.props.data,  other: this.props.other }));
                    }
                    else
                      Alert.alert("No internet connection!", "Connect to internet and retry");
                  });
                }}>
                <View style={{flex:1, flexDirection: 'column', justifyContent: 'flex-start', width: styles.imageStyle.width}}>
                  <Image style={styles.imageStyle}
                    source={{uri: Constants.IMAGEBASE_URL_342 + this.props.data.poster_path}}/>
                    <View style={{flexDirection: 'row', paddingTop: 4, paddingRight: 6, alignSelf: 'flex-end'}}>
                      <Text style={{marginRight: 4, fontSize: 12, fontWeight: 'bold', color: Constants.PRIMARY, paddingTop: 2}}>
                        {this.props.data.vote_average<=0?"--":((Number(Math.round(this.props.data.vote_average*10)/10).toFixed(1)).toString()+" ")}
                      </Text>
                      <Image source={require("../Assets/star_32.png")} style={{width: 16, height: 16, tintColor: Constants.TERTIARY}}/>
                    </View>
                    <View style={{height: styles.imageStyle.height-47}}/>
                    <Text style={{color: Constants.PRIMARY, fontSize: 12, padding: 6}}>{(this.props.data.adult)?("A"):("U/A")}</Text>
                </View>
              </TouchableOpacity>
                  <Text style={styles.textStyle} numberOfLines={1}>{(this.props.other.isTv)?(this.props.data.name + " "):(this.props.data.title + " ")}</Text>
                  <Text style={{fontSize: 11, color: Constants.PRIMARY, marginTop: 2, marginLeft: 8}} numberOfLines={1}>
                    {(this.props.other.isTv)?(this.props.data.first_air_date):(this.props.data.release_date)}
                  </Text>
            </View>
        );
    }
}
