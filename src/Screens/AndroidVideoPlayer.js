import React from 'react'
import Video from 'react-native-video'
import {
  HideNavigationBar,
  ShowNavigationBar
} from 'react-native-navigation-bar-color'
import SystemSetting from 'react-native-system-setting'
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StatusBar,
  ToastAndroid,
  Alert,
  Image,
  Platform,
  Slider,
  Dimensions,
  ImageBackground,
  PanResponder,
  NetInfo,
  StyleSheet,
  BackHandler
} from 'react-native'

import Constants from '../Constants'
import ProgressManager from '../Managers/ProgressManager'
import AdManager from '../Managers/AdManager'
import SubsExtractor from '../SubsExtractor'

var styles = StyleSheet.create({
  videoStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  mainStyle: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  controlStyle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'column',
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  settingsStyle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'column',
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12
  }
})

export default class AndroidVideoPlayer extends React.Component {
  static navigationOptions = ({ navigation }) => {
    if (navigation.getParam('UIVisible'))
      return {
        title: navigation.getParam('other').isTv
          ? navigation.getParam('data').name + ' '
          : navigation.getParam('data').title + ' ',
        headerTransparent: true,
        headerStyle: {
          backgroundColor: 'rgba(0,0,0,0)'
        },
        headerLeft: (
          <View style={{ padding: 10 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                AdManager.showInterstitial(2000)
                StatusBar.setHidden(false, 'slide')
                Platform.OS === 'android' ? ShowNavigationBar() : null
                navigation.goBack()
              }}
            >
              <Image
                style={{
                  width: 20,
                  height: 20,
                  tintColor: Constants.PRIMARY,
                  paddingLeft: 2
                }}
                source={
                  Platform.OS == 'android'
                    ? require('../Assets/android_back.png')
                    : require('../Assets/ios_back.png')
                }
              />
            </TouchableOpacity>
          </View>
        ),
        headerRight: (
          <TouchableOpacity
            onPress={navigation.getParam('openSubPannel')}
            activeOpacity={0.6}
          >
            <Image
              style={{
                width: 25,
                height: 25,
                marginRight: 12,
                marginBottom: 12
              }}
              source={require('../Assets/subtitle.png')}
            />
          </TouchableOpacity>
        )
      }
    else
      return {
        header: null
      }
  }

