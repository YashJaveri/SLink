const BytesToMegaBytes=(bytes)=>{
    return bytes/(1024*1024);
}
 const BytesToKiloBytes=(bytes)=>{
    return bytes/1024;
}
 const BytesToGigaBytes=(bytes)=>{
    return bytes/(1024*1024*1024);
}
export const getSizeString =(bytes)=> {
    bytes = Math.abs(bytes);
    if (Math.floor(BytesToGigaBytes(bytes)) > 0) {
      return Math.round(BytesToGigaBytes(bytes) * 100) / 100 + " GB";
    } else if (Math.floor(BytesToMegaBytes(bytes)) > 0) {
      return Math.floor(BytesToMegaBytes(bytes) * 10) / 10 + " MB";
    } else if (Math.floor(BytesToKiloBytes(bytes)) > 0) {
      return Math.floor(BytesToKiloBytes(bytes)) + " KB";
    } else {
      return bytes + "B";
    }
  }
  export const checkSize = (url)=> {
    let promise = new Promise(resolve => {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url);
        xhr.onreadystatechange = e => {
          if (xhr.readyState == xhr.DONE) {
            let bytes = parseInt(xhr.getResponseHeader("Content-Length"));
            let size = getSizeString(bytes);
            resolve({size:size,bytes:bytes});
          }
        };
        xhr.send();
      } catch (err) {
          console.log(err);
        resolve(undefined)
      }
    });
    return promise;
  }