"use strict"
// config.js

class Config {
	constructor () {
		// port which the api runs on
		this.port = 8080;
		
		// database that api connects to
		this.database = "mongodb://127.0.0.1:27017";
		
		// apparatus available in gym
		this.apparatus = ["Split", "Apparatus", "With", "Commas"];
		
		// possible muscles that can be worked out
		this.muscles = ["Split", "Muscles", "With" "Commas"];
		
		// secret used in json web tokens
		this.secret = "changeme";
		
		// time taken for a token to expire in minutes
		this.tokenTimeout = 60;
	}
}

module.exports = new Config();
