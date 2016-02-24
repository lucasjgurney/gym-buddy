"use strict"
// app/models/exercise.js

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ExerciseSchema = new Schema({
	name: String,
	apparatus: String,
	muscles: Array,
	steps: Array
});

module.exports = mongoose.model("Exercise", ExerciseSchema);