  constructor(props) {
    super(props)
    this.duration = 0.0
    this.sysBrightness = 7.5
    this.sysVolume = 10
    this.seek = 0.0

    this.other = {}
    this.data = {}
    this.sub = ''

    this.state = {
      isBuffering: true,
      loaded: false,
      currentTime: 0.0,
      mode: 'contain',
      paused: false,
      progress: 0.0,
      volume: this.sysVolume,
      brightness: this.sysBrightness,
      UIVisible: false,
      settings: '',
      //sub
      sub: '',
      sync: 0.0,
      syncMode: false,
      isSubOn: true,
      note: true,
      panOn: true
    }

    this.moveThreshold = 10
    this.touchMax = 3
    this.PanMode = undefined

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderMove: (evt, gs) => {
        if (this.PanMode == undefined) {
          if (
            Math.abs(gs.dx) > this.moveThreshold ||
            Math.abs(gs.dy) > this.moveThreshold
          ) {
            if (Math.abs(gs.dx) > Math.abs(gs.dy)) {
              this.PanMode = 'Horizontal'
            } else {
              this.PanMode = 'Vertical'
            }
          }
        } else {
          switch (this.PanMode) {
            case 'Horizontal':
              this.moveX(gs)
              break
            case 'Vertical':
              this.moveY(gs)
              break
          }
        }
      },
      onPanResponderEnd: (evt, gs) => {
        if (Math.abs(gs.dx) < this.touchMax && Math.abs(gs.dy) < this.touchMax)
          this.onTouch()
        else {
          if (this.seek !== 0) this.changeSlider(this.seek)
        }
        this.PanMode = undefined
        this.setState({
          paused: this.state.settings === 'ff' ? false : this.state.paused,
          settings: ''
        })
      }
    })
  }

  componentDidMount() {
    this.mounted = true
    //setTimeout(() => {Orientation.lockToLandscape();}, 300)
    Platform.OS === 'android' ? HideNavigationBar() : null

    this.props.navigation.setParams({
      UIVisible: true,
      openSubPannel: this.openSubPannel
    })
    Platform.OS === 'android'
      ? BackHandler.addEventListener('hardwareBackPress', () => {
          AdManager.showInterstitial(2000)
          StatusBar.setHidden(false, 'slide')
          Platform.OS === 'android' ? ShowNavigationBar() : null
          this.props.navigation.goBack()
        })
      : null
    SystemSetting.getVolume().then(volume => {
      this.sysVolume = volume
    })
    SystemSetting.getAppBrightness().then(
      brightness => (this.sysBrightness = brightness)
    )
    this.mounted
      ? this.setState({
          volume: this.sysVolume,
          brightness: this.sysBrightness,
          note: true
        })
      : null
    setTimeout(() => this.setState({ note: false }), 2400)
    this.other = this.props.navigation.getParam('other', {})
    this.data = this.props.navigation.getParam('data', {})

    Dimensions.addEventListener('change', () => {
      this.mounted ? this.setState({}) : null
      StatusBar.setHidden(true)
    })

    const subscription = this.props.navigation.addListener(
      'willBlur',
      payload => this.saveProgress().then(() => subscription.remove())
    )
    StatusBar.setHidden(true)
  }

  _onLayout = () => StatusBar.setHidden(true)

  componentWillUnmount() {
    this.mounted = false
    this.show = true
    //Orientation.unlockAllOrientations();
    SystemSetting.setVolume(this.sysVolume)
    SystemSetting.setAppBrightness(this.sysBrightness)
    this.props.navigation.setParams({ cameBack: true })

    Dimensions.removeEventListener('change')
  }

  saveProgress = async () => {
    if (!this.props.navigation.getParam('offline')) {
      if (this.other.isTv) {
        if (!ProgressManager.hasTvProgress(this.data.id)) {
          let progressObj = {
            time: this.state.currentTime,
            duration: this.duration,
            completed: this.state.currentTime >= this.duration - 5.0,
            id: this.data.id,
            data: this.data,
            season: this.other.season,
            eps: this.other.eps
          }
          ProgressManager.addTvShow(progressObj)
        } else if (ProgressManager.hasTvProgress(this.data.id)) {
          ProgressManager.removeTvShowProgress(this.data.id)
          let progressObj = {
            time: this.state.currentTime,
            duration: this.duration,
            completed: this.state.currentTime >= this.duration - 5.0,
            id: this.data.id,
            data: this.data,
            season: this.other.season,
            eps: this.other.eps
          }
          ProgressManager.addTvShow(progressObj)
        }
      } else if (!this.other.isTv) {
        if (!ProgressManager.hasMovieProgress(this.data.id)) {
          let progressObj = {
            time: this.state.currentTime,
            duration: this.duration,
            data: this.data,
            completed: this.state.currentTime >= this.duration - 5.0,
            id: this.data.id
          }
          ProgressManager.addMovie(progressObj)
        } else if (ProgressManager.hasMovieProgress(this.data.id)) {
          if (this.state.currentTime >= this.duration - 5.0)
            ProgressManager.removeMovieProgress(this.data.id)
          else {
            ProgressManager.removeMovieProgress(this.data.id)
            let progressObj = {
              time: this.state.currentTime,
              duration: this.duration,
              data: this.data,
              completed: this.state.currentTime >= this.duration - 5.0,
              id: this.data.id
            }
            ProgressManager.addMovie(progressObj)
          }
        }
      }
    }
  }

  loadProgress = () => {
    //console.log(this.props.navigation.getParam('url'));
    if (!this.props.navigation.getParam('offline')) {
      this.pause()
      var proTv = ProgressManager.getTv(this.data.id)
      var proMovie = ProgressManager.getMovie(this.data.id)

      if (!this.other.isTv && proMovie != null && proMovie.time >= 2.0) {
        Alert.alert('Progress found', 'Would you like to continue', [
          {
            text: 'Start Over',
            onPress: () => {
              if (this.mounted) {
                this.changeSlider(0.0)
                this.setState(
                  { loaded: true, paused: false, UIVisible: false },
                  () =>
                    this.props.navigation.setParams({
                      UIVisible: this.state.UIVisible
                    })
                )
                Platform.OS === 'android' ? HideNavigationBar() : null
                this.props.navigation.setParams({
                  UIVisible: true,
                  openSubPannel: this.openSubPannel
                })
              }
            }
          },
          {
            text: 'Continue',
            onPress: () => {
              if (this.mounted) {
                this.changeSlider(proMovie.time)
                this.setState(
                  { loaded: true, paused: false, UIVisible: false },
                  () =>
                    this.props.navigation.setParams({
                      UIVisible: this.state.UIVisible
                    })
                )
                Platform.OS === 'android' ? HideNavigationBar() : null
                this.props.navigation.setParams({
                  UIVisible: true,
                  openSubPannel: this.openSubPannel
                })
              }
            }
          }
        ])
      } else if (
        proTv != null &&
        proTv.eps === this.other.eps &&
        proTv.time >= 2.0
      ) {
        Alert.alert('Progress found', 'Would you like to continue', [
          {
            text: 'Start Over',
            onPress: () => {
              this.changeSlider(0.0)
              this.setState(
                { loaded: true, paused: false, UIVisible: false },
                () =>
                  this.props.navigation.setParams({
                    UIVisible: this.state.UIVisible
                  })
              )
              //Platform.OS === 'android' ? HideNavigationBar() : null
              this.props.navigation.setParams({
                UIVisible: true,
                openSubPannel: this.openSubPannel
              })
            }
          },
          {
            text: 'Continue',
            onPress: () => {
              this.changeSlider(proTv.time)
              this.setState(
                { loaded: true, paused: false, UIVisible: false },
                () =>
                  this.props.navigation.setParams({
                    UIVisible: this.state.UIVisible
                  })
              )
              Platform.OS === 'android' ? HideNavigationBar() : null
              this.props.navigation.setParams({
                UIVisible: true,
                openSubPannel: this.openSubPannel
              })
            }
          }
        ])
      } else this.setState({ loaded: true, paused: false })
    } else this.setState({ loaded: true, paused: false })
  }

  openSubPannel = () => this.setState({ syncMode: true, panOn: false })

  getSubs = async () => {
    if (
      SubsExtractor.subtitleJson == null ||
      SubsExtractor.subtitleJson.length === 0
    ) {
      Platform.OS === 'android'
        ? ToastAndroid.show('Subtitles Unavailable :(', ToastAndroid.LONG)
        : null
      this.sub = ''
      this.mounted ? this.setState({ sub: this.sub }) : null
    }
    //console.log("a" + JSON.stringify(SubsExtractor.subtitleJson));
  }

  adClosed = () => {
    this.setState({ loaded: true, paused: false })
    Platform.OS === 'android' ? HideNavigationBar() : null
    this.mounted ? StatusBar.setHidden(true, 'slide') : null
  }
  //adOpened =  () => this.setState({loaded: true, paused: true});

  handleError = () => {
    Platform.OS === 'android'
      ? ToastAndroid.show(
          'Something went wrong :( Try another link',
          ToastAndroid.LONG
        )
      : Alert.alert('Something went wrong :( Try another link')
    setTimeout(() => this.props.navigation.goBack(), 1000)
  }

  handleBuffer = meta =>
    this.mounted ? this.setState({ isBuffering: meta.isBuffering }) : null

  onLoad = data => {
    Platform.OS === 'android' ? HideNavigationBar() : null
    StatusBar.setHidden(true)
    AdManager.showInterstitial(2000, this.adClosed)
    this.getSubs()
    this.loadProgress()
    this.duration = data.duration
  }
  getContent = () => {
    return SubsExtractor.subtitleJson.find(
      s => s.start <= this.state.currentTime && s.end >= this.state.currentTime
    )
  }
  onProgress = data => {
    var flag = 0
    for (let i = 0; i < SubsExtractor.subtitleJson.length; i++) {
      //console.log(data.currentTime-Math.floor(this.state.sync));
      if (
        Number(SubsExtractor.subtitleJson[i].start) <=
          data.currentTime - Math.floor(this.state.sync * 10) / 10 &&
        data.currentTime - Math.floor(this.state.sync * 10) / 10 <=
          Number(SubsExtractor.subtitleJson[i].end)
      ) {
        this.sub = SubsExtractor.subtitleJson[i].content
        flag = 1
        //console.log(JSON.stringify(SubsExtractor.subtitleJson[i]));
        break
      } else if (
        i != SubsExtractor.subtitleJson.length - 1 &&
        Number(SubsExtractor.subtitleJson[i + 1].start) >
          data.currentTime - Math.floor(this.state.sync * 10) / 10
      ) {
        break
      }
    }
    if (flag == 0) this.sub = ''
    if (
      !this.shown &&
      (data.currentTime >= this.duration / 2 - 2.0 &&
        data.currentTime <= this.duration / 2 + 2.0)
    ) {
      AdManager.showInterstitial(2000, this.adClosed)
      this.shown = true
    }
    this.mounted
      ? this.setState({ currentTime: data.currentTime, sub: this.sub })
      : null
  }

  onEnd = () => this.props.navigation.goBack()
  pause = () => this.setState({ paused: !this.state.paused })

  onTouch = () => {
    //clearTimeout();
    if (this.state.UIVisible)
      this.mounted
        ? this.setState({ UIVisible: false }, () =>
            this.props.navigation.setParams({ UIVisible: this.state.UIVisible })
          )
        : null
    else {
      this.mounted
        ? this.setState({ UIVisible: true }, () =>
            this.props.navigation.setParams({ UIVisible: this.state.UIVisible })
          )
        : null
      setTimeout(() => {
        this.mounted && this.state.UIVisible
          ? this.setState({ UIVisible: false }, () =>
              this.props.navigation.setParams({
                UIVisible: this.state.UIVisible
              })
            )
          : null
      }, 5000)
    }
  }

  moveX = gs => {
    var dir = 1
    if (gs.vx > 0) dir = 1
    else dir = -1
    let swiftX = 0.0001 * dir * this.duration * Math.abs(gs.dx)
    if (this.state.currentTime + swiftX <= this.duration) {
      this.changeSlider(swiftX)
      this.setState({
        paused: true,
        settings: 'ff'
      })
    }
  }

  moveY = gs => {
    var dir = 1
    if (gs.vy < 0) dir = 1
    else dir = -1
    if (gs.moveX > Dimensions.get('screen').width / 2) {
      let nextVolume = this.state.volume + dir * 0.2
      if (nextVolume < 0) nextVolume = 0
      if (nextVolume > 15) nextVolume = 15
      try {
        SystemSetting.setVolume(nextVolume / 15)
        this.setState({
          settings: 'volume',
          volume: nextVolume
        })
      } catch (e) {}
    } else {
      let nextBrightness = this.state.brightness + dir * 0.2
      if (nextBrightness < 0) nextBrightness = 0
      if (nextBrightness > 15) nextBrightness = 15
      try {
        SystemSetting.setAppBrightness(nextBrightness / 15)
        this.setState({
          settings: 'brightness',
          brightness: nextBrightness
        })
      } catch (e) {
        console.log(e)
      }
    }
  }

  modeChange = () => {
    if (this.state.mode === 'cover')
      this.mounted ? this.setState({ mode: 'contain' }) : null
    else this.mounted ? this.setState({ mode: 'cover' }) : null
  }

  changeSlider = value => {
    if (this.mounted) {
      if (this.state.currentTime + value > this.state.duration) {
        this.player.seek(this.state.duration - 0.1)
        this.setState({ currentTime: this.state.duration - 0.1 })
      } else if (this.state.currentTime + value < 0.0) {
        this.player.seek(0.0)
        this.setState({ currentTime: 0.0 })
      } else {
        this.player.seek(this.state.currentTime + value)
        this.setState({ currentTime: this.state.currentTime + value })
      }
    }
  }

  pad = number => {
    return ((number < 10 ? '0' : '') + number.toString()).toString()
  }

  formatTime = time => {
    let h = Math.floor(time / 3600)
    let m = Math.floor((time % 3600) / 60)
    let s = Math.round(Math.floor((time % 3600) % 60))

    if (this.duration < 60) return this.pad(s)
    else if (this.duration <= 3600) return this.pad(m) + ':' + this.pad(s)
    else if (this.duration <= 86400)
      return this.pad(h) + ':' + this.pad(m) + ':' + this.pad(s)
  }

  render() {
    return (
      <View style={styles.mainStyle} onLayout={this._onLayout}>
        {Platform.OS === 'android' && (
          <Video
            source={{ uri: this.props.navigation.getParam('url') }}
            ref={ref => {
              this.player = ref
            }}
            resizeMode={this.state.mode}
            progressUpdateInterval={1000}
            style={styles.videoStyle}
            onError={this.handleError}
            onBuffer={this.handleBuffer}
            volume={this.state.volume}
            paused={this.state.paused}
            onProgress={this.onProgress}
            onLoad={this.onLoad}
            onEnd={this.onEnd}
          />
        )}
        {/*Platform.OS==="ios" &&
        <VLCPlayer
          ref={(ref) => {this.player=ref;}}
          paused={this.state.paused}
          style={styles.videoStyle}
          source={{uri: this.props.navigation.getParam('url'), initOptions: ['--codec=avcodec']}}
          onVLCProgress={this.onProgress}
          onVLCEnded={this.onEnd}
          onVLCPlaying={this.onLoad}
          onVLCBuffering={this.handleBuffer}
        />*/}
        {this.state.panOn && (
          <View
            style={{
              position: 'absolute',
              height: this.state.UIVisible
                ? Dimensions.get('screen').height / 1.45
                : Dimensions.get('screen').height,
              backgroundColor: 'rgba(0,0,0,0)',
              width: Dimensions.get('screen').width
            }}
            {...this._panResponder.panHandlers}
          />
        )}
        {this.state.isBuffering && (
          <Image
            style={{ width: 50, height: 50, tintColor: Constants.TERTIARY }}
            source={require('../Assets/spinner.gif')}
            resizeMode="contain"
          />
        )}
        {this.state.note && (
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: Constants.PRIMARY,
              position: 'absolute',
              top: Dimensions.get('screen').height / 4,
              marginBottom: 20
            }}
          >
            Switch-on your auto rotation
          </Text>
        )}
        {this.state.settings !== '' && (
          <View
            style={[
              styles.settingsStyle,
              {
                width: Dimensions.get('screen').width,
                height: Dimensions.get('screen').height
              }
            ]}
          >
            {this.state.settings === 'volume' && (
              <View style={{ alignSelf: 'flex-start' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 6
                  }}
                >
                  <Image
                    source={require('../Assets/volume.png')}
                    style={{ width: 36, height: 36 }}
                  />
                  <Text
                    style={{
                      fontSize: 28,
                      color: Constants.PRIMARY,
                      fontWeight: 'bold',
                      margin: 6
                    }}
                  >
                    {Math.round(this.state.volume).toString() + ' '}
                  </Text>
                </View>
              </View>
            )}
            {this.state.settings === 'ff' && (
              <View style={{ alignSelf: 'center' }}>
                <Text
                  style={{
                    fontSize: 24,
                    color: Constants.PRIMARY,
                    fontWeight: 'bold'
                  }}
                >
                  {this.formatTime(this.state.currentTime)}
                </Text>
              </View>
            )}
            {this.state.settings === 'brightness' && (
              <View style={{ alignSelf: 'flex-end' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 6
                  }}
                >
                  <Text
                    style={{
                      fontSize: 28,
                      color: Constants.PRIMARY,
                      fontWeight: 'bold',
                      margin: 6
                    }}
                  >
                    {Math.round(this.state.brightness).toString() + ' '}
                  </Text>
                  <Image
                    source={require('../Assets/brightness.png')}
                    style={{ width: 36, height: 36 }}
                  />
                </View>
              </View>
            )}
          </View>
        )}
        {this.state.loaded &&
          !this.state.isBuffering &&
          this.state.isSubOn && (
            <Text
              numberOfLines={undefined}
              style={{
                width: Dimensions.get('screen').width / 2,
                textAlign: 'center',
                alignSelf: 'center',
                color: Constants.PRIMARY,
                fontWeight: 'bold',
                fontSize: 18,
                position: 'absolute',
                margin: 12,
                bottom: !this.state.UIVisible ? 0 : 85
              }}
            >
              {this.state.sub}
            </Text>
          )}
        {!this.state.isBuffering &&
          this.state.loaded &&
          this.state.syncMode && (
            <View
              style={{
                flex: 1,
                position: 'absolute',
                width: 240,
                height: 100,
                backgroundColor: 'rgba(33,30,32,0.9)',
                borderRadius: 6,
                flexDirection: 'column',
                padding: 8,
                paddingRight: 4,
                top: Dimensions.get('screen').height / 2 - 100 / 2 - 16,
                left: Dimensions.get('screen').width / 2 - 240 / 2,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={{ margin: 2 }}
                  onPress={() => {
                    console.log('Closing')
                    this.setState({ syncMode: false, panOn: true })
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 1 }}
                >
                  <View
                    style={{
                      borderRadius: 12.5,
                      width: 20,
                      height: 20,
                      backgroundColor: Constants.TERTIARY,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: Constants.PRIMARY
                      }}
                    >
                      X
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flex: 1,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  width: 140,
                  marginVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginHorizontal: 4
                }}
              >
                <Text style={{ fontSize: 14, color: Constants.PRIMARY }}>
                  Subtitles:{' '}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  onPress={() =>
                    this.setState({ isSubOn: !this.state.isSubOn })
                  }
                >
                  <Image
                    source={require('../Assets/subtitle.png')}
                    style={{
                      tintColor: this.state.isSubOn
                        ? Constants.TERTIARY
                        : Constants.PRIMARY,
                      margin: 4,
                      height: 24,
                      width: 24
                    }}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flex: 1,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  width: 200,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 6,
                  paddingBottom: 12
                }}
              >
                <Text style={{ fontSize: 14, color: Constants.PRIMARY }}>
                  Synchronization:{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => this.setState({ sync: this.state.sync - 0.5 })}
                >
                  <View
                    style={{
                      margin: 4,
                      marginLeft: 8,
                      borderRadius: 12.5,
                      width: 25,
                      height: 25,
                      backgroundColor: Constants.TERTIARY,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: Constants.PRIMARY
                      }}
                    >
                      -
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: Constants.PRIMARY,
                    margin: 2
                  }}
                >
                  {Number(Math.floor(this.state.sync * 10) / 10).toFixed(1)}
                </Text>
                <TouchableOpacity
                  onPress={() => this.setState({ sync: this.state.sync + 0.5 })}
                >
                  <View
                    style={{
                      margin: 4,
                      borderRadius: 12.5,
                      width: 25,
                      height: 25,
                      backgroundColor: Constants.TERTIARY,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: Constants.PRIMARY
                      }}
                    >
                      +
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        {!this.state.isBuffering &&
          this.state.loaded &&
          this.state.UIVisible && (
            <View
              style={[
                styles.controlStyle,
                { width: Dimensions.get('screen').width }
              ]}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: Constants.PRIMARY,
                    marginHorizontal: 6
                  }}
                >
                  {this.formatTime(this.state.currentTime) + ' '}
                </Text>
                <Slider
                  style={{ flex: 1, maxWiidth: Dimensions.get('screen').width }}
                  thumbTintColor={Constants.TERTIARY}
                  maximumTrackTintColor={Constants.PRIMARY}
                  minimumTrackTintColor={Constants.TERTIARY}
                  step={undefined}
                  maximumValue={this.duration}
                  minimumValue={0}
                  onValueChange={val => {
                    if (!this.state.paused) this.setState({ paused: true })
                  }}
                  onSlidingComplete={value => {
                    this.setState({ currentTime: value, paused: false }, () =>
                      this.player.seek(value)
                    )
                  }}
                  value={this.state.currentTime}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: Constants.PRIMARY,
                    marginHorizontal: 6,
                    marginRight: 8
                  }}
                >
                  {this.formatTime(this.duration)}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginVertical: 8,
                  marginLeft: 3
                }}
              >
                <TouchableOpacity
                  onPress={this.modeChange}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.8}
                >
                  <Image
                    style={{ height: 24, width: 24, marginLeft: 4 }}
                    source={require('../Assets/fit_screen.png')}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableWithoutFeedback
                  onPress={() => {
                    this.changeSlider(-10.0)
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <ImageBackground
                    style={{
                      height: 34,
                      width: 34,
                      marginRight: 3,
                      padding: 3,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    source={require('../Assets/restart_arrow_back.png')}
                  >
                    <Text
                      onPress={() => {
                        this.changeSlider(-10.0)
                      }}
                      style={{
                        fontSize: 12,
                        color: Constants.PRIMARY,
                        marginBottom: 2,
                        marginLeft: 1
                      }}
                    >
                      10
                    </Text>
                  </ImageBackground>
                </TouchableWithoutFeedback>
                <View
                  style={{
                    marginVertical: 10,
                    marginHorizontal: 10,
                    marginVertical: 8
                  }}
                >
                  <TouchableWithoutFeedback onPress={this.pause}>
                    <Image
                      style={{ height: 48, width: 48 }}
                      source={
                        !this.state.paused
                          ? require('../Assets/pause.png')
                          : require('../Assets/play.png')
                      }
                    />
                  </TouchableWithoutFeedback>
                </View>
                <TouchableWithoutFeedback
                  onPress={() => {
                    this.changeSlider(30.0)
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <ImageBackground
                    style={{
                      height: 34,
                      width: 34,
                      marginLeft: 3,
                      padding: 3,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    source={require('../Assets/restart_arrow.png')}
                  >
                    <Text
                      onPress={() => {
                        this.changeSlider(30.0)
                      }}
                      style={{
                        fontSize: 12,
                        color: Constants.PRIMARY,
                        marginLeft: 2,
                        marginBottom: 2
                      }}
                    >
                      30
                    </Text>
                  </ImageBackground>
                </TouchableWithoutFeedback>
                <View style={{ flex: 1 }} />
              </View>
            </View>
          )}
      </View>
    )
  }
}
