import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActionSheetIOS,
  Picker,
  Platform,
  Alert,
  ToastAndroid
} from 'react-native'

import Constants from '../Constants'
import SettingsManager from '../Managers/SettingsManager'
import SubLangList from '../../languages'

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: Constants.GREY2
  },
  mainStyle: {
    flex: 1,
    backgroundColor: Constants.GREY1
  },
  textStyle: {
    fontSize: 15,
    color: Constants.PRIMARY
  },
  pickerStyle: {
    width: 120,
    height: 32,
    backgroundColor: Constants.PRIMARY,
    justifyContent: 'center'
  },
  pickerStyleIOS: {
    width: 100,
    height: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  }
})

const SettingsItem = props => (
  <TouchableOpacity
    onPress={props.onPress}
    style={{
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginHorizontal: 8,
      marginVertical: props.spec ? 1 : 8
    }}
    activeOpacity={0.6}
  >
    <Text
      style={
        !props.spec
          ? { color: Constants.PRIMARY, fontSize: 16 }
          : { color: Constants.TERTIARY, fontSize: 15 }
      }
    >
      {props.text}
    </Text>
    <View style={{ flex: 1 }} />
    <Image style={{ margin: 6, width: 17, height: 17 }} source={props.icon} />
  </TouchableOpacity>
)

export default class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.languagesIOS = []
    this.langIdIOS = []
    SubLangList.subLangList.forEach(item => {
      this.languagesIOS.push(item.lang)
      this.langIdIOS.push(item.SubLanguageID)
    })

    this.state = {
      selectedLanguageId: SettingsManager.subtitleLanguage,
      wifiOnly: SettingsManager.wifiOnly,
      paralProc: SettingsManager.paralProc,
      hdLinksOnly: SettingsManager.hdOnly
    }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <Text
          style={{ fontSize: 18, color: Constants.PRIMARY, fontWeight: 'bold' }}
        >
          Settings{' '}
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

  handlePress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Select Language',
        options: [...this.languagesIOS, 'Cancel'],
        cancelButtonIndex: this.languagesIOS.length
      },
      index => {
        if (index < this.languagesIOS.length)
          this.setState({ selectedLanguageId: this.langIdIOS[index] }, () =>
            SettingsManager.setSubLang(this.state.selectedLanguageId)
          )
      }
    )
  }

  showAlert = (title, meassage, action, afterToast) => {
    Alert.alert(title, meassage, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          action()
          Platform.OS === 'android'
            ? ToastAndroid.show(afterToast, ToastAndroid.SHORT)
            : null
        }
      }
    ])
  }

  render() {
    let languageItems = SubLangList.subLangList.map((s, i) => {
      return <Picker.Item key={i} value={s.SubLanguageID} label={s.lang} />
    })

    return (
      <ScrollView vertical={true} style={[styles.mainStyle, { paddingTop: 2 }]}>
        <TouchableOpacity
          onPress={() => {
            this.setState({ wifiOnly: !SettingsManager.wifiOnly }, () =>
              SettingsManager.setWifiOnly(this.state.wifiOnly)
            )
          }}
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginHorizontal: 8,
            marginVertical: 2
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: Constants.PRIMARY, fontSize: 16 }}>
            Stream using Wifi only{' '}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => {
              this.setState({ wifiOnly: !SettingsManager.wifiOnly }, () =>
                SettingsManager.setWifiOnly(this.state.wifiOnly)
              )
            }}
          >
            <Image
              style={{
                margin: 6,
                width: 21,
                height: 21,
                tintColor: this.state.wifiOnly
                  ? Constants.TERTIARY
                  : Constants.PRIMARY
              }}
              source={require('../Assets/wifi.png')}
            />
          </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.setState({ paralProc: !SettingsManager.paralProc }, () =>
              SettingsManager.setParalProc(this.state.paralProc)
            )
          }}
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginHorizontal: 8,
            marginVertical: 2
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: Constants.PRIMARY, fontSize: 16 }}>
            Parallel Processing
          </Text>
          <Text style={{ color: Constants.PRIMARY, fontSize: 13 }}>
            {' '}
            [CPU Itensive]{' '}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => {
              this.setState({ paralProc: !SettingsManager.paralProc }, () =>
                SettingsManager.setParalProc(this.state.paralProc)
              )
            }}
          >
            <Image
              style={{
                margin: 6,
                width: 21,
                height: 21,
                tintColor: this.state.paralProc
                  ? Constants.TERTIARY
                  : Constants.PRIMARY
              }}
              source={require('../Assets/parallel.png')}
            />
          </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.setState({ hdLinksOnly: !SettingsManager.hdOnly }, () =>
              SettingsManager.setHdLinks(this.state.hdLinksOnly)
            )
          }}
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginHorizontal: 8,
            marginVertical: 1
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: Constants.PRIMARY, fontSize: 16 }}>
            HD Links Only{' '}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => {
              this.setState({ hdLinksOnly: !SettingsManager.hdOnly }, () =>
                SettingsManager.setHdLinks(this.state.hdLinksOnly)
              )
            }}
          >
            <Text
              style={{
                margin: 6,
                fontSize: 21,
                fontWeight: 'bold',
                color: this.state.hdLinksOnly
                  ? Constants.TERTIARY
                  : Constants.PRIMARY
              }}
            >
              {' '}
              HD{' '}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
        <SettingsItem
          spec={false}
          icon={require('../Assets/refresh.png')}
          text="Check for updates"
          onPress={() => SettingsManager.checkForUpdates(true)}
        />

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginVertical: 3,
            marginHorizontal: 8
          }}
        >
          <Text style={{ color: Constants.PRIMARY, fontSize: 16 }}>
            Subtitle language{' '}
          </Text>
          <View style={{ flex: 1 }} />
          {Platform.OS === 'android' ? (
            <View style={styles.pickerStyle}>
              <Picker
                selectedValue={this.state.selectedLanguageId}
                mode={'dropdown'}
                onValueChange={(itemValue, itemIndex) => {
                  this.setState({ selectedLanguageId: itemValue }, () =>
                    SettingsManager.setSubLang(itemValue)
                  )
                }}
              >
                {languageItems}
              </Picker>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pickerStyleIOS}
              onPress={this.handlePress}
            >
              <Text style={{ fontSize: 16, color: Constants.PRIMARY }}>
                {this.state.selectedLanguageId + '  ▼'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={{
            alignSelf: 'center',
            color: Constants.PRIMARY,
            fontSize: 14,
            marginTop: 16
          }}
        >
          Clear Stuff :\
        </Text>
        <SettingsItem
          spec={true}
          text="Clear downloads"
          onPress={() => {
            this.showAlert(
              'Clear Downloads',
              'This will clear all your downloads. Are you sure you want to clear?',
              SettingsManager.clearDownloads,
              'Downloads cleared'
            )
          }}
        />
        <SettingsItem
          spec={true}
          text="Clear cache"
          onPress={() => {
            this.showAlert(
              'Clear Cache',
              'This will clear watchlist and watch progress. Are you sure you want to clear?',
              SettingsManager.clearCache,
              'Cache cleared'
            )
          }}
        />
      </ScrollView>
    )
  }
}
