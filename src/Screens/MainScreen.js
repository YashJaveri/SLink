import React from 'react'
import {
  Text,
  Image,
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Switch,
  Platform,
  TouchableOpacity,
  Dimensions,
  NetInfo,
  Alert,
  StatusBar
} from 'react-native'
import Carousel from 'react-native-snap-carousel'

import Constants from '../Constants'
import Calls from '../Calls'
import SnapItem from '../Components/SnapItem'
import PosterSliderView from '../Components/PosterSliderView'
import PosterItem from '../Components/PosterItem'
import ProgressManager from '../Managers/ProgressManager'
import SplashScreen from './SplashScreen'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  },
  textStyle: {
    fontSize: 18,
    color: Constants.PRIMARY
  }
})

class MainComp extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Carousel
            layout={'default'}
            data={
              this.props.other.isTv
                ? MainScreen.data.trailerTvShows
                : MainScreen.data.trailerMovies
            }
            hasParallaxImages={true}
            sliderWidth={Dimensions.get('window').width}
            itemWidth={170 + 8 * 2}
            itemHeight={200}
            enableMomentum={true}
            firstItem={Math.round(
              (this.props.other.isTv
                ? MainScreen.data.trailerTvShows.length
                : MainScreen.data.trailerMovies.length) / 2
            )}
            renderItem={({ item }) => {
              return (
                <SnapItem
                  data={item}
                  other={{ isTv: this.props.other.isTv, replace: false }}
                />
              )
            }}
          />
        </View>
        <View
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}
        >
          <Text
            style={[styles.textStyle, { fontWeight: 'bold', marginTop: 6 }]}
          >
            {' '}
            Trailers{' '}
          </Text>
        </View>
        <View
          style={{
            flex: 2,
            marginTop: 9,
            marginBottom: 6,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start'
          }}
        >
          <PosterSliderView
            data={
              this.props.other.isTv
                ? MainScreen.data.trendingTvShows
                : MainScreen.data.trendingMovies
            }
            title="Trending"
            other={{ isTv: this.props.other.isTv, replace: false }}
            routedNavigator={this.props.routedNavigator}
          />
          <PosterSliderView
            data={
              this.props.other.isTv
                ? MainScreen.data.popularTvShows
                : MainScreen.data.popularMovies
            }
            title="Most Popular"
            other={{ isTv: this.props.other.isTv, replace: false }}
            routedNavigator={this.props.routedNavigator}
          />
          {this.props.other.isTv ? (
            <PosterSliderView
              data={MainScreen.data.onAir}
              other={{ isTv: true, replace: false }}
              title="On Air"
              routedNavigator={this.props.routedNavigator}
            />
          ) : null}
          <PosterSliderView
            data={
              this.props.other.isTv
                ? MainScreen.data.topRatedTvShows
                : MainScreen.data.topRatedMovies
            }
            title="Top Rated"
            other={{ isTv: this.props.other.isTv, replace: false }}
            routedNavigator={this.props.routedNavigator}
          />

          {(this.props.other.isTv && ProgressManager.progressTv.length !== 0) ||
          (!this.props.other.isTv &&
            ProgressManager.progressMovie.length !== 0) ? (
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  color: Constants.PRIMARY,
                  marginLeft: 18
                }}
              >
                Recently Watched
              </Text>
              <FlatList
                horizontal={true}
                removeClippedSubviews={true}
                showsHorizontalScrollIndicator={false}
                alwaysBounceHorizontal={false}
                contentContainerStyle={{ marginLeft: 22 }}
                data={
                  this.props.other.isTv
                    ? ProgressManager.progressTv
                    : ProgressManager.progressMovie
                }
                renderItem={({ item }, index) => {
                  if (
                    item.data.poster_path != null &&
                    item.data.poster_path != ''
                  )
                    return (
                      <PosterItem
                        data={item.data}
                        other={this.props.other}
                        routedNavigator={this.props.routedNavigator}
                      />
                    )
                }}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          ) : null}
        </View>
      </View>
    )
  }
}

