import React from 'react'
import changeNavigationBarColor from 'react-native-navigation-bar-color'
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  PermissionsAndroid,
  ToastAndroid,
  Alert,
  NetInfo,
  AsyncStorage
} from 'react-native'

import Constants from '../Constants'
import Calls from '../Calls'
import MainScreen from './MainScreen'
import WatchlistManager from '../Managers/WatchlistManager'
import SettingsManager from '../Managers/SettingsManager'
import ProgressManager from '../Managers/ProgressManager'
import { DownloadManager } from '../Managers/DownloadManager'
import SubsExtractor from '../SubsExtractor'
import WebCrawlerProcess from '../WebCrawler'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textStyle: {
    fontSize: 32,
    color: Constants.PRIMARY,
    fontWeight: 'bold'
  }
})

const fetchOfflineData = async () => {
  //Handle permissions
  if (Platform.OS === 'android') {
    setTimeout(() => {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ).then(async granted => {
        if (!granted) {
          try {
            const granted = await PermissionsAndroid.requestMultiple(
              [
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
              ],
              {
                title: 'Storage Permission',
                message:
                  'SLink needs access to your storage so that you can download your favourite media'
              }
            )
          } catch (e) {
            console.warn(e)
          }
        }
      })
    }, 100)
  }
  DownloadManager.init()
  x = await ProgressManager.init()
  SettingsManager.init()
  WatchlistManager.init()
}

export default class SplashScreen extends React.Component {
  constructor(props) {
    super(props)
    this.fetch = false
  }
  
  static navigationOptions = {
    headerStyle: {
      backgroundColor: Constants.GREY1,
      borderBottomWidth: 0,
      elevation: 0
    },
    drawerLabel: ''
  }

  static fetchData = async () => {
    //TV Shows
    MainScreen.data.trendingTvShows = await Calls.getTrendingTvShows()
    MainScreen.data.popularTvShows = await Calls.getPopularTvShows()
    MainScreen.data.topRatedTvShows = await Calls.getTopRatedTvShows()
    MainScreen.data.onAir = await Calls.getTvOnAir()
    //Remove nulls:-
    onAirTvResults = MainScreen.data.onAir.results.filter(
      (item, index, arr) => {
        return item.poster_path != null
      }
    )
    MainScreen.data.trailerTvShows = [...onAirTvResults]

    //Movies:-
    MainScreen.data.trendingMovies = await Calls.getTrendingMovies()
    MainScreen.data.popularMovies = await Calls.getPopularMovies()
    MainScreen.data.topRatedMovies = await Calls.getTopRatedMovies()
    var upcomingMov = await Calls.getUpcomingMovies()
    //Remove nulls:-
    upcomingMovResults = upcomingMov.results.filter((item, index, arr) => {
      return item.poster_path != null
    })
    MainScreen.data.trailerMovies = [...upcomingMovResults]

    //Webcraweler DB:-
    let response = await fetch(
      //'https://www.dropbox.com/s/wp4fa7ytf89t60q/MovieLinks.json?dl=1'
      'https://www.dropbox.com/s/aeu6u9na52d65ve/MovieLinks.json?dl=1'      
    )
    let json = await response.json()
    WebCrawlerProcess.Movies = json.indexes
    response = await fetch(
      //'https://www.dropbox.com/s/u08628nflnsa2p5/TvLinks.json?dl=1'
      'https://www.dropbox.com/s/87ycsvrj73y6bzl/TvLinks.json?dl=1'      
    )
    json = await response.json()
    WebCrawlerProcess.TvShows = json.indexes
    //Check for updates:
    if (Platform.OS === 'android') x = await SettingsManager.checkForUpdates()
  }

  termsOfUse = async () => {
    let agreed = await AsyncStorage.getItem('Agreed', undefined)
    !agreed
      ? Alert.alert(
          'IMPORTANT',
          'SLink is not responsible for the accuracy, compliance, copyrights, legality, decency, or any other aspect of the content of other sites. If you have any legal issues please contact the appropriate media file owner or host sites. All the trademarks, logo, and images are the property of their respective and rightful owners.',
          [
            {
              text: 'I AGREE',
              onPress: () =>
                AsyncStorage.setItem('Agreed', JSON.stringify(true))
            }
          ]
        )
      : null
  }

  componentDidMount() {
    Platform.OS === 'android' ? StatusBar.setBackgroundColor('#211E20') : null
    Platform.OS === 'android' ? changeNavigationBarColor(Constants.GREY1) : null
    Platform.OS === 'android'
      ? StatusBar.setBarStyle('light-content', true)
      : null
    this.termsOfUse()

    fetchOfflineData()

    NetInfo.isConnected.fetch().then(async isConnected => {
      if (isConnected) {
        let temp = await SplashScreen.fetchData()
        this.props.navigation.replace('app')
      } else this.props.navigation.replace('app')
    })

    this.props.navigation.addListener('willBlur', () => (this.fetch = true))
    this.props.navigation.addListener('didFocus', () => {
      //console.log(this.fetch);
      this.fetch
        ? NetInfo.isConnected.fetch().then(async isConnected => {
            if (isConnected) {
              let temp = await SplashScreen.fetchData()
              this.props.navigation.replace('app')
            } else this.props.navigation.replace('app')
          })
        : null
    })

    NetInfo.isConnected.addEventListener('connectionChange', () => {
      NetInfo.isConnected.fetch().then(isConnected => {
        !isConnected
          ? Alert.alert(
              'Internet Not Connected',
              'Connect to internet to load resources'
            )
          : null
      })
    })
  }
  componentWillUnmount() {
    if (this.props.navigation.removeListener) {
      this.props.navigation.removeListener('willBlur')
      this.props.navigation.removeListener('didFocus')
    }
  }

  render() {
    return (
      <View style={styles.mainStyle}>
        <Image
          style={{ width: 120, height: 120 }}
          source={require('../Assets/SLink.png')}
        />
      </View>
    )
  }
}
