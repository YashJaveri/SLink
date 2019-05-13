import React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Linking,
  Image,
  Dimensions,
  ToastAndroid,
  Platform,
  StatusBar
} from 'react-native'

import Constants from '../Constants'
import WebCrawlProcess from '../WebCrawler'
import SettingsManager from '../Managers/SettingsManager'
import { DownloadManager, DownloadProcess } from '../Managers/DownloadManager'
import AdManager from '../Managers/AdManager'
import SystemSetting from 'react-native-system-setting'
import SubsExtractor from '../SubsExtractor'
import Calls from '../Calls'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  }
})

class LinkItem extends React.Component {
  constructor(props) {
    super(props)
    this.mounted = true
    this.downloading = false
    this.downloadable = true
  }

  componentDidMount() {
    this.mounted = true
    StatusBar.setHidden(false, 'slide')
  }

  componentWillUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  getTitle = () => {
    if (this.props.other.isTv)
      return `${this.props.data.name}_S${this.props.other.season}_Ep${
        this.props.other.eps
      }_host${this.props.host.split('.').join('_')}`
    else
      return `${this.props.data.title}_${this.props.host.split('.').join('_')}`
  }

  getIcon = () => {
    let currentDownload = DownloadManager.downloads.find(
      p => p.url === this.props.link
    )
    if (currentDownload == undefined) {
      this.downloadable = true
      return require('../Assets/download.png')
    } else {
      if (currentDownload.state === DownloadManager.downloadStates.DONE) {
        this.downloading = false
        this.downloadable = false
        return require('../Assets/check.png')
      } else if (
        currentDownload.state === DownloadManager.downloadStates.FAILED ||
        currentDownload.state === DownloadManager.downloadStates.STOPPED
      ) {
        this.downloading = false
        this.downloadable = true
        return require('../Assets/download.png')
      } else {
        this.downloading = true
        this.downloadable = false
        return require('../Assets/spinner.gif')
      }
    }
    this.mounted ? this.setState({}) : null
  }

  getLink = () => {
    let currentDownload = DownloadManager.downloads.find(
      p => p.url === this.props.link
    )

    if (
      currentDownload != undefined &&
      currentDownload.state === DownloadManager.downloadStates.DONE
    )
      return currentDownload.filePath
    else return this.props.link
  }

  begin = expectedBytes => {
    Platform.OS === 'android'
      ? ToastAndroid.show('Download Started', ToastAndroid.LONG)
      : null
    this.mounted = true ? this.setState({}) : null
  }
  progress = percent => {
    //console.log("Progress: " + percent);
  }
  done = () => {
    this.mounted = true ? this.setState({}) : null
  }
  error = e => {
    if (this.mounted) {
      Platform.OS === 'android'
        ? ToastAndroid.show('Download Failed', ToastAndroid.LONG)
        : null
      this.mounted ? this.setState({}) : null
    }
  }

  render() {
    //StatusBar.setHidden(false)
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
         //Platform.OS === 'ios' ? AdManager.showInterstitial(2000) : null
          Platform.OS === 'android'
            ? this.props.navigation.navigate('videoPlayer', {
                other: this.props.other,
                data: this.props.data,
                url: this.getLink(),
                offline: this.getLink() !== this.props.link
              })
            : Linking.openURL(
                `vlc-x-callback://x-callback-url/stream?url=${this.props.link}`
              )
        }}
      >
        <View
          style={{
            padding: 8,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: Dimensions.get('screen').width
          }}
        >
          <View
            style={{
              padding: 4,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}
          >
            <Text
              style={{
                width: Dimensions.get('screen').width / 1.2,
                color: Constants.PRIMARY,
                fontWeight: 'bold',
                fontSize: 16
              }}
              numberOfLines={2}
            >
              {this.props.other.isTv
                ? `${this.props.data.name} Season ${
                    this.props.other.season
                  } Ep ${this.props.other.eps}`
                : this.props.data.title}
            </Text>
            <View style={{ flexDirection: 'row', marginHorizontal: 2 }}>
              {this.props.host && (
                <Text
                  style={{
                    color: Constants.PRIMARY,
                    fontSize: 14,
                    padding: 4,
                    opacity: 0.8
                  }}
                >
                  {this.props.host}
                </Text>
              )}
              {this.props.resolution && (
                <Text
                  style={{
                    color: Constants.PRIMARY,
                    fontSize: 14,
                    padding: 4,
                    opacity: 0.8
                  }}
                >
                  {this.props.resolution}
                </Text>
              )}
              {this.props.size && (
                <Text
                  style={{
                    color: Constants.PRIMARY,
                    fontSize: 14,
                    padding: 4,
                    opacity: 0.8
                  }}
                >
                  {this.props.size}
                </Text>
              )}
            </View>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => {
              if (this.downloadable) {
                let process = new DownloadProcess(
                  this.props.link,
                  this.props.data.id,
                  this.props.other.isTv,
                  this.props.other.isTv
                    ? this.props.data.name
                    : this.props.data.title,
                  `${SettingsManager.FILE_PATH}/${this.getTitle()}.mkv`,
                  this.props.resolution,
                  this.props.other.season,
                  this.props.other.eps,
                  DownloadManager.downloadStates.PENDING,
                  SubsExtractor.subtitleJson,
                  new Date().getTime().toString(36)
                )
                process.begin = this.begin
                process.progress = this.progress
                process.done = this.done
                process.error = this.error

                DownloadManager.startDownload(process)
                AdManager.showInterstitial(2000)
                if (this.mounted) this.setState({})
              }
            }}
            activeOpacity={0.9}
          >
            <Image
              source={this.getIcon()}
              style={{
                tintColor: Constants.PRIMARY,
                height: this.downloading ? 36 : 22,
                width: this.downloading ? 36 : 22,
                margin: 6
              }}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }
}

