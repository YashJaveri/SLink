const REGEX = /(\d+)\n([\d:]+),\d+\s+--\>\s+([\d:]+),\d+\n(.*\n.*)/gm;

export default class SubsExtractor{

  static subtitleJson = [];


  static getSubs = async (link) => {
    try{
      let sub = await fetch(link);
      sub.text().then((val) => {
        let subtitles=val
        var subJson = SubsExtractor.parse(subtitles);
        //console.log(JSON.stringify(subJson));
        SubsExtractor.subtitleJson = subJson;
      });
    }catch(e){
      console.log(e);
    }
  }

  static toSeconds = (time) => {
    arr = time.split(':');
    let seconds = (Number(arr[0])*60*60) + (Number(arr[1])*60) + Number(arr[2])
    return seconds;
  }

  static toJson = (grp) => {
    let content = grp[4].replace("\n", " ");
    content=content.replace(/<font .*><b>.*<\/><\/font>/g,'');
    let json = {
        numb: grp[1],
        start: SubsExtractor.toSeconds(grp[2]),
        end: SubsExtractor.toSeconds(grp[3]),
        content: content
      };
      return json;
    }

  static parse = (sub) => {
    let subJson = [];
    //console.log(sub);
    if(sub==null)
      return null;
    sub = sub.replace(/\r\n|\r|\n/g, '\n');
    sub = sub.replace(/<i>/g, '');
    sub = sub.replace(/<\/i>/g, '');
    //<font color="#ffff00"><b>RESYNC BY: OPT</b></font>

    while ((matches = REGEX.exec(sub)) != null)
      subJson.push(SubsExtractor.toJson(matches));
    return subJson;
  }
}
