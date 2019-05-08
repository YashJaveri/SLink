import { AsyncStorage, Platform, Alert, ToastAndroid } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'

import WatchlistManager from './WatchlistManager'
import ProgressManager from './ProgressManager'
import { DownloadManager } from './DownloadManager'
import Constants from '../Constants'

const android = Platform.OS === 'android' ? RNFetchBlob.android : null

export default class SettingsManager {
  static wifiOnly = false
  static paralProc = true
  static subtitleLanguage = 'eng'
  static hdOnly = false
  static FILE_PATH = Platform.OS === 'android'
    ? RNFetchBlob.fs.dirs.DownloadDir + '/SLink_v3'
    : RNFetchBlob.fs.dirs.DocumentDir + '/SLink_v3'

  static async init() {
    try {
      let wO = await AsyncStorage.getItem('WifiOnly')
      let pP = await AsyncStorage.getItem('ParalProc')
      let sL = await AsyncStorage.getItem('SubtitleLang')
      let hO = await AsyncStorage.getItem('HDOnly')

      if (wO != undefined) {
        try {
          SettingsManager.wifiOnly = JSON.parse(wO)
        } catch (e) {
          SettingsManager.wifiOnly = true
        }
      }
      if (pP != undefined) {
        try {
          SettingsManager.paralProc = JSON.parse(pP)
        } catch (e) {
          SettingsManager.paralProc = true
        }
      }
      if (sL != undefined) {
        try {
          SettingsManager.subtitleLanguage = JSON.parse(sL)
        } catch (e) {
          SettingsManager.subtitleLanguage = 'English'
        }
      }
      if (sL != undefined) {
        try {
          SettingsManager.hdOnly = JSON.parse(hO)
        } catch (e) {
          SettingsManager.hdOnly = false
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  static clearCache() {
    WatchlistManager.clearWatchlist()
    ProgressManager.clearProgress()
  }
  static clearDownloads() {
    console.log('Cleaered Downloads')
    DownloadManager.clearDownloads()
  }

  static setParalProc(val) {
    SettingsManager.paralProc = val
    return AsyncStorage.setItem(
      'ParalProc',
      JSON.stringify(SettingsManager.paralProc)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }
  static setWifiOnly(val) {
    SettingsManager.wifiOnly = val
    return AsyncStorage.setItem(
      'WifiOnly',
      JSON.stringify(SettingsManager.wifiOnly)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }
  static setSubLang(val) {
    SettingsManager.subtitleLanguage = val
    return AsyncStorage.setItem(
      'SubtitleLang',
      JSON.stringify(SettingsManager.subtitleLanguage)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }
  static setHdLinks(val) {
    SettingsManager.hdOnly = val
    return AsyncStorage.setItem(
      'HDOnly',
      JSON.stringify(SettingsManager.hdOnly)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }

  static async checkForUpdates(fromSettings) {
    let mjsonPackage = require('../../package.json')
    let currentBuilVersion = mjsonPackage.build
    let versionCheckResponse = await fetch(Constants.UPDATE_CHECK_URL).catch(
      e => console.log(e)
    )
    var jsonResp = await versionCheckResponse.json()
    if (jsonResp.build > currentBuilVersion) {
      jsonResp.required
        ? Alert.alert('Update available', 'Would you like to download?', [
            {
              text: 'Yes',
              onPress: () => {
                ToastAndroid.show('Download started', ToastAndroid.LONG)
                RNFetchBlob.config({
                  addAndroidDownloads: {
                    useDownloadManager: true,
                    title: `SLink_${jsonResp.version}`,
                    description: 'SLink will be installed',
                    mime: 'application/vnd.android.package-archive',
                    mediaScannable: true,
                    notification: true,
                    overwrite: true,
                    path:
                      RNFetchBlob.fs.dirs.DownloadDir +
                      `/SLink_v3/SLink_${jsonResp.version}.apk`
                  }
                })
                  .fetch('GET', 'https://tinyurl.com/jyt-SLink-v3')
                  .then(res => {
                    console.log(res)
                    android.actionViewIntent(
                      res.path(),
                      'application/vnd.android.package-archive'
                    )
                  })
                  .catch(e => {
                    console.log(e)
                    ToastAndroid.show(
                      'Something went wrong, failed to update',
                      ToastAndroid.LONG
                    )
                  })
              }
            }
          ])
        : Alert.alert('Update available', 'Would you like to download?', [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              onPress: () => {
                ToastAndroid.show('Download started', ToastAndroid.LONG)
                RNFetchBlob.config({
                  addAndroidDownloads: {
                    useDownloadManager: true,
                    title: `SLink_${jsonResp.version}`,
                    description: 'SLink will be installed',
                    mime: 'application/vnd.android.package-archive',
                    mediaScannable: true,
                    notification: true,
                    overwrite: true,
                    path:
                      RNFetchBlob.fs.dirs.DownloadDir +
                      `/SLink_v3/SLink_${jsonResp.version}.apk`
                  }
                })
                  .fetch('GET', 'https://tinyurl.com/jyt-SLink-v3')
                  .then(res => {
                    console.log(res)
                    android.actionViewIntent(
                      res.path(),
                      'application/vnd.android.package-archive'
                    )
                  })
                  .catch(e => {
                    console.log(e)
                    ToastAndroid.show(
                      'Something went wrong, failed to update',
                      ToastAndroid.LONG
                    )
                  })
              }
            }
          ])
    } else if (fromSettings) ToastAndroid.show('Up to date', ToastAndroid.LONG)
  }
}
