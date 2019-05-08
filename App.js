import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  NetInfo,
  Alert,
} from "react-native";
import {
  createDrawerNavigator,
  createStackNavigator,
  createAppContainer,
} from "react-navigation";
import firebase from "react-native-firebase";

import MainScreen from "./src/Screens/MainScreen";
import Settings from "./src/Screens/Settings";
import Constants from "./src/Constants";
import SplashScreen from "./src/Screens/SplashScreen";
import ExpandedGrid from "./src/Screens/ExpandedGrid";
import DetailsScreen from "./src/Screens/DetailsScreen";
import SearchScreen from "./src/Screens/SearchScreen";
import WatchlistScreen from "./src/Screens/WatchlistScreen"
import DownloadScreen from "./src/Screens/DownloadScreen"
import PrivacyPolicy from "./src/Screens/PrivacyPolicy"
import AndroidVideoPlayer from "./src/Screens/AndroidVideoPlayer";
import LinksScreen from "./src/Screens/LinksScreen";
import SystemSetting from "react-native-system-setting";


  const mjsonPackage = require("./package.json");

const DrawerItem = props => {
  return (
    <TouchableOpacity style={{margin: 2, marginLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}onPress={props.onPress}>
      <Image
        source={props.src}
        resizeMode="contain"
        style={[iconStyle, {tintColor: Constants.PRIMARY}]}
      />
      <Text style={{ color: Constants.PRIMARY, marginHorizontal: 20, marginVertical: 16, flex: 1, fontSize: 15 }}>
        {props.text+" "}
      </Text>
    </TouchableOpacity>
  );
};

/*const iosConfig = {
  clientId: '315608663862-umiso074upg0pcboh9cuks52p8lkoh2h.apps.googleusercontent.com',
  appId: '1:315608663862:ios:51ab8691caabdb29',
  apiKey: 'AIzaSyAEmMJfWZyXW8-MHhh3rD55A5uURru-9vc',
  databaseURL: 'https://slink-v3.firebaseio.com',
  storageBucket: 'slink-v3.appspot.com',
  messagingSenderId: '315608663862',
  projectId: 'slink-v3',
  // enable persistence by adding the below flag
  persistence: true,
};
const androidConfig = {
  clientId: '315608663862-9gvpoi7hoe8lvmllc7tlakj954a6ogun.apps.googleusercontent.com',
  appId: '1:315608663862:ios:314df738cda98358',
  apiKey: 'AIzaSyAEmMJfWZyXW8-MHhh3rD55A5uURru-9vc',
  databaseURL: 'https://slink-v3.firebaseio.com',
  storageBucket: 'slink-v3.appspot.com',
  messagingSenderId: '315608663862',
  projectId: 'slink-v3',
  // enable persistence by adding the below flag
  persistence: true,
};*/

const iconStyle= {
  height: 22,
  width: 22,
}

const customDrawer = props => (
  <View style={{ flex: 1, paddingTop: 24, backgroundColor: Constants.GREY1}}>
    <ScrollView contentContainerStyle={{ backgroundColor: Constants.GREY1, flexGrow: 1}}>
    <DrawerItem
      src={require("./src/Assets/home.png")}
      text="Home"
      onPress={() => {
        props.navigation.navigate("Home");
        props.navigation.closeDrawer();
      }}
    />
    <DrawerItem
      src={require("./src/Assets/download.png")}
      text="Downloads"
      onPress={() => {
        props.navigation.navigate("Downloads");
        props.navigation.closeDrawer();
      }}
    />
    <DrawerItem
      src={require("./src/Assets/watchlist.png")}
      text="Watchlist"
      onPress={() => {
        props.navigation.navigate("Watchlist");
        props.navigation.closeDrawer();
      }}
    />
    <DrawerItem
      src={require("./src/Assets/settings.png")}
      text="Settings"
      onPress={() => {
        props.navigation.navigate("Settings");
        props.navigation.closeDrawer();
      }}
      />
      <DrawerItem
        src={require("./src/Assets/policy.png")}
        text="Privacy Policy"
        onPress={() => {
          props.navigation.navigate("PrivacyPolicy");
          props.navigation.closeDrawer();
        }}
        />
      <View style={{flex:1, height: 100, borderRadius: 10, borderColor: Constants.TERTIARY, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 10}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', color: Constants.PRIMARY, marginTop: 10, marginBottom: 8}}>About Us</Text>
        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => Linking.openURL(Constants.INSTA_SHARE)}>
              <Image source={require("./src/Assets/instagram.png")} style={{width: 26, height: 26, margin: 14}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() =>  Linking.openURL(Constants.FACEBOOK_SHARE)}>
              <Image source={require("./src/Assets/facebook.png")} style={{width: 26, height: 26, margin: 14}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() =>  Linking.openURL(Constants.TWITTER_SHARE)}>
              <Image source={require("./src/Assets/twitter.png")} style={{width: 26, height: 26, margin: 14}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() =>  Linking.openURL(Constants.CONTACT_US)}>
              <Image source={require("./src/Assets/contact.png")} style={{width: 26, height: 26, margin: 14}}/>
            </TouchableOpacity>
        </View>
        <Text style={{fontSize: 12, color: Constants.TERTIARY, margin: 8}}>{`SLink v${mjsonPackage.version}`}</Text>
        <TouchableOpacity activeOpacity={0.6} onPress={() => Linking.openURL("https://docs.google.com/document/d/1owd_uPVZPPVYj_VUafUlsAyGvEM2giIr1_KljI4Fkpo/edit?usp=sharing")}>
          <View style={{borderBottomWidth: 0.45, borderBottomColor: Constants.PRIMARY}}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: Constants.PRIMARY, margin: 1}}> What's new? </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
);