export default class MainScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isTv: true,
      loading: false
    }
  }

  //Data
  static data = {
    //Trailers:-
    trailerMovies: {},
    trailerTvShows: {},
    //Movies
    popularMovies: {},
    trendingMovies: {},
    topRatedMovies: {},
    //TV Shows:-
    popularTvShows: {},
    trendingTvShows: {},
    topRatedTvShows: {},
    onAir: {}
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Image
            style={{ width: 65, height: 65, paddingTop: 10 }}
            source={require('../Assets/SLink.png')}
          />
        </View>
      ),
      headerLeft: (
        <View style={{ padding: 0, marginLeft: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Image
              style={{ width: 21, height: 22 }}
              source={require('../Assets/menu.png')}
            />
          </TouchableOpacity>
        </View>
      ),
      headerRight: (
        <View
          style={{ marginRight: 16 }}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <TouchableOpacity
            onPress={() => {
              NetInfo.isConnected.fetch().then(async isConnected => {
                if (isConnected) navigation.navigate('search')
                else
                  Alert.alert(
                    'No internet connection!',
                    'Connect to internet and retry'
                  )
              })
            }}
          >
            <Image
              style={{ width: 17, height: 17 }}
              source={require('../Assets/search.png')}
            />
          </TouchableOpacity>
        </View>
      )
    }
  }

  componentDidMount() {
    this.mounted = true
    this.props.navigation.addListener('didFocus', () => {
      StatusBar.setHidden(false)
      this.setState({})
    })
    Dimensions.addEventListener(
      'change',
      () => (this.mounted ? this.setState({}) : null)
    )
  }
  componentWillUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  render() {
    if (this.state.loading) {
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
    } else if (
      MainScreen.data.topRatedMovies.results == undefined ||
      MainScreen.data.topRatedMovies.results.length <= 0
    ) {
      return (
        <View
          style={[
            styles.mainStyle,
            { justifyContent: 'center', alignItems: 'center' }
          ]}
        >
          <View
            style={{
              width: Dimensions.get('screen').width / 1.15,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: Constants.TERTIARY,
                margin: 10
              }}
            >
              Something went wrong check your internet connection and Retry. Or
              go to downloads for offline data.
            </Text>
            <TouchableOpacity
              style={{
                width: 150,
                height: 30,
                backgroundColor: Constants.PRIMARY,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => {
                NetInfo.isConnected.fetch().then(async isConnected => {
                  if (isConnected) {
                    this.mounted ? this.setState({ loading: true }) : null
                    SplashScreen.fetchData().then(
                      () =>
                        this.mounted ? this.setState({ loading: false }) : null
                    )
                  }
                })
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: Constants.GREY2,
                  margin: 4
                }}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.mainStyle}>
          <ScrollView
            style={[styles.mainStyle, { marginBottom: 0 }]}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginRight: 10,
                alignSelf: 'flex-end',
                marginTop: 6
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.state.isTv && this.mounted
                    ? this.setState({ isTv: !this.state.isTv })
                    : null
                }}
              >
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: !this.state.isTv
                      ? Constants.TERTIARY
                      : null,
                    borderColor: Constants.PRIMARY,
                    borderWidth: 0.7,
                    borderRightWidth: 0,
                    borderBottomLeftRadius: 4,
                    borderTopLeftRadius: 4,
                    paddingHorizontal: 5,
                    paddingVertical: 4
                  }}
                >
                  <Text
                    style={{
                      color: Constants.PRIMARY,
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}
                  >
                    {' '}
                    Movie{' '}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  !this.state.isTv && this.mounted
                    ? this.setState({ isTv: !this.state.isTv })
                    : null
                }}
              >
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: this.state.isTv
                      ? Constants.TERTIARY
                      : null,
                    borderColor: Constants.PRIMARY,
                    borderWidth: 0.7,
                    borderLeftWidth: 0,
                    borderBottomRightRadius: 4,
                    borderTopRightRadius: 4,
                    paddingHorizontal: 2,
                    paddingVertical: 4
                  }}
                >
                  <Text
                    style={{
                      color: Constants.PRIMARY,
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}
                  >
                    {' '}
                    TV Show{' '}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <MainComp
              other={{ isTv: this.state.isTv, replace: false }}
              routedNavigator={this.props.navigation}
            />
          </ScrollView>
        </View>
      )
    }
  }
}

/*
<Text style={{margin: 2, color: Constants.PRIMARY, fontSize: 12}} onPress={() => (this.props.navigation.navigate("expanded"))}>Movies</Text>
<Switch
  thumbColor={Constants.TERTIARY}
  trackColor={{false: Constants.GREY2, true: Constants.GREY2}}
  ios_backgroundColor={Constants.GREY2}
  style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
  onValueChange={(val) => {this.setState({isTv:val, isLoading: true}, () => this.setState({isLoading: false}));}}
  value={this.state.isTv}/>
  <Text style={{margin: 2, color: Constants.PRIMARY, fontSize: 12}}>TV Shows</Text>
*/
