import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking
} from "react-native";
import Theme from "../Theme";
import Tmdb from "../tmdb";
import ActionButton from "react-native-circular-action-menu";
import WebCrawlProcess from "../WebCrawler";
import Orientation from "react-native-orientation";
import VideoPlayer from "./VideoPlayer";
import { AppSettings } from "../AppSettings";
import { DownloadManager, DownloadProcess } from "../DownloadManager";

const DownloadIcon = require("../icons/download2.png");
const Downloading = require("../icons/downloading.gif");
const downloadComplete = require("../icons/download_complete.png");
const ForwardArrow = require("../icons/forward-arrow.png");

class LinkItem extends Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.isMovie = false;
    this.playUrl = props.link;
    this.canDownload = true;
  }
  componentDidMount() {
    this.mounted = true;
    if (LinksScreen.PARAMS.Data.original_title == null) {
      this.isMovie = false;
    } else {
      this.isMovie = true;
    }
    this.getImdbId();
    this.props.navigation.addListener("didFocus", () => {
      if (this.mounted) {
        this.setState({});
      }
    });
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  getImdbId = async () => {
    let imdbId;
    if (!this.isMovie) {
      imdbId = await Tmdb.getTvImdbID(LinksScreen.PARAMS.Data.id);
    } else {
      imdbId = await Tmdb.getMovieImdbID(LinksScreen.PARAMS.Data.id);
    }
    this.imdbId = imdbId;
  };
  getFilePath = () => {
    var filename = this.props.link.substring(this.props.link.lastIndexOf("/"));
    return `${AppSettings.config.DownloadPath}${filename}`;
  };
  getIconSource = () => {
    let found = DownloadManager.Downloads.find(p => p.url == this.props.link);
    if (found == undefined) {
      this.canDownload = true;
      return DownloadIcon;
    } else {
      if (found.state == DownloadManager.DownloadStates.DONE) {
        this.playUrl = found.filePath;
        this.canDownload = false;
        return downloadComplete;
      } else if (
        found.state == DownloadManager.DownloadStates.FAILED ||
        found.state == DownloadManager.DownloadStates.STOPPED
      ) {
        this.canDownload = true;
        return DownloadIcon;
      } else {
        this.canDownload = false;
        return Downloading;
      }
    }
  };
  getTitle = () => {
    let title = this.props.navigation.getParam("title", "");
    if (title.includes("/")) {
      title = title.substring(0, title.indexOf("/"));
    }
    return title;
  };
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          //ShowInter();
          VideoPlayer.PARAMS.url = this.playUrl;
          VideoPlayer.PARAMS.season = LinksScreen.PARAMS.season_number;
          VideoPlayer.PARAMS.episode = LinksScreen.PARAMS.episode_number;
          VideoPlayer.PARAMS.imdb = this.imdbId;
          VideoPlayer.PARAMS.id = LinksScreen.PARAMS.Data.id;
          VideoPlayer.PARAMS.title = this.props.navigation.getParam(
            "title",
            ""
          );
          this.props.navigation.navigate("VideoPlayer");
        }}
        onLongPress={() => {}}
        activeOpacity={0.9}
        style={{ flexDirection: "row", margin: 10 }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              color: "white",
              marginHorizontal: 10,
              marginVertical: 2,
              fontWeight: "500"
            }}
          >
            {this.props.host}
          </Text>
          <View style={{ flexDirection: "row" }}>
            {this.props.resolution ? (
              <Text
                style={{
                  fontSize: 14,
                  color: Theme.InActiveColor,
                  marginHorizontal: 10,
                  fontWeight: "400"
                }}
              >
                {this.props.resolution}
              </Text>
            ) : null}
            {this.props.year ? (
              <Text
                style={{
                  fontSize: 14,
                  color: Theme.InActiveColor,
                  marginHorizontal: 10,
                  fontWeight: "400"
                }}
              >
                {this.props.year}
              </Text>
            ) : null}
            <Text
              style={{
                fontSize: 14,
                color: Theme.InActiveColor,
                marginHorizontal: 10,
                fontWeight: "400"
              }}
            >
              {this.props.size}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            //ShowInter();
            if (this.canDownload) {
              let process = new DownloadProcess(
                this.props.link,
                LinksScreen.PARAMS.Data.id,
                this.isMovie ? "Movie" : "TvShow",
                this.getTitle(),
                LinksScreen.PARAMS.Data.poster_path,
                this.getFilePath(),
                this.imdbId,
                this.props.resolution,
                LinksScreen.PARAMS.season_number,
                LinksScreen.PARAMS.episode_number
              );
              this.canDownload = false;
              DownloadManager.Start(process);
              if (this.mounted) {
                this.setState({});
              }
            }
          }}
          style={{ alignSelf: "center" }}
        >
          <Image
            style={{
              width: 30,
              height: 30,
              alignSelf: "center",
              margin: 5,
              tintColor: "white"
            }}
            source={this.getIconSource()}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            //ShowInter();
            Linking.openURL(this.props.link);
          }}
        >
          <Image
            style={{
              width: 30,
              height: 30,
              alignSelf: "center",
              margin: 5,
              tintColor: "white"
            }}
            source={ForwardArrow}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}
