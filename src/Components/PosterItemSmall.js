import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Platform, Alert, ToastAndroid, NetInfo } from "react-native";
import Constants from "../Constants";

const styles = StyleSheet.create({
    textStyle:{
        fontSize: 12,
        marginTop: 6,
        fontWeight: (Platform.OS==='android')?('500'):('600'),
        //fontFamily: 'Gill_Sans_Nova_Light',
        color: Constants.PRIMARY,
        marginLeft: 4,
        width: 108
    },
    imageStyle: {
      width: 108,
      height: 145,
      overflow: 'hidden',
      borderRadius: 6,
      position: 'absolute'
    },
});

export default class PosterItemSmall extends React.Component{
    render(){
        return(
            <View style={{flex:1, flexDirection: 'column', justifyContent: 'flex-start', marginHorizontal: 8, marginVertical: 12}}>
              <TouchableOpacity activeOpacity={0.8} style={{height:styles.imageStyle.height, width: styles.imageStyle.width}}
                onPress= {() => {
                            if(this.props.data.poster_path===null)
                                (Platform.OS==="android")?(ToastAndroid.show("Unavailable :(", ToastAndroid.SHORT)):(Alert.alert("Unavailable :("));
                            else{
                                NetInfo.isConnected.fetch().then(async isConnected => {
                                  if(isConnected)
                                    this.props.routedNavigator.navigate("details", { data: this.props.data,  other: this.props.other });
                                  else
                                    Alert.alert("No internet connection!", "Connect to internet and retry");
                                });
                              }
                          }}>
                <View style={{flex:1, flexDirection: 'column', justifyContent: 'flex-start', width: styles.imageStyle.width}}>
                  {(this.props.data.poster_path!==null)?
                    (<Image style={styles.imageStyle} source = {{uri: Constants.IMAGEBASE_URL_342 + this.props.data.poster_path}}/>)
                    :(<View style={[styles.imageStyle, {justifyContent: 'center', alignItems: 'center'}]}>
                        <Image style= {{width: 80, height: 80, overflow: 'hidden', borderRadius: 8}}
                          source={require("../Assets/SLink.png")}/>
                      </View>)
                  }
                    <View style={{flexDirection: 'row', paddingTop: 4, paddingRight: 4, alignSelf: 'flex-end'}}>
                      <Text style={{marginRight: 4, fontSize: 11, fontWeight: 'bold', color: Constants.PRIMARY, paddingTop: 2}}>
                        {this.props.data.vote_average<=0?"--":((Number(Math.round(this.props.data.vote_average*10)/10).toFixed(1)).toString()+" ")}
                      </Text>
                      <Image source={require("../Assets/star_32.png")} style={{width: 15, height: 15, tintColor: Constants.TERTIARY}}/>
                    </View>
                    <View style={{height: styles.imageStyle.height-37}}/>
                    <Text style={{color: Constants.PRIMARY, fontSize: 11, paddingLeft: 4, paddingBottom: 4}}>{(this.props.data.adult)?("A"):("U/A")}</Text>
                </View>
              </TouchableOpacity>
              <View style={{flexDirection: 'column'}}>
                    <Text style={styles.textStyle} numberOfLines={1}>{(this.props.other.isTv)?(this.props.data.name + " "):(this.props.data.title + " ")}</Text>
                    <Text style={{fontSize: 10, color: Constants.PRIMARY, marginTop: 2, marginLeft: 6}} numberOfLines={1}>
                      {(this.props.other.isTv)?(this.props.data.first_air_date):(this.props.data.release_date)}
                    </Text>
              </View>
            </View>
        );
    }
}
