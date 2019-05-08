import React from 'react'
import {
  Text,
  ToastAndroid,
  Image,
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Platform,
  ImageBackground,
  Picker,
  ActionSheetIOS,
  Animated,
  Linking,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native'
import ProgressCircle from 'react-native-progress-circle'
import Carousel from 'react-native-snap-carousel'

import PosterSliderView from '../Components/PosterSliderView'
import WatchlistManager from '../Managers/WatchlistManager'
import AdManager from '../Managers/AdManager'
import ProgressManager from '../Managers/ProgressManager'
import Constants from '../Constants'
import Calls from '../Calls'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  },
  buttonStyle: {
    width: 76,
    height: 24,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {
      height: 2
    },
    elevation: 5,
    borderRadius: 20,
    backgroundColor: Constants.TERTIARY
  },
  buttonStyleSmall: {
    padding: 4,
    height: 24,
    backgroundColor: Constants.PRIMARY,
    borderRadius: 20,
    borderWidth: 0.75
  },
  pickerStyle: {
    width: 100,
    height: 32,
    backgroundColor: Constants.PRIMARY
  },
  textStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Constants.PRIMARY
  },
  epsItemStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 4,
    shadowColor: Constants.SHADOW,
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 0.4,
      height: 0.4
    },
    shadowRadius: 2,
    elevation: 2
  },
  liftedStyle: {
    backgroundColor: '#242023',
    borderRadius: 6,
    shadowOpacity: 0.5,
    shadowColor: Constants.SHADOW,
    shadowRadius: 5,
    shadowOffset: { height: 1.5, width: 1.5 },
    alignSelf: 'center',
    flex: 1,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  pickerStyle: {
    maxWidth: 140,
    marginBottom: 12,
    marginLeft: 14,
    height: 32,
    backgroundColor: Constants.PRIMARY,
    justifyContent: 'center',
    borderRadius: 2,
    elevation: 5
  },
  pickerStyleIOS: {
    width: 130,
    marginBottom: 12,
    marginLeft: 14,
    height: 32,
    backgroundColor: Constants.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { height: 2 },
    shadowColor: Constants.SHADOW
  }
})

export default class DetailsScreen extends React.Component {
  constructor(props) {
    super(props)
    this.isTv = true
    this.details = {}
    this.similar = {}
    this.recommended = {}
    this.genre = ''
    this.seasonArray = ['Season 1', 'Season 2']

    this.state = {
      width: Dimensions.get('screen').width,
      height: Dimensions.get('screen').height,
      isLoading: true,
      data: {},
      expanded: false,
      eps: [],
      selectedSeason: 'Season 1'
    }
  }

  setStuff = async () => {
    if (this.isTv) json = await Calls.getTvDetails(this.state.data.id)
    else json = await Calls.getMovieDetails(this.state.data.id)
    this.details = json

    //Set the genres' String
    var genreString = ' '
    3
    for (let i = 0; i < this.details.genres.length; i++) {
      if (i === 0) genreString = this.details.genres[i].name
      else genreString = genreString + ', ' + this.details.genres[i].name
    }
    this.genre = genreString

    if (this.isTv) {
      //Initialise list for Dropdown:-
      var _seasonArray = []
      for (let i = 1; i <= this.details.number_of_seasons; i++)
        _seasonArray[i - 1] = 'Season ' + i.toString()

      //Eps:
      for (let i = 0; i < this.details.number_of_seasons; i++) {
        json = await Calls.getEpisodes(this.state.data.id, i + 1)
        this.state.eps.push(json.episodes)
      }
      this.seasonArray = _seasonArray
    }

    //Similar:
    if (this.isTv) json = await Calls.getSimilarTvShows(this.state.data.id)
    else json = await Calls.getSimilarMovies(this.state.data.id)
    this.similar = json

    //Trending:
    if (this.isTv) json = await Calls.getRecommendedTvShows(this.state.data.id)
    else json = await Calls.getRecommendedMovies(this.state.data.id)
    this.recommended = json
    this.mounted ? this.setState({ isLoading: false }) : null

    if (this.isTv) {
      let item = ProgressManager.getTv(this.state.data.id)
      if (item != null)
        this.mounted
          ? this.setState({ selectedSeason: `Season ${item.season}` })
          : null
    }
  }

