import firebase from "react-native-firebase";
import Constants from "../Constants";
import { NetInfo, StatusBar } from "react-native";

const advert = firebase.admob().interstitial(Constants.SLINK_V3_INTERSTITIAL);
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();
request.addKeyword('foo').addKeyword('bar');

export default class AdManager{

  static showInterstitial(time, adClosed, adOpen){
    NetInfo.isConnected.fetch().then(async isConnected => {
      if(isConnected){
        advert.loadAd(request.build());
        advert.on('onAdClosed', () => adClosed!=undefined?adClosed():null);
      }
    });
    setTimeout(() => {
        adOpen!=undefined?adOpen():null;
        //console.log(JSON.stringify(advert));
        advert.isLoaded()?advert.show():null;
      }, time);
  }
}
