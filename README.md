xbot
initial commit: 12/27/2014
added getGameClips: 12/27/2014
====

Requirements:
============
Node.js
Node Modules
	irc
	async

xboxapi.com api key (free, 120 uses per hour)


Config:
============
config.json - bot name, irc network, channels to join, admin user

xboxApiConfig.json - api key, users, update interval, announcement channel(s)



Use:
============
run command: node xbot.js


PM Commands:
============

(from admin)

update (run updater manually)
getUserData (view currently set user variables via PM)

Channel Commands:
============

(any user)
uploads <gamertag> - get last X clips uploaded by user
	currently only works on users already defined in config
		(requires gamertag to xuid lookup calls added)



To Do:
============
clean up getClips.js - poor use of async for method flow (async but then popping off an array for data)

getClips.js not priminig properly, first use only shows on clip, rest are fine. (somethin with .pop()?  )
