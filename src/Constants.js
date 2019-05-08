import React from "react";
import {
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform
} from "react-native";

const Constants = {
  //Colors
  GREY1: '#211E20',
  GREY2: '#111111', SHADOW: this.GREY2,
  PRIMARY: 'white',
  TERTIARY: (Platform.OS==='android')?('#BF255A'):('#EB2E6E'), //purple
  LIGHTGREY: "#808080",
  RED: "#EF2D19",

  //themoviesdb Api:
  BASE_URL: "https://api.themoviedb.org/3",
  IMAGEBASE_URL: 'http://image.tmdb.org/t/p/w185',
  IMAGEBASE_URL_342: 'http://image.tmdb.org/t/p/w342',
  IMAGEBASE_URL_780: 'http://image.tmdb.org/t/p/w780',
  IMAGEBASE_URL_1280: 'http://image.tmdb.org/t/p/w1280',
  API_KEY: "45b4c883fccf34cdf9fe7dfe57be147b",
  SUB_BASE_URL: "https://rest.opensubtitles.org/search/",
  FACEBOOK_SHARE: "https://m.facebook.com/slinktv.cf/",
  TWITTER_SHARE: "https://mobile.twitter.com/Slink16719417",
  INSTA_SHARE: "https://instagram.com/slinktv.cf?utm_source=ig_profile_share&igshid=16r0ntv3gw1jb",
  CONTACT_US: "mailto:slink@cryvis.com?subject=SLink v3&body=<--Feel free to give your feedback/detailed complaint here-->",
  //Dimension:-
  WINDOW_WIDTH: Dimensions.get("window").width,
  WINDOW_HEIGHT: Dimensions.get("window").height,
  //Ads:
  APP_ID: Platform.OS==="android"?"ca-app-pub-3076192958641421~8594892275":"ca-app-pub-3076192958641421~6757645545",
  SLINK_V3_INTERSTITIAL: Platform.OS==="android"?"ca-app-pub-3076192958641421/3154863334":"ca-app-pub-3076192958641421/3510086550",
  UPDATE_CHECK_URL: "https://www.dropbox.com/s/r3nbipdxswr6pj9/AppVersion.json?dl=1"
};
export default Constants;

//https://api.themoviedb.org/3/movie/popular?api_key=45b4c883fccf34cdf9fe7dfe57be147b&page=1&region=us
//https://api.themoviedb.org/3/trending/tv/week?api_key=45b4c883fccf34cdf9fe7dfe57be147b
//https://api.themoviedb.org/3/tv/1668/season/1?api_key=45b4c883fccf34cdf9fe7dfe57be147b
//https://api.themoviedb.org/3/search/tv?api_key=45b4c883fccf34cdf9fe7dfe57be147b&query=Friends
