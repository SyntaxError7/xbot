Requirements:
====
Node.js for Core

Node Modules 'irc' and 'async' for functionality

xboxapi.com api key (free, requires account, 120 uses per hour)

bit.ly api key (free, requires account)


Config:
===
config.json - bot name, irc network, channels to join, admin user

xboxApiConfig.json - api keys, users, update interval, announcement channel(s)



Use:
===
run command: node xbot.js


PM Commands:
===

(from admin)

update (run updater manually)
getUserData (view currently set user variables via PM)

Channel Commands:
============

(any user)
uploads <gamertag> - get last X clips uploaded by user
	currently only works on users already defined in config



To Do:
============
clean up getClips.js - poor use of async for code flow

add ability to lookup any gamertag for uploads, will require api call to get XUID for <gamertag>, then call for upload data

database functions for storing data, gamerscore, etc.


