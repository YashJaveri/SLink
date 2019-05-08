import React from 'react'
import {
  Text,
  Image,
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  AsyncStorage,
  Switch,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native'

import Constants from '../Constants'
import WatchlistManager from '../Managers/WatchlistManager'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  },
  textStyle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: Platform.OS === 'android' ? '500' : '600',
    //fontFamily: 'Gill_Sans_Nova_Light',
    color: Constants.PRIMARY,
    marginLeft: 4,
    width: 120
  },
  imageStyle: {
    width: 108,
    height: 145,
    overflow: 'hidden',
    borderRadius: 8,
    position: 'absolute'
  }
})

export default class WatchlistScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isTv: true,
      tvList: WatchlistManager.tvWatchlist,
      movieList: WatchlistManager.movieWatchlist
    }
  }

  componentDidMount() {
    this.mounted = true
    this.props.navigation.setParams({ toggle: this.toggle, isTv: true })
    this.props.navigation.addListener('didFocus', () =>
      this.setState({
        tvList: WatchlistManager.tvWatchlist,
        movieList: WatchlistManager.movieWatchlist
      })
    )
    Dimensions.addEventListener(
      'change',
      () => (this.mounted = true ? this.setState({}) : null)
    )
  }

  componentWillUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  toggle = () => {
    this.props.navigation.setParams({ isTv: !this.state.isTv })
    this.setState({ isTv: !this.state.isTv })
  }

  showAlert = async (title, meassage, action, id) => {
    result = await Alert.alert(title, meassage, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          action(id)
          this.setState({
            tvList: WatchlistManager.tvWatchlist,
            movieList: WatchlistManager.movieWatchlist
          })
        }
      }
    ])
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: ' Watchlist ',
      headerLeft: (
        <View style={{ padding: 0, marginLeft: 16 }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image
              style={{ width: 21, height: 22 }}
              source={require('../Assets/menu.png')}
            />
          </TouchableOpacity>
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
                borderWidth: 0.6,
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
                  fontSize: 10,
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
                borderWidth: 0.6,
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
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              >
                {' '}
                TV Show{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={[styles.mainStyle, { justifyContent: 'center' }]}>
        {(this.state.isTv && WatchlistManager.tvWatchlist.length != 0) ||
        (!this.state.isTv && WatchlistManager.movieWatchlist.length != 0) ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            alwaysBounceHorizontal={false}
            style={{
              marginTop: 6,
              margniRight: 1
            }}
            data={this.state.isTv ? this.state.tvList : this.state.movieList}
            columnWrapperStyle={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
            contentContainerStyle={{ justifyContent: 'center' }}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    marginHorizontal: 8,
                    marginVertical: 9
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                      height: styles.imageStyle.height,
                      width: styles.imageStyle.width
                    }}
                    onPress={() => {
                      this.props.navigation.navigate('details', {
                        data: item,
                        other: { isTv: this.state.isTv, replace: false }
                      })
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        width: styles.imageStyle.width
                      }}
                    >
                      <Image
                        style={styles.imageStyle}
                        source={{
                          uri: Constants.IMAGEBASE_URL_342 + item.poster_path
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          this.state.isTv
                            ? this.showAlert(
                                `Remove ${item.name}`,
                                'Are you sure?',
                                WatchlistManager.removeTvShow,
                                item.id
                              )
                            : this.showAlert(
                                `Remove ${item.title}`,
                                'Are you sure?',
                                WatchlistManager.removeMovie,
                                item.id
                              )
                        }}
                        style={{
                          width: 17,
                          height: 17,
                          alignSelf: 'flex-end',
                          margin: 3,
                          marginRight: 10
                        }}
                      >
                        <Image
                          source={require('../Assets/minus.png')}
                          style={{ width: 17, height: 17, margin: 4 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.textStyle} numberOfLines={1}>
                    {this.state.isTv ? item.name : item.title}
                  </Text>
                </View>
              )
            }}
            numColumns={Math.round(Constants.WINDOW_WIDTH / 118)}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <Text
            style={{
              margin: 14,
              fontSize: 16,
              color: Constants.TERTIARY,
              alignSelf: 'center'
            }}
          >
            Watchlist empty
          </Text>
        )}
      </View>
    )
  }
}

/*
<View style={{margin: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
  <Text style={{color: Constants.PRIMARY, fontSize: 10}}>Movie</Text>
    <Switch
      thumbColor={Constants.TERTIARY}
      trackColor={{false: Constants.GREY2, true: Constants.GREY2}}
      ios_backgroundColor={Constants.GREY2}
      style={{ transform: [{ scaleX: .65 }, { scaleY: .65 }] }}
      onValueChange={navigation.getParam('toggle')}
      value={navigation.getParam('isTv', false)}/>
  <Text style={{color: Constants.PRIMARY, fontSize: 10}} onPress={() => (this.props.navigation.navigate("expanded"))}>TV</Text>
</View>
*/
