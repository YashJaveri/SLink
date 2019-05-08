import Constants from "./Constants";
import SettignsManager from "./Managers/SettingsManager";

export default class Calls {

  static getUnknown = async (title = "Most Popular",  other = {isTv: true, replace: false}, page = 2, region = 'us') => {
    if (other.isTv) {
      if (title === "Most Popular"){
        json =  Calls.getPopularTvShows(page, region);
        return json;
    }
      else if (title === "Top Rated")
        return Calls.getTopRatedTvShows(page, region);
      else if (title==="On Air")
        return Calls.getTvOnAir(page, region);
    } else if (!other.isTv) {
      if (title === "Most Popular")
        return Calls.getPopularMovies(page, region);
      else if (title === "Top Rated")
        return Calls.getTopRatedMovies(page, region);
    }
    return json;
  }
  //Trailers:-
  static getMovieTrailerUrl = async id => {
    var url = `${Constants.BASE_URL}/movie/${id}/videos?api_key=${Constants.API_KEY}`;
    var baseVideoUrl = "https://www.youtube.com/watch?v=";
    try {
      let response = await fetch(url);
      let json = await response.json();
      if(json.results==undefined)
        return null;
      else
        return baseVideoUrl + json.results[0].key;
    } catch (e) {
      console.log(e);
    }
  };

  static getTvTrailerUrl = async id => {
    var url = `${Constants.BASE_URL}/tv/${id}/videos?api_key=${Constants.API_KEY}`;
    var baseVideoUrl = "https://www.youtube.com/watch?v=";
    try {
      let response = await fetch(url);
      let json = await response.json();
      if(json.results==undefined)
        return null;
      else
        return baseVideoUrl + json.results[0].key;
    } catch (e) {
      console.log(e);
    }
  };

  //Movies:-
  static getTrendingMovies = async () => {
    var url = `${Constants.BASE_URL}/trending/movie/week?api_key=${Constants.API_KEY}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getPopularMovies = async (page = 1, region = 'us') => {
    var url = `${Constants.BASE_URL}/movie/popular?api_key=${Constants.API_KEY}&page=${page}&region=${region}`;

    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getTopRatedMovies = async (page = 1, region = 'us') => {
    var url = `${Constants.BASE_URL}/movie/top_rated?api_key=${Constants.API_KEY}&page=${page}&region=${region}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getUpcomingMovies = async (page = 1, region = 'us') => {
    var url = `${Constants.BASE_URL}/movie/upcoming?api_key=${Constants.API_KEY}&page=${page}&region=${region}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };

  static getSimilarMovies = async id => {
    var url = `${Constants.BASE_URL}/movie/${id}/similar?api_key=${Constants.API_KEY}&page=${1}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getRecommendedMovies = async id => {
    var url = `${Constants.BASE_URL}/movie/${id}/recommendations?api_key=${Constants.API_KEY}&page=${1}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getMovieDetails = async id => {
    var url = `${Constants.BASE_URL}/movie/${id}?api_key=${Constants.API_KEY}&append_to_responsse=videos`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static  searchMovie = async (query) => {
    var url = `${Constants.BASE_URL}/search/movie?api_key=${Constants.API_KEY}&query=${query}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getMovieSubtitles = async (id) => {
    var urlImdb = `${Constants.BASE_URL}/movie/${id}/external_ids?api_key=${Constants.API_KEY}`;
    var imdbId = '';
    try {
      let response1 = await fetch(urlImdb);
      let json1 = await response1.json();
      imdbId = json1.imdb_id;
    }catch(e){
      console.log(e);
    }
    var url = `${Constants.SUB_BASE_URL}/imdbid-${imdbId}/sublanguageid-${SettignsManager.subtitleLanguage}`;
    try {
      let response2 = await fetch(url, {
        method: 'GET',
        headers: new Headers({'USER-AGENT': 'Slink'})
        });
      let json2 = await response2.json();
      let obj = json2.find(
        s => s.SubLanguageID == SettignsManager.subtitleLanguage
      );
      let link = obj.SubDownloadLink;
      let linkInSrt = link.replace("gz", "srt");
      return linkInSrt;
    } catch (e) {
      console.log(e);
    }
  };

  //TV Shows:-
  static getTrendingTvShows = async () => {
    var url = `${Constants.BASE_URL}/trending/tv/week?api_key=${Constants.API_KEY}`;

    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getPopularTvShows = async (page = 1) => {
    var url = `${Constants.BASE_URL}/tv/popular?api_key=${Constants.API_KEY}&page=${page}`;

    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getTopRatedTvShows = async (page = 1) => {
    var url = `${Constants.BASE_URL}/tv/top_rated?api_key=${Constants.API_KEY}&page=${page}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getTvOnAir = async (page = 1) => {
    var url = `${Constants.BASE_URL}/tv/on_the_air?api_key=${Constants.API_KEY}&page=${page}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  }
  static getSimilarTvShows = async id => {
    var url = `${Constants.BASE_URL}/tv/${id}/similar?api_key=${Constants.API_KEY}&page=${1}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getRecommendedTvShows = async id => {
    var url = `${Constants.BASE_URL}/tv/${id}/recommendations?api_key=${Constants.API_KEY}&page=${1}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getTvDetails = async id => {
    var url = `${Constants.BASE_URL}/tv/${id}?api_key=${Constants.API_KEY}&append_to_responsse=videos`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getEpisodes = async (id, seasonNumber) => {
    var url = `${Constants.BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${Constants.API_KEY}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static searchTvShow = async (query) => {
    var url = `${Constants.BASE_URL}/search/tv?api_key=${Constants.API_KEY}&query=${query}`;
    try {
      let response = await fetch(url);
      let json = await response.json();
      return json;
    } catch (e) {
      console.log(e);
    }
  };
  static getTvSubtitles = async (id, season, ep) => {
    var urlImdb = `${Constants.BASE_URL}/tv/${id}/external_ids?api_key=${Constants.API_KEY}`;
    var imdbId = '';
    try {
      let response1 = await fetch(urlImdb);
      let json1 = await response1.json();
      imdbId = json1.imdb_id;
    }catch(e){
      console.log(e);
    }
    var url = `${Constants.SUB_BASE_URL}/episode-${ep}/imdbid-${imdbId}/season-${season}/sublanguageid-${SettignsManager.subtitleLanguage}`;
    try {
      let response2 = await fetch(url, {
        method: 'GET',
        headers: new Headers({'USER-AGENT': 'Slink'})
        });
      let json2 = await response2.json();
      let obj = json2.find(
        s => s.SubLanguageID == SettignsManager.subtitleLanguage
      );
      let link = obj.SubDownloadLink;
      let linkInSrt = link.replace("gz", "srt");
      return linkInSrt;
    } catch (e) {
      console.log(e);
    }
  };
}
