class Utils {

  // draw random integer from flat distribution:
  static getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // draw random integer from exponential distribution:
  static getRandomIntExp(min, max, lambda) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let lmd = lambda;
    let rnd = (-lmd * Math.log(Math.random())) + min;
    if (rnd > max) {
      rnd = max;
    }
    rnd = Math.floor(rnd);
    return rnd;
  }

  // HK - generate a random value between 0 and 1, positive or negative
  // used in the randomization of the Y-intercept
  static getRandomYInt() {
    var random = Math.random();
    var sign = Math.random() < 0.5 ? -1 : 1;
    let offset = random * sign;
    return offset;
  }

  // format number to string padded with zeros:
  static padWithZeros(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
  }

  // HK - generates a coherence
  // for instance, .768 moves on avg 76.8% of dots coherently
  static getTrialCoherence() {
    let coherenceList = [.256, .512, .768];
    let numberOfCoherences = coherenceList.length;
    let cohIndex = Math.floor(Math.random()*numberOfCoherences);
    let trialCoherence = coherenceList[cohIndex];
    return trialCoherence;
  }

  // HK - generates a direction (left or right)
  // -1 represents right, +1 represents left
  static getTrialDirection() {
    let directionList = [-1, 1]
    let numberOfDirections = directionList.length;
    let dirIndex = Math.floor(Math.random()*numberOfDirections);
    let trialDirection = directionList[dirIndex];
    return trialDirection;
  }

  // function that parses arguments passed via URL:
  static parseUrlArguments() {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }

  // get a very precice time stamp since the app has been running:
  static getTimeStamp() {
    return performance.now();
  }

  // get the time that has passed since year 1970:
  static getUnixTime() {
    var d = new Date();
    var unixTime = d.getTime();
    return unixTime
  }

  // copy int16 to an array of two bytes:
  static toBytesInt16(num){
    let arr = new ArrayBuffer(2)
    let view = new DataView(arr)
    view.setUint16(0, num);
    arr = new Uint8Array([view.getUint8(1), view.getUint8(0)])
    return arr
  }

  // export trial data to a Dropbox file:
  static exportTrial(filename, trialdata) {
    let Dropbox = require('dropbox');
    let token = 'KRQ60jwJHuAAAAAAAAAACnWWgJ5vQEnGcZ2JwWTAbcbVTdoCLc1rLrLOldzJMfr-'
    let dbx = new Dropbox({accessToken: token});
    let contents = JSON.stringify(trialdata, null, 2);
    console.log(trialdata);
    // let date = new Date();
    // let month = '0' + (date.getMonth() + 1).toString();
    // let day = '0' + date.getDate().toString()
    // let datestring = date.getFullYear().toString()
    //                + month.substring(month.length - 2, month.length)
    //                + day.substring(day.length - 2, day.length);
    dbx.filesUpload({
      path: filename,
      contents: contents
    });
  }
}

export default Utils;
