import { AsyncStorage } from 'react-native'

export default class ProgressManager {
  static progressTv = []
  static progressMovie = []

  static async init() {
    try {
      let progTv = await AsyncStorage.getItem('ProgressTv')
      let progMovie = await AsyncStorage.getItem('ProgressMovie')

      if (progTv == undefined) ProgressManager.progressTv = []
      else if (progTv != undefined && progTv != '') {
        try {
          ProgressManager.progressTv = JSON.parse(progTv)
        } catch (e) {
          ProgressManager.progressTv = []
        }
      }

      if (progMovie == undefined) ProgressManager.progressMovie = []
      else if (progMovie != undefined && progMovie != '') {
        try {
          ProgressManager.progressMovie = JSON.parse(progMovie)
        } catch (e) {
          ProgressManager.progressMovie = []
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  static hasTvProgress(id) {
    return ProgressManager.progressTv.some(item => item.id === id)
  }
  static hasMovieProgress(id) {
    return ProgressManager.progressMovie.some(item => item.id === id)
  }

  static getTv(id) {
    var flag = 0
    for (let i = 0; i < ProgressManager.progressTv.length; i++) {
      if (ProgressManager.progressTv[i].id === id) {
        flag = 1
        return ProgressManager.progressTv[i]
      }
    }
    if (flag === 0) return null
  }
  static getMovie(id) {
    var flag = 0
    for (let i = 0; i < ProgressManager.progressMovie.length; i++) {
      if (ProgressManager.progressMovie[i].id === id) {
        flag = 1
        return ProgressManager.progressMovie[i]
      }
    }
    if (flag === 0) return null
  }

  static addTvShow(data) {
    ProgressManager.progressTv.unshift(data)
    return AsyncStorage.setItem(
      'ProgressTv',
      JSON.stringify(ProgressManager.progressTv)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }
  static addMovie(data) {
    ProgressManager.progressMovie.unshift(data)
    return AsyncStorage.setItem(
      'ProgressMovie',
      JSON.stringify(ProgressManager.progressMovie)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }

  static removeTvShowProgress(id) {
    ProgressManager.progressTv = ProgressManager.progressTv.filter(
      item => item.id != id
    )
    return AsyncStorage.setItem(
      'ProgressTv',
      JSON.stringify(ProgressManager.progressTv)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }
  static removeMovieProgress(id) {
    ProgressManager.progressMovie = ProgressManager.progressMovie.filter(
      item => item.id != id
    )
    return AsyncStorage.setItem(
      'ProgressMovie',
      JSON.stringify(ProgressManager.progressMovie)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }

  static clearProgress() {
    AsyncStorage.removeItem('ProgressTv').catch(e => {
      console.log(e)
    })
    AsyncStorage.removeItem('ProgressMovie').catch(e => {
      console.log(e)
    })
    ProgressManager.progressTv = []
    ProgressManager.progressMovie = []
  }
}
