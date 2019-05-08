import { checkSize } from "./getSize";
import SettingsManager from "./Managers/SettingsManager";

const links: String = ["http://www.dl.downloada.net/Movie/2018/"];
const sRegex = /[sS][0-9][0-9]|[sS][0-9]|season[0-9][0-9]|SEASON[0-9][0-9]|Season[0-9][0-9]|season[0-9]|SEASON[0-9]|Season[0-9]/;
const eRegex = /[eE][0-9][0-9]|[eE][0-9]/;
const extRegx = /mkv|mp4|m4a/;
const resRegex = /[0-9][0-9][0-9]p|[0-9][0-9][0-9][0-9]p/;
const yRegex = /[0-9][0-9][0-9][0-9]/;
const tRegex = /trailer|Trailer|TRAILER/;
const cheerio = require("react-native-cheerio");
class LinkData {
  constructor() {
    this.link = undefined;
    this.host = undefined;
    this.resolution = undefined;
    this.year = undefined;
    this.extension = undefined;
    this.size = undefined;
  }
}
export default class WebCrawlProcess {
  static Movies = [];
  static TvShows = [];
  constructor() {
    this.cancelled = false;
    this.onFoundLink = (LinkData: LinkData) => {};
    this.onComplete = () => {};
    this.running = false;
  }
  getHrefs(html) {
    let list: String[] = [];
    try {
      var $ = cheerio.load(html);
      var body = $("body").children();
      body.find("a").each((i, el) => {
        var link = $(el).attr("href");
        list.push(decodeURI(link));
      });
      return list;
    } catch (err) {
      console.log(err);
      return list;
    }
  }
  getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (
      match != null &&
      match.length > 2 &&
      typeof match[2] === "string" &&
      match[2].length > 0
    ) {
      return match[2];
    } else {
      return null;
    }
  }
  tryMatch = function(name, href, test = 0) {
    // console.log(`${href}  ${name}`);
    let newhref = href.substring(0, href.length - 1);
    if (name.includes(newhref) || newhref.includes(name)) {
      return true;
    }
    let spfilteredName = name.replace(new RegExp("[-:;*,]", "g"), " ");
    if (spfilteredName.includes(newhref) || newhref.includes(spfilteredName)) {
      return true;
    }
    let filteredName = name.replace(new RegExp("[-:;*,]", "g"), "");
    if (filteredName.includes(newhref) || newhref.includes(filteredName)) {
      return true;
    }
    let dots = name.replace(new RegExp(" ", "g"), ".");
    if (dots.includes(newhref) || newhref.includes(dots)) {
      return true;
    }
    let hyphen = name.replace(new RegExp(" ", "g"), "-");
    if (hyphen.includes(newhref) || newhref.includes(hyphen)) {
      return true;
    }
    let underscore = name.replace(new RegExp(" ", "g"), "_");
    if (underscore.includes(newhref) || newhref.includes(underscore)) {
      return true;
    }
    if (test == 2) {
      return false;
    } else if (test == 0) {
      return this.tryMatch(name.toLowerCase(), href, 1);
    } else if (test == 1) {
      return this.tryMatch(name.toUpperCase(), href, 2);
    } else {
      return false;
    }
  };
  cancel() {
    this.cancelled = true;
  }
  processAndSend = async (link: String, href: String) => {
    let finalLink = `${link}${href}`;
    let resolution;
    let ext;
    let year;
    let linkData = new LinkData();
    let res = await checkSize(finalLink);
    if (res.bytes < 1024 * 1024 * 25) {
      return;
    }
    linkData.size = res.size;
    linkData.link = finalLink;
    let host = this.getHostName(finalLink);
    linkData.host = host;
    if (!tRegex.test(finalLink)) {
      if (resRegex.test(finalLink)) {
        resolution = finalLink.match(resRegex).join();
        if (SettingsManager.hdOnly) {
          if (resolution != undefined) {
            try {
              let iresolution = Number(
                resolution.substring(0, resolution.length - 1)
              );
              if (iresolution < 720) {
                return;
              } else {
                linkData.resolution = resolution;
              }
            } catch (err) {
              linkData.resolution = resolution;
            }
          } else {
            linkData.resolution = resolution;
          }
        } else {
          linkData.resolution = resolution;
        }
      }
      if (yRegex.test(finalLink)) {
        year = finalLink.match(yRegex).join();
        linkData.year = year;
      }
      ext = finalLink.match(extRegx).join();
      this.onFoundLink(linkData);
    }
  };
  handleNestedMovie = async (link: String) => {
    try {
      let response = await fetch(link);
      let html = await response.text();
      let hrefs = this.getHrefs(html);
      for (let href of hrefs) {
        if (this.cancelled) {
          break;
        }
        if (href.includes("../")) {
          continue;
        }
        // console.log(href);
        if (extRegx.test(href)) {
          await this.processAndSend(link, href);
          continue;
        }
        if (href.includes("/")) {
          let appended = link + href;
          await this.handleNestedMovie(appended);
        }
      }
    } catch (err) {}
  };
  crawlForMovie = async (name: String) => {
    this.cancelled = false;
    this.running = true;
    for (let link of WebCrawlProcess.Movies) {
      if (this.cancelled) {
        break;
      }
      try {
        let response = await fetch(link);
        let html = await response.text();
        let hrefs = this.getHrefs(html);
        for (let href of hrefs) {
          if (this.cancelled) {
            break;
          }
          if (href.includes("../")) {
            continue;
          }
          if (!this.tryMatch(name, href)) {
            continue;
          }
          //console.log(href);
          if (extRegx.test(href)) {
            await this.processAndSend(link, href);
            break;
          }
          if (href.includes("/")) {
            let appended = link + href;
            await this.handleNestedMovie(appended);
          }
        }
      } catch (err) {}
    }
    this.running = false;
    this.onComplete();
  };
  crawlForMovieParallel = async (name: String) => {
    this.cancelled = false;
    this.running = true;
    let completeCount = 0;
    for (let link of WebCrawlProcess.Movies) {
      if (this.cancelled) {
        break;
      }
      fetch(link)
        .then(async res => {
          let html = await res.text();
          let hrefs = this.getHrefs(html);
          for (let href of hrefs) {
            if (this.cancelled) {
              break;
            }
            if (href.includes("../")) {
              continue;
            }
            if (!this.tryMatch(name, href)) {
              continue;
            }
           // console.log(href);
            if (extRegx.test(href)) {
              await this.processAndSend(link, href);
              break;
            }
            if (href.includes("/")) {
              let appended = link + href;
              await this.handleNestedMovie(appended);
            }
          }
          completeCount++;
          if (completeCount >= WebCrawlProcess.Movies.length) {
            this.running = false;
            this.onComplete();
          }
        })
        .catch(err => {});
    }
  };
  handleNestedTvShow = async (
    link: String,
    Season: Number,
    Episode: Number
  ) => {
    try {
      let response = await fetch(link);
      let html = await response.text();
      let hrefs = this.getHrefs(html);
      for (let href of hrefs) {
        if (this.cancelled) {
          break;
        }
        if (href.includes("../")) {
          continue;
        }
        if (extRegx.test(href)) {
          let hrref = href.replace(" ", "");
          if (sRegex.test(hrref) && eRegex.test(hrref)) {
            let s = hrref.match(sRegex).join();
            let season =
              s.length > 3
                ? Number(s.slice(7, s.length))
                : Number(s.slice(1, s.length));
            let e = href.match(eRegex).join();
            let episode = Number(e.slice(1, e.length));
            if (season == Season && episode == Episode) {
              await this.processAndSend(link, href);
              break;
            } else {
              continue;
            }
          } else {
            continue;
          }
        }
        if (href.includes("/")) {
          let hrref = href.replace(" ", "");
          if (sRegex.test(hrref)) {
            let s = hrref.match(sRegex).join();
            let season =
              s.length > 3
                ? Number(s.slice(7, s.length))
                : Number(s.slice(1, s.length));
            if (season == Season) {
              let appended = link + href;
              await this.handleNestedTvShow(appended, Season, Episode);
            } else {
              continue;
            }
          } else {
            let appended = link + href;
            await this.handleNestedTvShow(appended, Season, Episode);
          }
        }
      }
    } catch (err) {}
  };

  crawlForTvShow = async (name: String, Season: Number, Episode: Number) => {
    this.cancelled = false;
    this.running = true;
    for (let link of WebCrawlProcess.TvShows) {
      if (this.cancelled) {
        break;
      }
      try {
        let response = await fetch(link);
        let html = await response.text();
        let hrefs = this.getHrefs(html);
        for (let href of hrefs) {
          if (this.cancelled) {
            break;
          }
          if (href.includes("../")) {
            continue;
          }
          if (!this.tryMatch(name, href)) {
            continue;
          }
          if (extRegx.test(href)) {
            let hrref = href.replace(" ", "");
            if (sRegex.test(hrref) && eRegex.test(hrref)) {
              let s = hrref.match(sRegex).join();
              s = s.replace(" ", "");
              s =
                s.length > 3
                  ? Number(s.slice(7, s.length))
                  : Number(s.slice(1, s.length));
              let e = href.match(eRegex).join();
              e = Number(e.slice(1, e.length));
              if (s == Season && e == Episode) {
                await this.processAndSend(link, href);
                break;
              } else {
                continue;
              }
            } else {
              continue;
            }
          }
          if (href.includes("/")) {
            let appended = link + href;
            await this.handleNestedTvShow(appended, Season, Episode);
          }
        }
      } catch (err) {}
    }
    this.running = false;
    this.onComplete();
  };
  crawlForTvShowParallel = async (
    name: String,
    Season: Number,
    Episode: Number
  ) => {
    this.cancelled = false;
    this.running = true;
    let completeCount = 0;
    for (let link of WebCrawlProcess.TvShows) {
      if (this.cancelled) {
        break;
      }
      fetch(link)
        .then(async res => {
          let html = await res.text();
          let hrefs = this.getHrefs(html);
          for (let href of hrefs) {
            if (this.cancelled) {
              break;
            }
            if (href.includes("../")) {
              continue;
            }
            if (!this.tryMatch(name, href)) {
              continue;
            }
            if (extRegx.test(href)) {
              let hrref = href.replace(" ", "");
              if (sRegex.test(hrref) && eRegex.test(hrref)) {
                let s = hrref.match(sRegex).join();
                s = s.replace(" ", "");
                s =
                  s.length > 3
                    ? Number(s.slice(7, s.length))
                    : Number(s.slice(1, s.length));
                let e = href.match(eRegex).join();
                e = Number(e.slice(1, e.length));
                if (s == Season && e == Episode) {
                  await this.processAndSend(link, href);
                  break;
                } else {
                  continue;
                }
              } else {
                continue;
              }
            }
            if (href.includes("/")) {
              let appended = link + href;
              await this.handleNestedTvShow(appended, Season, Episode);
            }
          }
          completeCount++;
          if (completeCount >= WebCrawlProcess.TvShows.length) {
            this.running = false;
            this.onComplete();
          }
        })
        .catch(err => {});
    }
  };
}
