import React from 'react'
import {
  Text,
  Image,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
  SectionList,
  ToastAndroid,
  Alert,
  AsyncStorage,
  StatusBar
} from 'react-native'
import ProgressCircle from 'react-native-progress-circle'
import { getSizeString } from '../getSize'
import RNFetchBlob from 'rn-fetch-blob'
import firebase from 'react-native-firebase'

import Constants from '../Constants'
import { DownloadManager } from '../Managers/DownloadManager'
import AdManager from '../Managers/AdManager'
import SubsExtractor from '../SubsExtractor'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  }
})

class DownloadItem extends React.Component {
  constructor(props) {
    super(props)
    this.mounted = true
    this.downloading = false
    this.resolution = ''
    this.state = {
      totalFinalBytes: 0
    }
  }

  componentDidMount() {
    this.mounted = true
    Dimensions.addEventListener(
      'change',
      () => (this.mounted ? this.setState({}) : null)
    )
    this.props.navigation.addListener('didFocus', () =>
      StatusBar.setHidden(false)
    )
    DownloadManager.downloads[this.props.index].state ===
    DownloadManager.downloadStates.DONE
      ? RNFetchBlob.fs
          .stat(this.props.filePath)
          .then(
            stats =>
              this.mounted
                ? this.setState({ totalFinalBytes: getSizeString(stats.size) })
                : null
          )
          .catch(e => console.log(e))
      : null
    DownloadManager.downloads[this.props.index].progress = this.progress
    DownloadManager.downloads[this.props.index].done = this.done
    DownloadManager.downloads[this.props.index].error = this.error

    this.resolution =
      this.props.resolution == undefined ? '' : this.props.resolution
  }

  componentWillUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  progress = (percent, bytesRead, totalBytes) => {
    //console.log("Progress2: " + progress);
    this.mounted ? this.setState({}) : null
  }
  done = () => {
    AdManager.showInterstitial(2000)
    StatusBar.setHidden(true)
    this.mounted ? this.setState({}) : null
    DownloadManager.downloads[this.props.index].state ===
    DownloadManager.downloadStates.DONE
      ? RNFetchBlob.fs
          .stat(this.props.filePath)
          .then(
            stats =>
              this.mounted
                ? this.setState({ totalFinalBytes: getSizeString(stats.size) })
                : null
          )
          .catch(e => console.log(e))
      : null
  }
  error = e => {
    if (this.mounted) {
      this.props.isTv
        ? ToastAndroid.show(
            `Download failed for ${this.props.title} S${this.props.season} E${
              this.props.episode
            }`,
            ToastAndroid.LONG
          )
        : ToastAndroid.show(
            `Download failed for ${this.props.title}`,
            ToastAndroid.LONG
          )
      this.mounted ? this.setState({}) : null
    }
  }

  play = () => {
    if (
      DownloadManager.downloads[this.props.index].state ===
      DownloadManager.downloadStates.DONE
    ) {
      SubsExtractor.subtitleJson = this.props.subtitleJson
      other1 = {
        isTv: this.props.isTv
      }
      data1 = {
        id: this.props.id,
        name: this.props.title,
        title: this.props.title
      }
      this.props.navigation.navigate('videoPlayer', {
        other: other1,
        data: data1,
        url: this.props.filePath,
        offline: true
      })
    }
  }

  pad = number => {
    return ((number < 10 ? '0' : '') + number.toString()).toString()
  }

