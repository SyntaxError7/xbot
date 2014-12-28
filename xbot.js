var config = require('./config.json');
var irc = require('irc');
var admin = config.admin;

var getGameClipsCommand = "uploads"

console.log(":::");
console.log("::::: Starting Bot");
console.log(":::");

// ==============================================================
// Set bot options and connection arguments
// ==============================================================
var options = {
	port: 7000, 
	secure: true, 
	autoConnect: false, 
    showErrors: true, 
	certExpired: true, 
	selfSigned: true, 
    userName: '1101', 
	realName: '1011', 
	floodProtection: true, 
	floodProtectionDelay: 1000
}
	
var client = new irc.Client(config.network,
	config.nick,
	{
		channels: config.joinChannels
	},
	options
);	

// run statusAnnouncer Modules
var statusAnnouncer = require('./lib/statusAnnouncer');
statusAnnouncer.getClient(client);
statusAnnouncer.scheduler();

// make getGameclip available
var gameClips = require('./lib/getGameClips');
gameClips.getClient(client);


// ========================================================
// PM listener
// ========================================================	
client.addListener('pm', function (from, message) {
    console.log(from + ' => ME: ' + message);
	if (message === 'update' && from === admin){
		statusAnnouncer.updateUser();
	};
	if (message === 'getUserData' && from === admin){
		statusAnnouncer.pmUserData(from);
	};
});
// ========================================================
// Message listener
// ========================================================	
client.addListener('message', function(from, to, message) {
  console.log(from + ' => ' + to + ': ' + message);
  	if (message.substring(0,getGameClipsCommand.length) === getGameClipsCommand)
		gameClips.getGameClips(to, message.substring(getGameClipsCommand.length + 1));
});