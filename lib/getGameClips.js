http = require('http');
async = require('async');
var irc = require('irc');

var xboxApiConfig = require('../xboxApiConfig.json');
var bitlyApiKey = config.bitlyApiKey;

var xboxApiCall = require('./xboxApiCall');

var clipJsonData 
var allSavedClips
var someSavedClips = [];
var clipCaptionArray = [];
var clipLongUrlArray = [];
var clipsToDisplay = 5;

var thisGamertag
var thisSayTo

var thisClient = irc.client;

function getGameClips(sayTo, gamertag) {

  clipCaptionArray = [];
  clipLongUrlArray = [];
  someSavedClips = [];

  var apiKey = xboxApiConfig.apiKey;
  var xuid = ""
  var callType = '/game-clips/saved';
  var xboxUsers = xboxApiConfig.xboxUsers

  thisGamertag = gamertag
  thisSayTo = sayTo

  for (var i = 0; i < xboxUsers.length; i++) {
    if (xboxUsers[i].gamertag === gamertag)
      xuid = xboxUsers[i].xuid

  }
  if (xuid === "") return

  xboxApiCall.getJson(apiKey, xuid, callType, function(jsonData) {
    allSavedClips = JSON.parse(jsonData);

    for (var i = 0; i < clipsToDisplay; i++) {
      someSavedClips[i] = allSavedClips[i];
    }

    processClips();
  });
}

function processClips() {
  console.log("processClips()");

  async.eachSeries(someSavedClips, function(clip, callback) {

    var someSavedClipsIteration = someSavedClips.indexOf(clip)
    clipCaptionArray[someSavedClipsIteration] = someSavedClips[someSavedClipsIteration].userCaption

    var gameClipId = someSavedClips[someSavedClipsIteration].gameClipId
    var scid = someSavedClips[someSavedClipsIteration].scid
    var URI = ("https://account.xbox.com/en-us/gameclip/" + gameClipId + "?gamerTag=" + thisGamertag + "&scid=" + scid);
    clipLongUrlArray[someSavedClipsIteration] = encodeURIComponent(URI);

    callback();

  }, function(err) {

    if (err) {
      console.log('something failed: ' + err);
    } else {

      console.log("   done processing clips.")
      announceClips();

    }
  });
}

function announceClips() {

  console.log("announceClips()")
  async.eachSeries(clipLongUrlArray, function(clip, callback) {

    var iteration = clipLongUrlArray.indexOf(clip)
    var thisCaption = clipCaptionArray[iteration];
    var thisLongUrl = clipLongUrlArray[iteration];

	var getBitlyUrl = ("http://api.bit.ly/v3/shorten?login=bitlyxbot&apiKey=" + bitlyApiKey + "&longUrl=" + thisLongUrl + "&format=json")
    http.get(getBitlyUrl, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        var jsonBitlyResponse = JSON.parse(chunk);
        var shortUrl = jsonBitlyResponse.data.url
        var outputString = (irc.colors.wrap("light_cyan",("[ " )) + irc.colors.wrap("orange",thisCaption) + irc.colors.wrap("light_cyan",(" ] " )) + shortUrl)
        console.log(outputString);
        thisClient.say(thisSayTo, outputString)
      });

    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });

    callback();

  }, function(err) {
    if (err)
      console.log(err);
    else
      console.log("    done processing users.");
  });

}

function getClient(client)
{
	thisClient = client
}

module.exports = {
	getGameClips: getGameClips,
	getClient: getClient
}