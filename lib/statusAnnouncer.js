var irc = require('irc');
async = require('async');
var config = require('../xboxApiConfig.json');

var apiKey = config.apiKey;
var xboxApiUrlString = 'curl -s -H "X-AUTH: ' + apiKey + '" https://xboxapi.com/v2/';	

var statusChans = config.statusChannels;
var presenceChans = config.presenceChannels;

var xboxUsers = config.xboxUsers;
var updateIntevalInMins = config.updateInterval
var thisClient = irc.client;

function getClient(client)
{
	thisClient = client
}

function updateUser() {
  /* Because each loop iteration uses asyncronous functions, the async library helps us with this */
  async.eachSeries(xboxUsers, function(user, callback) {

    var apiCall = require('child_process').exec,
      child;

    // Each xboxUsers iteration we are provided with a 'user' variable 
    child = apiCall(xboxApiUrlString + user.xuid + '/presence', {
      timeout: 10000
    }, function(error, stdout, stderr) {

      try {
        var thisPresence = JSON.parse(stdout);
        setState(user, thisPresence);
        setTitle(user, thisPresence);

      } catch (e) {
        /* trigger the next async iteration -- with an error */
        callback('could not parse JSON for ' + user);
      }
      /* trigger the next async iteration */
      callback(null);

    })
  }, function(err) {
    /* final callback when async is done looping */
    if (err) {
      console.log('something failed: ' + err);
    } else {
      console.log('User data set successfully.');
      async.eachSeries(xboxUsers, function(user, announceCB) {
          announceUpdates(user);
          announceCB();
        }, function(err) {}
      );
    }
  });
}

function announceUpdates(user)
{
	console.log("announceUpdates(" + user.name + ")");
	var state = "";
	var title = "";
	var richPresence = "";

	if (user.stateChange === "yes" || user.titleChange === "yes")
	{
		if (user.state === "Offline") // player just went offline
			state = (user.name + " is " + irc.colors.wrap("dark_red","Offline"));
		else if (user.titleChange === "yes" && user.stateChange === "no") // player was online, changed titles
			state = (user.name + "'s activity changed to: " + user.title + richPresence );
		else // player just came online
			state = (user.name + " is now " + irc.colors.wrap("light_green","Online") 
						+ ", current activity: " + user.title + richPresence );
	}		
		user.stateChange = "no";
		user.titleChange = "no";
		user.presenceChange = "no";
		thisClient.say(statusChans, state);
};

function setState(user, thisPresence)
{
	console.log("setState(" + user.nick + ")")
	if (typeof thisPresence.state === 'undefined') 
	{
		consoleLog("thisPresence.state for " + user.nick + " is undefined.");
	}else
	{
		if (user.state !== thisPresence.state ){
		console.log("State has changed to: " + thisPresence.state)
		user.stateChange = "yes";
		user.state = thisPresence.state;
		}
	}
};

function setTitle(user, thisPresence)
{
	try
	{
	console.log("setTitle(" + user.nick + ")")
	if (typeof thisPresence.devices[0].titles === 'undefined') {
		consoleLog("There are no titles available for display.");
	} else {
		var numOftitles = thisPresence.devices[0].titles.length;
	
		for (var i = 0; i < numOftitles; i++ )
		{
			if (thisPresence.devices[0].titles[i].placement === "Full")
			{
				if (user.title !== thisPresence.devices[0].titles[i].name)
				{			
					user.titleChange = "yes";	
					user.title = thisPresence.devices[0].titles[i].name
					console.log("  Current activity: " + thisPresence.devices[0].titles[i].name);
				} 
				if (typeof thisPresence.devices[0].titles[i].activity.richPresence !== 'undefined') {

					if (user.richPresence !== thisPresence.devices[0].titles[i].activity.richPresence)
					{
						user.richPresenceChange = "yes"
						user.richPresence = (" (" + thisPresence.devices[0].titles[i].activity.richPresence + ")")
						console.log("   Current richPresence data: " + thisPresence.devices[0].titles[i].activity.richPresence)
					}
				}
			}
		}
	}
} catch (e) {
	console.log("Error processing setTitle: " + e);
}
};

function pmUserData(sender){
	for (var i = 0; i < xboxUsers.length; i++)
		{
		   	thisClient.say(sender, 
	        xboxUsers[i].name + ": stateChange = " + xboxUsers[i].stateChange + ", " +
	        "titleChange = " + xboxUsers[i].titleChange + ", " +
	        "presenceChange = " + xboxUsers[i].presenceChange +
	        " state = " + xboxUsers[i].state + ", " +
	        "title = " + xboxUsers[i].title + ", " +
	        "presence = " + xboxUsers[i].presence);
		}
}

function scheduler() 
{
	var updateIntervalInMs = 1000 * 60 * updateIntevalInMins
	consoleLog("Starting xboxApiIrcAnnouncer module, updates every " + updateIntevalInMins + " minute(s).")
	setInterval(updateUser, updateIntervalInMs);
};

function consoleLog(operation)
{
	console.log("");
	console.log(":::... " + operation);
	console.log("");
};

module.exports = {
  updateUser: updateUser,
  scheduler: scheduler,
  getClient: getClient,
  pmUserData: pmUserData
}