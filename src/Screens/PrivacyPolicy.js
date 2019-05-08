import React from 'react'
import {
  WebView,
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Dimensions,
  Text
} from 'react-native'
import Constants from '../Constants'

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  }
})

export default class PrivacyPolicy extends React.Component {
  constructor(props) {
    super(props)
    this.privacyHtml = {}
    this.state = {
      loading: true
    }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <Text
          style={{ fontSize: 18, color: Constants.PRIMARY, fontWeight: 'bold' }}
        >
          Privacy Policy{' '}
        </Text>
      ),
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

  getHtml = async () => {
    response = await fetch(
      'https://www.dropbox.com/s/gamzdnyt9xl50mj/privacy_policy.html?dl=1'
    )
    this.privacyHtml = response._bodyText
    //console.log(this.privacyHtml);
    this.setState({ loading: false })
  }

  componentDidMount() {
    this.getHtml()
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
    } else {
      return <WebView source={{ html: this.privacyHtml.toString() }} />
    }
  }
}
