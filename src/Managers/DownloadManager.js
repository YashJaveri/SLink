import RNBackgroundDownloader from 'react-native-background-downloader'
import { AsyncStorage, PermissionsAndroid, Alert, Platform } from 'react-native'
import DownloadTask from 'react-native-background-downloader/lib/downloadTask'
import firebase from 'react-native-firebase'

import Constants from '../Constants'
import { getSizeString } from '../getSize'
import RNFetchBlob from 'rn-fetch-blob'
import SettingsManager from './SettingsManager'

export class DownloadProcess {
  constructor(
    url: String,
    id: Number,
    isTv: Boolean,
    title: String,
    filePath: String,
    resolution: String = undefined,
    season: Number = undefined,
    episode: Number = undefined,
    state: String = DownloadManager.downloadStates.PENDING,
    subtitleJson = [],
    pid: String
  ) {
    this.url = url
    this.pid = pid
    this.id = id
    this.title = title
    this.isTv = isTv
    this.season = season
    this.episode = episode
    this.filePath = filePath
    this.resolution = resolution
    this.percent = 0
    this.total = 0
    this.read = 0
    this.state = state
    this.subtitleJson = subtitleJson
    this.begin = expectedBytes => {}
    this.progress = (percent, bytesread, totalBytes) => {}
    this.done = () => {}
    this.error = e => {}
  }

  static fromJson(jsonObject) {
    return new DownloadProcess(
      jsonObject.url,
      jsonObject.id,
      jsonObject.isTv,
      jsonObject.title,
      jsonObject.filePath,
      jsonObject.resolution,
      jsonObject.season,
      jsonObject.episode,
      jsonObject.state,
      jsonObject.subtitleJson,
      jsonObject.pid
    )
  }
  getJson() {
    return {
      url: this.url,
      pid: this.pid,
      id: this.id,
      title: this.title,
      isTv: this.isTv,
      season: this.season,
      episode: this.episode,
      filePath: this.filePath,
      state: this.state,
      subtitleJson: this.subtitleJson,
      resolution: this.resolution
    }
  }

  setTask(task: DownloadTaskprogress) {
    this.task = task
    //console.log(this.task);
    this.state = this.task.state
  }
  saveTask() {
    this.state = this.task.state
    AsyncStorage.setItem(this.pid, JSON.stringify(this.getJson()))
  }

  onBegin = expectedBytes => {
    //console.log(expectedBytes);
    this.saveTask()
    this.begin(expectedBytes)
  }
  onProgress = (percent, bytesread, totalBytes) => {
    this.percent = percent
    //console.log(percent);
    this.read = getSizeString(bytesread)
    this.total = getSizeString(totalBytes)
    this.progress(percent, bytesread, totalBytes)
  }
  onDone = () => {
    this.saveTask()
    this.done()
  }
  onError = e => {
    this.saveTask()
    this.error(e)
    console.log(e)
    this.saveTask()
    /*RNFetchBlob.fs
       .exists(this.filePath)
       .then(yes => {
          yes?RNFetchBlob.fs.unlink(this.filePath).catch(e => console.log(e)):null;
       })
       .catch(e => console.log(e));*/
  }

  stop = () => {
    if (this.task != undefined) this.task.stop()
    AsyncStorage.removeItem(this.pid).catch(e => console.log(e))
    DownloadManager.remove(this.pid)
    RNFetchBlob.fs
      .exists(this.filePath)
      .then(yes => {
        yes
          ? RNFetchBlob.fs.unlink(this.filePath).catch(e => console.log(e))
          : null
      })
      .catch(e => console.log(e))
  }
}

export class DownloadManager {
  static downloadStates = {
    DONE: 'DONE',
    FAILED: 'FAILED',
    STOPPED: 'STOPPED',
    PAUSED: 'PAUSED',
    DOWNLOADING: 'DOWNLOADING',
    PENDING: 'PENDING'
  }
  static downloads: DownloadProcess[] = [] //array of download processes
  static download_pids: String[] = []

  static async init() {
    try {
      DownloadManager.download_pids = JSON.parse(
        await AsyncStorage.getItem('Download_pids')
      )

      if (
        DownloadManager.download_pids != undefined &&
        DownloadManager.download_pids.length > 0
      ) {
        var backgroundTask = await RNBackgroundDownloader.checkForExistingDownloads()
        //console.log(JSON.stringify(backgroundTask);
        AsyncStorage.multiGet(DownloadManager.download_pids, (err, stores) => {
          stores.map((result, i, store) => {
            let key = store[i][0]
            let value = store[i][1]

            let jsonObj = JSON.parse(value)
            let downloadProcess = DownloadProcess.fromJson(jsonObj)

            if (backgroundTask instanceof Array) {
              var task = backgroundTask.find(y => y.id === downloadProcess.pid)
              //console.log(JSON.stringify("process:" + task));
              if (task != undefined) {
                task
                  .progress((percent, bytesRead, totalBytes) => {
                    downloadProcess.onProgress(percent, bytesRead, totalBytes)
                  })
                  .done(() => downloadProcess.onDone())
                  .error(e => downloadProcess.onError(e))
                downloadProcess.setTask(task)
              }
            }
            DownloadManager.downloads.push(downloadProcess)
          })
        })
      } else DownloadManager.download_pids = []
    } catch (e) {
      DownloadManager.download_pids = []
    }
  }

  static remove(pid: String) {
    DownloadManager.download_pids = DownloadManager.download_pids.filter(
      a => a != pid
    )
    AsyncStorage.setItem(
      'Download_pids',
      JSON.stringify(DownloadManager.download_pids)
    ).catch(e => {
      console.log(e)
    })
    DownloadManager.downloads = DownloadManager.downloads.filter(
      s => s.pid != pid
    )
  }

  static start(process: DownloadProcess, updateState) {
    let task = RNBackgroundDownloader.download({
      id: process.pid,
      url:
        Platform.OS === 'ios' ? encodeURI(process.url).toString() : process.url,
      destination: process.filePath
    })
      .begin(expectedBytes => process.onBegin(expectedBytes))
      .progress((percent, bytesRead, totalBytes) =>
        process.onProgress(percent, bytesRead, totalBytes)
      )
      .done(() => process.onDone())
      .error(e => process.onError(e))

    process.setTask(task)
    process.saveTask()

    DownloadManager.downloads.push(process)
    DownloadManager.download_pids.push(process.pid)
    AsyncStorage.setItem(
      'Download_pids',
      JSON.stringify(DownloadManager.download_pids)
    )
    updateState !== undefined ? updateState() : null
  }

  static async startDownload(process: DownloadProcess, updateState) {
    if (Platform.OS === 'android') {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ).then(async granted => {
        if (granted) DownloadManager.start(process, updateState)
        else
          Alert.alert(
            'Permission is not granted',
            "Restart the app and Allow to access storage. If you had checked 'Never ask again', you may have to reinstall the app"
          )
      })
    } else DownloadManager.start(process, updateState)
  }

  static clearDownloads() {
    //stop all downloads-
    DownloadManager.downloads.forEach(async d => {
      if (d.state != DownloadManager.downloadStates.DONE) d.stop()
      else {
        if (await RNFetchBlob.fs.exists(d.filePath))
          await RNFetchBlob.fs.unlink(d.filePath)
      }
    })
    //clear-
    DownloadManager.downloads = []
    AsyncStorage.multiRemove(DownloadManager.download_pids).catch(e =>
      console.log(e)
    )
    DownloadManager.download_pids = []
    AsyncStorage.setItem(
      'Download_pids',
      JSON.stringify(DownloadManager.download_pids)
    )
  }
}