  render() {
    return (
      <TouchableOpacity onPress={this.play} activeOpacity={0.8}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 6,
            paddingVertical: 6,
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: Dimensions.get('screen').width
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              paddingVertical: 2,
              paddingHorizontal: 4,
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}
          >
            {!this.props.isTv && (
              <Text
                style={{
                  color: Constants.PRIMARY,
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                {this.props.title + ' '}
              </Text>
            )}
            {this.props.isTv && (
              <Text
                style={{
                  color: Constants.PRIMARY,
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                {`${this.props.title}   S${this.pad(
                  this.props.season
                )}  E${this.pad(this.props.episode)} `}
              </Text>
            )}
            <View style={{ marginLeft: 4 }}>
              {DownloadManager.downloads[this.props.index].state ===
                DownloadManager.downloadStates.FAILED && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center'
                  }}
                >
                  <Text
                    style={{
                      color: Constants.RED,
                      opacity: 0.8,
                      marginRight: 4,
                      fontSize: 12
                    }}
                  >{`Download failed!`}</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      this.props.retry(this.props.index, this.props.pid)
                    }
                  >
                    <Image
                      style={{
                        height: 14,
                        width: 14,
                        tintColor: Constants.PRIMARY
                      }}
                      source={require('../Assets/restart_arrow.png')}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {DownloadManager.downloads[this.props.index].state ===
                DownloadManager.downloadStates.DONE && (
                <Text
                  style={{
                    color: Constants.PRIMARY,
                    opacity: 0.8,
                    fontSize: 12
                  }}
                >{`${this.resolution}  Size: ${
                  this.state.totalFinalBytes
                }`}</Text>
              )}
              {DownloadManager.downloads[this.props.index].state ===
                DownloadManager.downloadStates.PENDING && (
                <Text
                  style={{
                    color: Constants.PRIMARY,
                    opacity: 0.8,
                    fontSize: 12
                  }}
                >{`Downloading ...`}</Text>
              )}
              {DownloadManager.downloads[this.props.index].state ===
                DownloadManager.downloadStates.DOWNLOADING && (
                <Text
                  style={{
                    color: Constants.PRIMARY,
                    opacity: 0.8,
                    fontSize: 12
                  }}
                >
                  {`Downloaded  ${
                    DownloadManager.downloads[this.props.index].read
                  } of ${DownloadManager.downloads[this.props.index].total}`}
                </Text>
              )}
            </View>
          </View>
          <View style={{ flex: 1 }} />
          {(DownloadManager.downloads[this.props.index].state ===
            DownloadManager.downloadStates.DONE ||
            DownloadManager.downloads[this.props.index].state ===
              DownloadManager.downloadStates.FAILED) && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                this.props.delete(this.props.index, this.props.title)
              }
            >
              <Image
                style={{ width: 20, height: 20, margin: 4 }}
                source={require('../Assets/bin.png')}
              />
            </TouchableOpacity>
          )}
          {(DownloadManager.downloads[this.props.index].state ===
            DownloadManager.downloadStates.DOWNLOADING ||
            DownloadManager.downloads[this.props.index].state ===
              DownloadManager.downloadStates.PENDING) && (
            <View style={{ marginRight: 2 }}>
              <ProgressCircle
                percent={
                  DownloadManager.downloads[this.props.index].percent * 100
                }
                radius={12}
                borderWidth={1.5}
                color={Constants.TERTIARY}
                shadowColor={Constants.PRIMARY}
                bgColor={Constants.PRIMARY}
              >
                <Text
                  onPress={() =>
                    this.props.delete(this.props.index, this.props.title)
                  }
                  style={{
                    fontWeight: 'bold',
                    color: Constants.GREY2,
                    fontSize: 14
                  }}
                >
                  X
                </Text>
              </ProgressCircle>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }
}

export default class DownloadScreen extends React.Component {
  constructor(props) {
    super(props)
    this.sections = []
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Downloads ',
      headerLeft: (
        <View style={{ padding: 0, marginLeft: 16 }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image
              style={{ width: 21, height: 22 }}
              source={require('../Assets/menu.png')}
            />
          </TouchableOpacity>
        </View>
      )
    }
  }
  loadData = () => {
    DownloadManager.downloads.forEach(item => {
      item.subtitleJson = {}
      var mtitle = item.title
      var json = {
        title: mtitle,
        data: []
      }
      this.sections.forEach(i => {
        if (i.title === mtitle) i.data.push(JSON.parse(JSON.stringify(item)))
        else {
          json.data.push(JSON.parse(JSON.stringify(item)))
          this.sections.push(json)
        }
      })

      if (this.sections.length === 0) {
        json.data.push(JSON.parse(JSON.stringify(item)))
        this.sections.push(json)
      }
    })
    console.log(JSON.parse(JSON.stringify(this.sections)))
  }

  componentDidMount() {
    this.sections = []
    this.mounted = true
    this.props.navigation.addListener(
      'didFocus',
      () => (this.mounted ? this.setState({}) : null)
    )
    Dimensions.addEventListener(
      'change',
      () => (this.mounted ? this.setState({}) : null)
    )
    //this.loadData();
  }

  componentWillUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  LineRenderer = () => (
    <View
      style={{ height: 0.5, backgroundColor: Constants.PRIMARY, opacity: 0.2 }}
    />
  )

  updateState = () => this.setState({})

  retry = (index, pid) => {
    var process = DownloadManager.downloads[index]
    process.pecent = 0
    //DownloadManager.downloads[index].stop();
    AsyncStorage.removeItem(pid).catch(e => console.log(e))
    DownloadManager.remove(pid)
    DownloadManager.startDownload(process, this.updateState)
  }

  delete = (index, title) => {
    Alert.alert(`Remove ${title}`, 'Are you sure?', [
      {
        text: 'No',
        onPress: () => {}
      },
      {
        text: 'Yes',
        onPress: () => {
          let d = DownloadManager.downloads[index]
          d.stop()
          this.mounted ? this.setState({}) : null
        }
      }
    ])
  }

  render() {
    return (
      <View style={styles.mainStyle}>
        <FlatList
          contentContainerStyle={{ width: Dimensions.get('screen').width }}
          data={DownloadManager.downloads}
          ItemSeparatorComponent={this.LineRenderer}
          keyExtractor={(item, index) => {
            return index.toString()
          }}
          renderItem={({ item, index }) => (
            <DownloadItem
              {...item}
              index={index}
              retry={this.retry}
              delete={this.delete}
              navigation={this.props.navigation}
            />
          )}
        />
      </View>
    )
  }
}
