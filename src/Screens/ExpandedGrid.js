import React from 'react'
import {
  Text,
  Image,
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native'

import Constants from '../Constants'
import Calls from '../Calls'
import MainScreen from './MainScreen'
import PosterItemSmall from '../Components/PosterItemSmall'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  }
})

export default class ExpandedGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      loading: true,
      results: []
    }
  }

  componentDidMount() {
    this.mounted = true
    this.setState({
      page: 1,
      results: this.props.navigation.getParam('data', {}).results
    })
    Dimensions.addEventListener(
      'change',
      () => (this.mounted ? this.setState({}) : null)
    )
  }
  componentUnmount() {
    this.mounted = false
    Dimensions.removeEventListener('change')
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', 'SLink') + ' '
    }
  }

  appendNextPage = async () => {
    if (
      this.state.page !== this.props.navigation.getParam('data', {}).total_pages
    ) {
      this.state.page = this.state.page + 1
      json = await Calls.getUnknown(
        this.props.navigation.getParam('title', 'Most Popular'),
        this.props.navigation.getParam('other', {}),
        this.state.page,
        'us'
      )
      this.mounted
        ? this.setState({ results: [...this.state.results, ...json.results] })
        : null
    }
  }

  renderFooter = () => {
    if (this.state.loading) {
      return (
        <View
          style={{
            paddingVertical: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Image
            style={{ width: 50, height: 50, tintColor: Constants.TERTIARY }}
            source={require('../Assets/spinner.gif')}
            resizeMode="contain"
          />
        </View>
      )
    } else return null
  }

  render() {
    return (
      <View style={styles.mainStyle}>
        <FlatList
          key={Dimensions.get('screen').width.toString()}
          showsVerticalScrollIndicator={false}
          alwaysBounceHorizontal={false}
          style={{
            marginTop: 6,
            margniRight: 1
          }}
          data={this.state.results}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          contentContainerStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <PosterItemSmall
              data={item}
              other={this.props.navigation.getParam('other', {})}
              routedNavigator={this.props.navigation}
            />
          )}
          numColumns={Math.round(Dimensions.get('screen').width / 118)}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={() => {
            if (
              this.state.page !==
              this.props.navigation.getParam('data', {}).total_pages
            )
              return this.renderFooter()
            else return <View />
          }}
          onEndReached={this.appendNextPage}
        />
      </View>
    )
  }
}