  componentDidMount() {
    this.isTv = this.props.navigation.getParam('other', {}).isTv
    this.mounted = true
    StatusBar.setHidden(false, 'slide')
    this.props.navigation.addListener('didFocus', () =>
      StatusBar.setHidden(false)
    )

    this.mounted
      ? this.setState(
          { data: this.props.navigation.getParam('data', {}) },
          async () => {
            this.setStuff()
          }
        )
      : null
    Dimensions.addEventListener(
      'change',
      () =>
        this.mounted
          ? this.setState({
              width: Dimensions.get('screen').width,
              height: Dimensions.get('screen').height
            })
          : null
    )
    this.props.navigation.setParams({ animatedValue: 0 })
  }
  componentWillUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title:
        navigation.getParam('animatedValue', null) < 1
          ? null
          : navigation.getParam('other', {}).isTv
            ? ' ' + navigation.getParam('data', {}).name + ' '
            : ' ' + navigation.getParam('data', {}).title + ' ',
      headerStyle: {
        borderBottomWidth: 0,
        backgroundColor: `rgba(33, 30, 32, ${navigation.getParam(
          'animatedValue',
          null
        )})`,
        borderRadius: 0.5
        //opacity: (!navigation.getParam('animatedValue', null)?0:navigation.getParam('animatedValue', null)),
      },
      headerTransparent: true
    }
  }

  openURL = async () => {
    if (this.state.isTv) url = await Calls.getTvTrailerUrl(this.state.data.id)
    else url = await Calls.getMovieTrailerUrl(this.state.data.id)
    if (url == null)
      Platform.OS === 'android'
        ? ToastAndroid.show(
            'Sorry, trailer is unavailable :(',
            ToastAndroid.LONG
          )
        : Alert.alert('Sorry, trailer is unavailable :(')
    else {
      Linking.canOpenURL(url).then(supported => {
        if (supported) Linking.openURL(url)
        else console.log("Don't know how to open URI: " + url)
      })
    }
  }

  LineRenderer = () => (
    <View
      style={{ height: 0.5, backgroundColor: Constants.PRIMARY, opacity: 0.2 }}
    />
  )

  handlePress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Select Season',
        options: [...this.seasonArray, 'Cancel'],
        cancelButtonIndex: this.seasonArray.length
      },
      index => {
        if (index < this.seasonArray.length)
          this.setState({ selectedSeason: this.seasonArray[index] })
      }
    )
  }

  addToWatchList = async key => {
    if (key === 'WatchlistTv') {
      if (!WatchlistManager.hasTvShow(this.state.data.id)) {
        let bool = WatchlistManager.addTvShow(this.state.data)
        Platform.OS === 'android' && bool
          ? ToastAndroid.show('Added to watchlist :)', ToastAndroid.SHORT)
          : null
        this.mounted ? this.setState({}) : null
      } else
        Platform.OS === 'android'
          ? ToastAndroid.show('Already added', ToastAndroid.SHORT)
          : Alert.alert('Already added!')
    } else {
      if (!WatchlistManager.hasMovie(this.state.data.id)) {
        let bool = WatchlistManager.addMovie(this.state.data)
        Platform.OS === 'android' && bool
          ? ToastAndroid.show('Added to watchlist :)', ToastAndroid.SHORT)
          : null
        this.mounted ? this.setState({}) : null
      } else
        Platform.OS === 'android'
          ? ToastAndroid.show('Already added', ToastAndroid.SHORT)
          : Alert.alert('Already added!')
    }
  }

  _renderItemEps = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          this.props.navigation.navigate('linksScreen', {
            other: {
              isTv: this.props.navigation.getParam('other').isTv,
              eps: item.episode_number,
              season: Number(this.state.selectedSeason.split(' ')[1])
            },
            data: this.state.data
          })
        }}
      >
        <View style={styles.epsItemStyle}>
          <ImageBackground
            style={
              item.still_path !== null
                ? {
                    height: 70,
                    width: 65,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }
                : {
                    height: 50,
                    width: 46,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }
            }
            source={
              item.still_path !== null
                ? { uri: Constants.IMAGEBASE_URL_342 + item.still_path }
                : require('../Assets/SLink.png')
            }
          >
            <Image
              style={{ height: 22, width: 22 }}
              source={require('../Assets/play.png')}
            />
          </ImageBackground>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              paddingHorizontal: 6
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginVertical: 2
              }}
            >
              <Text
                style={{ fontSize: 13, color: Constants.PRIMARY }}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <View style={{ flex: 1 }} />
            </View>
            <Text
              style={{
                fontSize: 9,
                color: Constants.PRIMARY,
                opacity: 0.8,
                padding: 2
              }}
              numberOfLines={3}
            >
              {item.overview === '' ? '--No overview avail--' : item.overview}
            </Text>
            <View style={{ flex: 1 }} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'flex-end'
              }}
            >
              <Text
                style={{ fontSize: 9, color: Constants.PRIMARY, padding: 2 }}
                numberOfLines={1}
              >
                {item.air_date}
              </Text>
              <View style={{ flex: 1 }} />
              <Text
                style={{
                  fontSize: 10,
                  color: Constants.PRIMARY,
                  alignSelf: 'flex-end',
                  padding: 2
                }}
                numberOfLines={1}
              >
                {'Episode ' + item.episode_number}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    let seasonItems = this.seasonArray.map((s, i) => {
      return <Picker.Item key={i} value={s} label={s} />
    })
    StatusBar.setHidden(false)
    if (this.state.isLoading) {
      return (
        <View
          style={[
            styles.mainStyle,
            {
              height: Dimensions.get('screen').height,
              justifyContent: 'center',
              alignItems: 'center'
            }
          ]}
        >
          <Image
            tintColor={Constants.TERTIARY}
            style={{ width: 56, height: 56, tintColor: Constants.TERTIARY }}
            source={require('../Assets/spinner.gif')}
            resizeMode="contain"
          />
        </View>
      )
    } else {
      return (
        <View style={styles.mainStyle}>
          <Animated.ScrollView
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            alwaysBounceHorizontal={false}
            bounces={false}
            onScroll={data => {
              //console.log(data.nativeEvent.contentOffset.y/(Dimensions.get('screen').height*0.225));
              this.props.navigation.setParams({
                animatedValue:
                  data.nativeEvent.contentOffset.y / (this.state.height * 0.225)
              })
            }}
            scrollEventThrottle={16}
          >
            <Image
              style={{
                width: this.state.width,
                height:
                  this.state.height < this.state.width
                    ? this.state.height * 0.45
                    : this.state.height * 0.32
              }}
              source={{
                uri:
                  Constants.IMAGEBASE_URL_1280 + this.state.data.backdrop_path
              }}
            />
            <View
              style={[styles.liftedStyle, { width: this.state.width * 0.95 }]}
              transform={[{ translateY: -32 }]}
            >
              <ImageBackground
                style={{
                  height: 140,
                  width: 100,
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginLeft: 8,
                  marginVertical: 8,
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}
                source={{
                  uri: Constants.IMAGEBASE_URL_342 + this.state.data.poster_path
                }}
              >
                <View style={{ marginBottom: 6, marginLeft: 6 }}>
                  <ProgressCircle
                    percent={this.state.data.vote_average * 10}
                    radius={12}
                    borderWidth={1}
                    color={Constants.TERTIARY}
                    shadowColor={Constants.GREY2}
                    bgColor={Constants.GREY2}
                  >
                    <Text style={{ fontSize: 8, color: Constants.PRIMARY }}>
                      {this.state.data.vote_average.toFixed(1)}
                    </Text>
                  </ProgressCircle>
                </View>
              </ImageBackground>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start'
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginVertical: 8,
                    marginHorizontal: 11
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Text
                      style={[styles.textStyle, { marginBottom: 4 }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {this.isTv
                        ? this.state.data.name + ' '
                        : this.state.data.title + ' '}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: Constants.PRIMARY,
                        opacity: 0.9,
                        marginVertical: 2,
                        marginLeft: 4
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {this.isTv
                        ? this.state.data.first_air_date + ' '
                        : this.state.data.release_date + ' '}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: Constants.PRIMARY,
                        opacity: 0.9,
                        marginLeft: 4
                      }}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {this.genre}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 12
                      }}
                    >
                      <TouchableOpacity
                        style={styles.buttonStyle}
                        acitveOpacity={0.8}
                        onPress={this.openURL}
                      >
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <Image
                            style={{ paddingRight: 3, width: 9, height: 9 }}
                            source={require('../Assets/play_button.png')}
                          />
                          <Text
                            style={{ fontSize: 10, color: Constants.PRIMARY }}
                          >
                            {' '}
                            TRAILER{' '}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.buttonStyleSmall,
                          {
                            marginHorizontal: 7,
                            justifyContent: 'center',
                            alignItems: 'center'
                          }
                        ]}
                        acitveOpacity={0.8}
                        onPress={() => {
                          this.isTv
                            ? this.addToWatchList('WatchlistTv')
                            : this.addToWatchList('WatchlistMovie')
                        }}
                      >
                        <Text style={{ fontSize: 9, color: 'black' }}>
                          {(this.isTv &&
                            WatchlistManager.hasTvShow(this.state.data.id)) ||
                          (!this.isTv &&
                            WatchlistManager.hasMovie(this.state.data.id))
                            ? ' ✔ WATCHLST '
                            : ' +WATCHLIST '}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {this.state.data.overview !== '' ? (
                  <View style={{ flexDirection: 'column' }}>
                    <Text
                      style={{
                        marginRight: 5,
                        marginLeft: 14,
                        marginTop: 6,
                        color: Constants.PRIMARY,
                        opacity: 0.8,
                        fontSize: 12
                      }}
                      numberOfLines={!this.state.expanded ? 3 : undefined}
                    >
                      {this.state.data.overview}
                    </Text>
                    <Text
                      style={{
                        color: Constants.TERTIARY,
                        marginVertical: 4,
                        fontSize: 11,
                        marginRight: 14,
                        alignSelf: 'flex-end'
                      }}
                      onPress={() => {
                        this.mounted
                          ? this.setState({ expanded: !this.state.expanded })
                          : null
                      }}
                    >
                      {!this.state.expanded ? 'View More ' : 'View Less '}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View
              style={{ marginHorizontal: 4, flex: 1, flexDirection: 'column' }}
            >
              {/* For TV Shows:----------*/}
              {this.isTv ? (
                <View>
                  {/*For Android(Dropdown):--*/}
                  {Platform.OS === 'android' ? (
                    <View style={styles.pickerStyle}>
                      <Picker
                        selectedValue={this.state.selectedSeason}
                        mode={'dropdown'}
                        onValueChange={(itemValue, itemIndex) => {
                          this.setState({ selectedSeason: itemValue })
                        }}
                      >
                        {seasonItems}
                      </Picker>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.pickerStyleIOS}
                      onPress={this.handlePress}
                    >
                      <Text style={{ fontSize: 13, color: Constants.SHADOW }}>
                        {this.state.selectedSeason + '  ▼'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View
                    style={{
                      flex: 1,
                      marginVertical: 2,
                      marginHorizontal: 2,
                      paddingHorizontal: 6
                    }}
                  >
                    <FlatList
                      removeClippedSubviews={true}
                      ref={ref => {
                        this.epsFlatList = ref
                      }}
                      vetical={true}
                      scrollnabled={false}
                      alwaysShowVerticalScrollIndicator={false}
                      ItemSeparatorComponent={this.LineRenderer}
                      data={
                        this.state.eps[
                          this.seasonArray.indexOf(this.state.selectedSeason)
                        ]
                      }
                      renderItem={this._renderItemEps}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.pickerStyle,
                    { justifyContent: 'center', marginLeft: 16 }
                  ]}
                  onPress={() =>
                    this.props.navigation.navigate('linksScreen', {
                      other: {
                        isTv: this.props.navigation.getParam('other').isTv
                      },
                      data: this.state.data
                    })
                  }
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Image
                      style={{
                        marginRight: 4,
                        width: 11,
                        height: 11,
                        tintColor: Constants.GREY2
                      }}
                      source={require('../Assets/play_button.png')}
                    />
                    <Text style={{ fontSize: 15, color: Constants.GREY2 }}>
                      {ProgressManager.hasMovieProgress(this.state.data.id) &&
                      !ProgressManager.getMovie(this.state.data.id).completed
                        ? 'Continue'
                        : 'Play Now'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {this.similar != null && this.similar.results.length > 0 ? (
                <View style={{ marginTop: 4 }}>
                  <PosterSliderView
                    data={this.similar}
                    routedNavigator={this.props.navigation}
                    other={{ isTv: this.isTv, replace: true }}
                    title="Similar Titles "
                  />
                </View>
              ) : null}
              {this.recommended != null &&
              this.recommended.results.length > 0 ? (
                <View>
                  <PosterSliderView
                    data={this.recommended}
                    routedNavigator={this.props.navigation}
                    other={{ isTv: this.isTv, replace: true }}
                    title="Recommended "
                  />
                </View>
              ) : null}
            </View>
          </Animated.ScrollView>
        </View>
      )
    }
  }
}

/*
<View style={[styles.mainStyle, {height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center'}]}>
    <Image source={require("../Assets/gifs/loading1.gif")} style={{width: 25, height: 25, tintColor: Constants.TERTIARY, backgroundColor: 'transparent', resizeMode: 'contain'}}/>
</View>*/

/*
<View style={{flex:1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 5}}>
           <Text style={[styles.textStyle, {flex: 1, justifyContent: 'flex-start'}]} numberOfLines={1} ellipsizeMode='tail'>{(this.isTv)?(this.state.data.name):(this.state.data.title)}</Text>
           <TouchableOpacity style={{alignSelf: 'flex-end', padding: 6}}>
               <Image style={{width: 18, height:18}} source={require("../Assets/add.png")}/>
           </TouchableOpacity>
         </View>
         <View style={styles.mainStyle}>
           <View style={{marginHorizontal: 4, marginVertical: 0, flex: 1, flexDirection: 'column'}}>
             <View style={{marginVertical: 3, flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
               <View style={{flexDirection: 'column', justifyContent: 'space-between', marginHorizontal: 2}}>
                 <Text style={{fontSize: 18, color: Constants.PRIMARY}}>Plot</Text>
                 <Text style={{marginLeft: 9, color: Constants.PRIMARY, opacity: 0.8, fontSize: 10, marginTop: 6}}>{(this.isTv)?(this.state.data.first_air_date):(this.state.data.release_date)}</Text>
                 <TouchableOpacity style={[styles.buttonStyle, {marginVertical: 4}]} acitveOpacity={0.9}>
                   <View style={{flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                     <Image style={{padding: 3, width: 9, height:9 }} source={require("../Assets/play_button.png")}/>
                     <Text style={{fontSize: 11, color: Constants.PRIMARY}}> TRAILER </Text>
                   </View>
                 </TouchableOpacity>
               </View>
               <View style={{marginRight: 6}} >
                 <ProgressCircle percent={this.state.data.vote_average*10} radius={20} borderWidth={2} color= {Constants.BLUE} shadowColor={Constants.GREY2} bgColor={Constants.GREY1}>
                   <Text style={{ fontSize: 10, color: Constants.PRIMARY }}>{this.state.data.vote_average}</Text>
                 </ProgressCircle>
               </View>
             </View>
             <Text style={{marginHorizontal: 4, marginTop: 5, color: Constants.PRIMARY, opacity: 0.8, fontSize: 12}} numberOfLines={(!this.state.expanded)?3:undefined}>{this.state.data.overview}</Text>
             <Text style={{color: Constants.BLUE,  marginVertical: 2.5, fontSize: 11, marginRight: 12, alignSelf: 'flex-end'}} onPress={() => {this.setState({expanded: !(this.state.expanded)});}}>{(!this.state.expanded)?"View More":"View Less"}</Text>*/