export default class LinksScreen extends Component {
  static PARAMS = {
    Data: undefined,
    season_number: undefined,
    episode_number: undefined
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      linkDatas: []
    };
    this.data = [];
    this.mounted = false;
  }

  listFooter = () => {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Image
          style={{ width: 50, height: 50, tintColor: Theme.TintColor }}
          source={require("../icons/loading_dots.gif")}
          resizeMode="contain"
        />
      </View>
    );
  };

  componentWillUnmount() {
    this.mounted = false;
    if (this.process != undefined && this.process.running) {
      this.process.cancel();
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.props.navigation.addListener("didFocus", () => {
      if (this.mounted) {
        this.setState({});
      }
    });
    if (LinksScreen.PARAMS.Data != undefined) {
      let title =
        LinksScreen.PARAMS.Data.original_title == null
          ? LinksScreen.PARAMS.Data.name == null
            ? LinksScreen.PARAMS.Data.original_name
            : LinksScreen.PARAMS.Data.name
          : LinksScreen.PARAMS.Data.title == null
          ? LinksScreen.PARAMS.Data.original_title
          : LinksScreen.PARAMS.Data.title;

      this.props.navigation.setParams({
        title:
          LinksScreen.PARAMS.Data.original_title == null
            ? `${title}/s${LinksScreen.PARAMS.season_number}/e${
                LinksScreen.PARAMS.episode_number
              }`
            : title
      });
      this.HandleLoading(title);
    }
  }
  async HandleLoading(title) {
    this.process = new WebCrawlProcess();
    this.process.onFoundLink = async linkData => {
      this.data.push(linkData);
      if (this.mounted) {
        this.setState({
          linkDatas: this.data
        });
      }
    };
    this.process.onComplete = async () => {
      if (this.mounted) {
        this.setState({
          loading: false,
          linkDatas: this.data
        });
        if (this.state.linkDatas.length <= 0) {
          Alert.alert(
            "Links Unavailable",
            "We could not find links for this show. Report to us so that we can add it.",
            [
              { text: "No thanks!" },
              {
                text: "Report",
                onPress: () => {
                  Linking.openURL("mailto:slink@cryvis.com");
                }
              }
            ]
          );
        }
      }
    };
    if (LinksScreen.PARAMS.Data.original_title == undefined) {
      if (AppSettings.config.ParallelSourceLoading) {
        this.process.crawlForTvShowParallel(
          title,
          LinksScreen.PARAMS.season_number,
          LinksScreen.PARAMS.episode_number
        );
      } else {
        this.process.crawlForTvShow(
          title,
          LinksScreen.PARAMS.season_number,
          LinksScreen.PARAMS.episode_number
        );
      }
    } else {
      if (AppSettings.config.ParallelSourceLoading) {
        this.process.crawlForMovieParallel(title);
      } else {
        this.process.crawlForMovie(title);
      }
    }
  }
  static navigationOptions = ({ navigation }) => ({
    headerStyle: {
      backgroundColor: Theme.PrimaryColor,
      elevation: 1
    },
    headerLeft: (
      <View style={{ padding: 10 }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            style={{ width: 25, height: 25, tintColor: Theme.SecondaryColor }}
            source={
              Platform.OS == "android"
                ? require("../icons/android_back.png")
                : require("../icons/ios_back.png")
            }
          />
        </TouchableOpacity>
      </View>
    ),
    headerTitle: (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center"
        }}
      >
        <Text
          style={{
            textAlign: "center",
            marginRight: 45,
            fontWeight: "400",
            fontStyle: "italic",
            color: "white",
            fontSize: 20
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {navigation.getParam("title")}
        </Text>
      </View>
    )
  });
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          key={this.state.linkDatas.length}
          data={this.state.linkDatas}
          ListHeaderComponent={this.state.loading ? this.listFooter : null}
          renderItem={({ item }) => {
            return <LinkItem {...item} navigation={this.props.navigation} />;
          }}
          keyExtractor={(item, index) => {
            return index.toString();
          }}
        />
        <ActionButton
          buttonColor={Theme.PrimaryDark}
          position="right"
          radius={80}
          bgColor="rgba(0,0,0,0.6)"
        >
          <ActionButton.Item
            size={50}
            buttonColor={Theme.PrimaryDark}
            title="Downloads"
            onPress={() => {
              this.props.navigation.navigate("DownloadScreen");
            }}
          >
            <Image
              style={{
                height: 30,
                width: 30,
                tintColor: "white",
                alignSelf: "center"
              }}
              source={require("../icons/download.png")}
              resizeMode="contain"
            />
          </ActionButton.Item>
          <ActionButton.Item
            size={50}
            buttonColor={Theme.PrimaryDark}
            title="WatchList"
            onPress={() => {
              this.props.navigation.navigate("WatchList");
            }}
          >
            <Image
              style={{
                height: 30,
                width: 30,
                tintColor: "white",
                alignSelf: "center"
              }}
              source={require("../icons/watchlist.png")}
              resizeMode="contain"
            />
          </ActionButton.Item>
          <ActionButton.Item
            size={50}
            buttonColor={Theme.PrimaryDark}
            title="Settings"
            onPress={() => {
              this.props.navigation.navigate("SettingsScreen");
            }}
          >
            <Image
              style={{
                height: 30,
                width: 30,
                tintColor: "white",
                alignSelf: "center"
              }}
              source={require("../icons/settings.png")}
              resizeMode="contain"
            />
          </ActionButton.Item>
        </ActionButton>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.PrimaryColor
  }
});
