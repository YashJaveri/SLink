import React from "react";
import { Text, Image, View, StyleSheet, FlatList, TouchableOpacity, Platform, NetInfo, ToastAndroid } from "react-native";

import Constants from "../Constants";
import PosterItem from "./PosterItem";
import MainScreen from "../Screens/MainScreen";

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 18,
    color: Constants.PRIMARY,
  },
  //Due to font import issues:
  androidTxt: {
    fontFamily: 'OpanSans_Light',
    marginBottom: 6
  },
  iosTxt: {
    marginBottom: 6
  }
});

export default class PosterSliderView extends React.Component{
  render(){
    return(
      <View style={{marginTop: 18, flex:2}}>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginLeft: 18}}>
            <Text style={[styles.textStyle, (Platform.OS === 'android' && (this.props.title === "Similar Titles" || this.props.title === "Recommended"))?styles.androidTxt:styles.iosTxt]}>
              {this.props.title}
            </Text>
            {(this.props.title==="Most Popular" || this.props.title==="Top Rated" || this.props.title==="On Air")?(<TouchableOpacity hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                onPress={() => {
                  NetInfo.isConnected.fetch().then(async isConnected => {
                    if(isConnected)
                      this.props.routedNavigator.navigate("expanded", { data: this.props.data, title: this.props.title, other: this.props.other});
                    else
                      ToastAndroid.show("No internet connection!", ToastAndroid.LONG);
                  });
                }}>
              <Text style={{marginRight: 14, marginTop: 6, alignSelf: 'flex-end', fontSize: 10, color: Constants.TERTIARY}}>SEE ALL</Text>
            </TouchableOpacity>):null}
        </View>
        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          alwaysBounceHorizontal={false}
          contentContainerStyle={{marginLeft: 22}}
          data={this.props.data.results}
          renderItem={({item}, index) => {
            if(item.poster_path!=null && item.vote_average!=null)
              return(
                <PosterItem data={item} other={this.props.other} routedNavigator={this.props.routedNavigator}/>
              );
          }}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item,index) => index.toString()}
        />
      </View>
    );
  };
}