export default class LinksScreen extends React.Component {
  constructor(props) {
    super(props)
    this.mounted = true
    this.detailData = {}
    this.other = {}
    this.data = []
    this.state = {
      loading: true,
      links: [],
      note: true
    }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('other').isTv
        ? navigation.getParam('data').name + ' '
        : navigation.getParam('data').title + ' '
    }
  }

  componentWillUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  getSubs = async () => {
    let link = ''
    if (this.other.isTv)
      link = await Calls.getTvSubtitles(
        this.detailData.id,
        this.other.season,
        this.other.eps
      )
    else link = await Calls.getMovieSubtitles(this.detailData.id)
    SubsExtractor.getSubs(link)
  }

  componentDidMount() {
    this.mounted = true
    this.detailData = this.props.navigation.getParam('data')
    this.other = this.props.navigation.getParam('other')
    this.getSubs()
    !this.other.isTV
      ? setTimeout(
          () => (this.mounted ? this.setState({ note: false }) : null),
          4000
        )
      : null

    if (this.detailData != undefined) {
      let title =
        this.detailData.original_title == null
          ? this.detailData.name == null
            ? this.detailData.original_name
            : this.detailData.name
          : this.detailData.title == null
            ? this.detailData.original_title
            : this.detailData.title
      console.log(this.detailData) 
      console.log(title) 

      this.props.navigation.setParams({
        title: this.other.isTv ? this.detailData.name : this.detailData.title
      })
      Dimensions.addEventListener(
        'change',
        () => (this.mounted = true ? this.setState({}) : null)
      )
      SystemSetting.isWifiEnabled().then(enable => {
        if (!enable && SettingsManager.wifiOnly) {
          Alert.alert(
            "'Wifi-Only' is on",
            "Switch off 'Wifi-Only' in settings to load using mobile data",
            [
              { text: 'No thanks' },
              {
                text: 'Switch Off',
                onPress: () => {
                  SettingsManager.setWifiOnly(false)
                  this.HandleLoading(title)
                }
              }
            ]
          )
        } else {
          this.HandleLoading(title)
          if (!enable && !SettingsManager.wifiOnly)
            Platform.OS === 'android'
              ? ToastAndroid.show(
                  'Connect to wifi for faster loading',
                  ToastAndroid.LONG
                )
              : null
        }
      })
    }
  }
//==========
  HandleLoading = async title => {
    this.process = new WebCrawlProcess()

    this.process.onFoundLink = async linkData => {
      this.data.push(linkData)
      if (this.mounted) {
        this.setState({
          links: this.data
        })
      }
    }

    this.process.onComplete = async () => {
      if (this.mounted) {
        this.setState({
          loading: false,
          links: this.data
        })
        if (this.state.links.length <= 0) {
          Alert.alert(
            'Links Unavailable',
            'We could not find links for this show. Report to us so that we can add it.',
            [
              { text: 'No thanks!' },
              {
                text: 'Report',
                onPress: () => {
                  Linking.openURL('mailto:slink@cryvis.com')
                }
              }
            ]
          )
        }
      }
    }
//==========
    if (this.other.isTv) {
      if (SettingsManager.paralProc) {
        this.process.crawlForTvShowParallel(
          title,
          Number(this.props.navigation.getParam('other', {}).season),
          Number(this.props.navigation.getParam('other', {}).eps)
        )
      } else {
        this.process.crawlForTvShow(
          title,
          Number(this.props.navigation.getParam('other', {}).season),
          Number(this.props.navigation.getParam('other', {}).eps)
        )
      }
    } else {
      if (SettingsManager.paralProc) {
        this.process.crawlForMovieParallel(title)
      } else {
        this.process.crawlForMovie(title)
      }
    }
  }

  listLoading = () => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Image
          style={{ width: 50, height: 50, tintColor: Constants.TERTIARY }}
          source={require('../Assets/spinner.gif')}
          resizeMode="contain"
        />
        {!SettingsManager.paralProc &&
          this.state.note && (
            <Text style={{ fontSize: 14, color: Constants.PRIMARY }}>
              Swich on "Parallel Source Loading" from settings for faster
              loading
            </Text>
          )}
        {SettingsManager.paralProc &&
          this.state.note && (
            <Text style={{ fontSize: 14, color: Constants.PRIMARY }}>
              Links will load in a while
            </Text>
          )}
        {!this.other.isTV &&
          this.state.note && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: Constants.TERTIARY,
                textAlign: 'center'
              }}
            >
              Try other options, if one of the sources is not satisfactory
            </Text>
          )}
      </View>
    )
  }
  navigate = () => {
    this.props.navigation.navigate('videoPlayer', {
      other: this.props.navigation.getPara('other'),
      data: this.detailData
    })
  }

  render() {
    return (
      <View style={styles.mainStyle}>
        <FlatList
          removeClippedSubviews={true}
          contentContainerStyle={{ width: Dimensions.get('screen').width }}
          key={this.state.links.length}
          data={this.state.links}
          ListFooterComponent={this.state.loading ? this.listLoading : null}
          keyExtractor={(item, index) => {
            return index.toString()
          }}
          renderItem={({ item }) => (
            <LinkItem
              {...item}
              navigation={this.props.navigation}
              data={this.detailData}
              other={this.other}
            />
          )}
        />
      </View>
    )
  }
}