const AppNavigator = createStackNavigator(
{
  SplashScreen: SplashScreen,
  app:createDrawerNavigator({
    Home: {
      screen: createStackNavigator({
        main: MainScreen,
        search: SearchScreen,
        expanded: ExpandedGrid,
        details: DetailsScreen,
        videoPlayer: AndroidVideoPlayer,
        linksScreen: LinksScreen
      },
      {
        navigationOptions:{
          headerStyle: {
            backgroundColor: Constants.GREY1,
            borderBottomWidth: 0,
            borderRadius: 0.5,
            elevation: 0,
          },
          headerBackTitle: null,
          headerTintColor: Constants.PRIMARY,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }
      })
    },
    Watchlist: {
      screen: createStackNavigator({
          watchlist: WatchlistScreen,
          details: DetailsScreen,
          videoPlayer: AndroidVideoPlayer,
          linksScreen: LinksScreen
      },
      {
        navigationOptions:{
          headerStyle: {
            backgroundColor: Constants.GREY1,
            borderBottomWidth: 0,
            borderRadius: 0.5,
            elevation: 0,
          },
          headerBackTitle: null,
          headerTintColor: Constants.PRIMARY,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }
      })
    },
    Settings: {
        screen: createStackNavigator({
          settings:Settings,
        },
        {
        navigationOptions:{
          headerStyle: {
            backgroundColor: Constants.GREY1,
            borderBottomWidth: 0,
            borderRadius: 0.5,
            elevation: 0,
          },
          headerBackTitle: null,
          headerTintColor: Constants.PRIMARY,
          headerTitleStyle: {
            fontWeight: 'bold',
          }
        }
      }),
    },
  Downloads: {
    screen: createStackNavigator({
      downloads:DownloadScreen,
    },
    {
    navigationOptions:{
      headerStyle: {
        backgroundColor: Constants.GREY1,
        borderBottomWidth: 0,
        borderRadius: 0.5,
        elevation: 0,
      },
      headerBackTitle: null,
      headerTintColor: Constants.PRIMARY,
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
  }),
  },
  PrivacyPolicy:{
    screen: createStackNavigator({
      privacyPolicy:PrivacyPolicy,
    },
    {
    navigationOptions:{
      headerStyle: {
        backgroundColor: Constants.GREY1,
        borderBottomWidth: 0,
        borderRadius: 0.5,
        elevation: 0,
      },
      headerBackTitle: null,
      headerTintColor: Constants.PRIMARY,
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
  }),
  }
  },
  {
    contentComponent: customDrawer
  })
 },
 {
   navigationOptions: {
      header: null
    }
  },
);

export default class App extends React.Component {
  static navigationOptions = ({ navigation }) => {
    header: false;
  };

  componentDidMount(){
    //firebase.initializeApp(Platform.OS==="android"?androidConfig:iosConfig, 'SLinkv3');
    firebase.admob().initialize(Constants.APP_ID);
  }

  render() {
    return <AppNavigator />;
  }
}

//<StatusBar barStyle = "light-content" hidden = {false} backgroundColor = "Constants.GREY1" translucent = {true}>
