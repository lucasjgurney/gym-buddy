"use strict"
// outputs.js

let colors = require("colors");

class Outputs {
	constructor () {
		this.info = (msg) => {
			return console.log("INFO".bgYellow + " " + msg);
		}
		
		this.ok = (msg) => {
			return console.log("OK".bgGreen + " " + msg);
		}
		
		this.error = (msg) => {
			return console.log("ERROR".bgRed + " " + msg);
		}
		
		this.req = (method, msg) => {
			return console.log(method.bgCyan + " " + msg);
		}
	}
}

module.exports = new Outputs();
