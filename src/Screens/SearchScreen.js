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
  Dimensions
} from 'react-native'

import Constants from '../Constants'
import Calls from '../Calls'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  },
  textInputStyle: {
    height: 28,
    padding: 4,
    marginVertical: 6,
    borderRadius: 6,
    borderWidth: 0.9,
    borderColor: Constants.LIGHTGREY
  },
  textStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Constants.PRIMARY,
    marginVertical: 4,
    marginHorizontal: 6
  },
  searchItemStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 2
  }
})

export default class SearchScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isTv: true,
      searchedTvs: {},
      searchedMovies: {},
      isLoading: false
    }
  }
  componentDidMount() {
    this.mounted = true
    this.props.navigation.setParams({
      onSearch: this.onSearch,
      toggle: this.toggle,
      isTv: true,
      width: Dimensions.get('screen').width,
      height: Dimensions.get('screen').height
    })
    Dimensions.addEventListener('change', () => {
      this.mounted ? this.setState({}) : null
      this.props.navigation.setParams({
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height
      })
    })
  }

  componentWillUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  onSearch = text => {
    if (text !== '') {
      clearTimeout()
      setTimeout(async () => {
        this.mounted ? this.setState({ isLoading: true }) : null
        tvJson = await Calls.searchTvShow(text)
        movieJson = await Calls.searchMovie(text)
        if (tvJson !== undefined || movieJson !== undefined)
          this.mounted
            ? this.setState({
                searchedTvs: tvJson,
                searchedMovies: movieJson,
                isLoading: false
              })
            : null
      }, 500)
    }
  }

  toggle = () => {
    this.props.navigation.setParams({ isTv: !this.state.isTv })
    this.mounted ? this.setState({ isTv: !this.state.isTv }) : null
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <View style={{ paddingRight: Platform.OS === 'ios' ? 56 : 0 }}>
          <TextInput
            style={[
              styles.textInputStyle,
              {
                width: navigation.getParam('width') / 1.75,
                color:
                  navigation.getParam('width') < navigation.getParam('height')
                    ? Constants.PRIMARY
                    : Constants.GREY2
              }
            ]}
            selectionColor={Constants.TERTIARY}
            onChangeText={navigation.getParam('onSearch', () => {})}
            autoFocus={true}
          />
        </View>
      ),
      headerRight: (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginRight: 8
          }}
        >
          <TouchableOpacity
            onPress={
              navigation.getParam('isTv', false)
                ? navigation.getParam('toggle')
                : null
            }
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: !navigation.getParam('isTv', false)
                  ? Constants.TERTIARY
                  : null,
                borderColor: Constants.PRIMARY,
                borderWidth: 0.7,
                borderRightWidth: 0,
                borderBottomLeftRadius: 4,
                borderTopLeftRadius: 4,
                paddingHorizontal: 4,
                paddingVertical: 6
              }}
            >
              <Text
                style={{
                  color: Constants.PRIMARY,
                  fontSize: 9,
                  fontWeight: 'bold'
                }}
              >
                {' '}
                Movie{' '}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              !navigation.getParam('isTv', false)
                ? navigation.getParam('toggle')
                : null
            }
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: navigation.getParam('isTv', false)
                  ? Constants.TERTIARY
                  : null,
                borderColor: Constants.PRIMARY,
                borderWidth: 0.7,
                borderLeftWidth: 0,
                borderBottomRightRadius: 4,
                borderTopRightRadius: 4,
                padding: 2,
                paddingVertical: 6
              }}
            >
              <Text
                style={{
                  color: Constants.PRIMARY,
                  fontSize: 9,
                  fontWeight: 'bold'
                }}
              >
                {' '}
                TV Show{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        backgroundColor: Constants.GREY1,
        borderBottomWidth: 0,
        borderRadius: 0.5,
        elevation: 0
      },
      headerBackTitle: null,
      headerTintColor: Constants.PRIMARY
    }
  }

  LineRenderer = () => (
    <View
      style={{ height: 0.6, backgroundColor: Constants.PRIMARY, opacity: 0.2 }}
    />
  )

  _renderItemTv = ({ item }) => {
    if (item.poster_path != null && item.backdrop_path != null) {
      return (
        <View style={{ flexDirection: 'column' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              this.props.navigation.navigate('details', {
                data: item,
                other: { reaplce: false, isTv: true }
              })
            }
          >
            <View style={styles.searchItemStyle}>
              <Image
                resizeMethod="resize"
                style={{
                  height: 50,
                  width: 43,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 2,
                  overflow: 'hidden',
                  paddingVertical: 1
                }}
                source={{ uri: Constants.IMAGEBASE_URL + item.poster_path }}
              />
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
                    marginVertical: 1
                  }}
                >
                  <Text
                    style={{ fontSize: 12, color: Constants.PRIMARY }}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  <View style={{ flex: 1 }} />
                </View>
                <Text
                  style={{
                    fontSize: 8,
                    color: Constants.PRIMARY,
                    opacity: 0.8,
                    padding: 1.5
                  }}
                  numberOfLines={2}
                >
                  {item.overview === '' ? 'SLink !) ' : item.overview + ' '}
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
                    style={{
                      fontSize: 9,
                      color: Constants.PRIMARY,
                      padding: 1.5
                    }}
                    numberOfLines={1}
                  >
                    {item.first_air_date}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <this.LineRenderer />
        </View>
      )
    }
  }
  _renderItemMovie = ({ item }) => {
    if (item.poster_path != null && item.backdrop_path != null) {
      return (
        <View style={{ flexDirection: 'column' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              this.props.navigation.navigate('details', {
                data: item,
                other: { reaplce: false, isTv: false }
              })
            }
          >
            <View style={styles.searchItemStyle}>
              <Image
                style={{
                  height: 50,
                  width: 43,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
                source={{ uri: Constants.IMAGEBASE_URL + item.poster_path }}
              />
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
                    marginVertical: 1
                  }}
                >
                  <Text
                    style={{ fontSize: 12, color: Constants.PRIMARY }}
                    numberOfLines={2}
                  >
                    {item.title + ' '}
                  </Text>
                  <View style={{ flex: 1 }} />
                </View>
                <Text
                  style={{
                    fontSize: 8,
                    color: Constants.PRIMARY,
                    opacity: 0.8,
                    padding: 1.5
                  }}
                  numberOfLines={2}
                >
                  {item.overview === '' ? 'SLink !)' : item.overview}
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
                    style={{
                      fontSize: 9,
                      color: Constants.PRIMARY,
                      padding: 1.5
                    }}
                    numberOfLines={1}
                  >
                    {item.release_date}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <this.LineRenderer />
        </View>
      )
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View
          style={[
            styles.mainStyle,
            {
              height: Constants.WINDOW_HEIGHT,
              justifyContent: 'flex-start',
              alignItems: 'center'
            }
          ]}
        >
          <Image
            style={{ width: 50, height: 50, tintColor: Constants.TERTIARY }}
            source={require('../Assets/spinner.gif')}
            resizeMode="contain"
          />
        </View>
      )
    } else {
      if (this.state.searchedTvs != null && this.state.searchedMovies != null) {
        return (
          <View style={[styles.mainStyle, { flexDirection: 'column' }]}>
            <ScrollView showsVerticalScrollIndicator={false} vertical={true}>
              {this.state.searchedTvs.results !== undefined &&
              this.state.isTv ? (
                <View
                  style={{ flex: 1, flexDirection: 'column', marginTop: 2 }}
                >
                  <Text style={[styles.textStyle, { alignSelf: 'center' }]}>
                    TV SHOWS{' '}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      marginVertical: 2,
                      marginHorizontal: 2,
                      paddingHorizontal: 6
                    }}
                  >
                    <FlatList
                      vertical={true}
                      scrollEnabled={false}
                      alwaysShowVerticalScrollIndicator={false}
                      data={this.state.searchedTvs.results}
                      renderItem={this._renderItemTv}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </View>
                </View>
              ) : (
                <View />
              )}
              {this.state.searchedMovies.results !== undefined &&
              !this.state.isTv ? (
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <Text style={[styles.textStyle, { alignSelf: 'center' }]}>
                    MOVIES{' '}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      marginVertical: 2,
                      marginHorizontal: 2,
                      paddingHorizontal: 6
                    }}
                  >
                    <FlatList
                      vetical={true}
                      scrollEnabled={false}
                      alwaysShowVerticalScrollIndicator={false}
                      data={this.state.searchedMovies.results}
                      renderItem={this._renderItemMovie}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </View>
                </View>
              ) : (
                <View />
              )}
            </ScrollView>
          </View>
        )
      } else {
        return <View style={styles.mainStyle} />
      }
    }
  }
}
