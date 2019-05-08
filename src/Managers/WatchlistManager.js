import { AsyncStorage } from 'react-native'

export default class WatchlistManager {
  static tvWatchlist = []
  static movieWatchlist = []

  static async init() {
    try {
      let tvWl = await AsyncStorage.getItem('WatchlistTv')
      let movieWl = await AsyncStorage.getItem('WatchlistMovie')

      if (tvWl == undefined) WatchlistManager.tvWatchlist = []
      else if (tvWl != undefined && tvWl != '') {
        try {
          WatchlistManager.tvWatchlist = JSON.parse(tvWl)
        } catch (e) {
          WatchlistManager.tvWatchlist = []
        }
      }

      if (movieWl == undefined) WatchlistManager.movieWatchlist = []
      else if (movieWl != undefined && movieWl != '') {
        try {
          WatchlistManager.movieWatchlist = JSON.parse(movieWl)
        } catch (e) {
          WatchlistManager.movieWatchlist = []
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  static hasMovie(id) {
    return WatchlistManager.movieWatchlist.some(item => item.id == id)
  }
  static hasTvShow(id) {
    return WatchlistManager.tvWatchlist.some(item => item.id == id)
  }

  static addTvShow(data) {
    WatchlistManager.tvWatchlist.push(data)
    return AsyncStorage.setItem(
      'WatchlistTv',
      JSON.stringify(WatchlistManager.tvWatchlist)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }
  static addMovie(data) {
    WatchlistManager.movieWatchlist.push(data)
    return AsyncStorage.setItem(
      'WatchlistMovie',
      JSON.stringify(WatchlistManager.movieWatchlist)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }

  static removeTvShow(id) {
    WatchlistManager.tvWatchlist = WatchlistManager.tvWatchlist.filter(
      item => item.id != id
    )
    return AsyncStorage.setItem(
      'WatchlistTv',
      JSON.stringify(WatchlistManager.tvWatchlist)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }
  static removeMovie(id) {
    WatchlistManager.movieWatchlist = WatchlistManager.movieWatchlist.filter(
      item => item.id != id
    )
    return AsyncStorage.setItem(
      'WatchlistMovie',
      JSON.stringify(WatchlistManager.movieWatchlist)
    )
      .then(() => {
        return true
      })
      .catch(e => {
        return false
      })
  }

  static clearWatchlist() {
    AsyncStorage.removeItem('WatchlistTv').catch(e => {
      console.log(e)
    })
    AsyncStorage.removeItem('WatchlistMovie').catch(e => {
      console.log(e)
    })
    WatchlistManager.tvWatchlist = []
    WatchlistManager.movieWatchlist = []
  }
}
