"use strict"
// app/models/user.js

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let UserSchema = new Schema({
	rfid: String,
	name: String,
	gender: String,
	age: Number,
	weight: Number,
	height: Number,
	goal: {
		targetMuscles: Array,
		specialism: String
	},
	history: Array,
	admin: Boolean,
	maxes: Array
});

module.exports = mongoose.model("User", UserSchema);
