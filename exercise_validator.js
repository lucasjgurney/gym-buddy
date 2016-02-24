"use strict"
// exercise_validator.js
let out = require("./outputs");
let config = require("./config")

// validate user input
class ExerciseValidator {
	constructor () {
		this.validateExercise = (exercise) => {
			// validate name
			let name = exercise.name;
			if (typeof name !== "string") {
				return "Name is not a string";
			}
			if (name.length < 1) {
				return "Name must not be blank";
			}
			
			// validate apparatus
			let apparatus = exercise.apparatus;
			if (typeof apparatus !== "string") {
				return "Apparatus is not a string";
			}
			if (config.apparatus.indexOf(apparatus) === -1) {
				return "Apparatus does not match any in gym";
			}
				
			// validate muscles
			let muscles = exercise.muscles;
			if (!muscles instanceof Array) {
				return "Muscles is not an array";
			}
			if (muscles.length < 1) {
				return "Muscles must not be blank";
			}
			for (let i = 0; i < muscles.length; i++) {
				let muscle = muscles[i];
				if (typeof muscle !== "string") {
					return "Muscle " + (i + 1) + " wasn't a string";
				}
				if (config.muscles.indexOf(muscle) === -1) {
					return "Muscle " + (i + 1) + " not in valid list of muscles";
				}
			}
					
			// validate steps
			let steps = exercise.steps;
			if (!steps instanceof Array) {
				return "Steps is not an array";
			}
			if (steps.length < 1) {
				return "Steps must not be blank";
			}
			for (let i = 0; i < steps.length; i++) {
				let step = steps[i];
				if (typeof name !== "string") {
					return "Step " + (i + 1) + " is not a string";
				}
				if (name.length < 1) {
					return "Step " + (i + 1) + " must not be blank";
				}
			}
				
			return false;
		}
	}
}

module.exports = new ExerciseValidator();
