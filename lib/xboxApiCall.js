


var jsonData

function getJson(apiKey, xuidOrTag, callType, callback) {

    var baseApiUrlString = 'curl -s -H "X-AUTH: ' + apiKey + '" https://xboxapi.com/v2/'; 
    var xboxApiUrlString = baseApiUrlString + xuidOrTag + callType

    var apiCall = require('child_process').exec,
      child;

    child = apiCall(xboxApiUrlString, function(error, stdout, stderr) {

      try {
        callback(stdout)

      } catch (e) {
        console.log(e);
      }

    },function(err) {

    });
}

module.exports = {
  getJson : getJson  
}

