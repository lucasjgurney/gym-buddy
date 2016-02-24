"use strict"
// user_validator.js
let out = require("./outputs");
let config = require("./config")

// validate user input
class UserValidator {
	constructor () {
		this.validateUser = (user) => {
			// validate rfid
			let rfid = user.rfid;
			if (typeof rfid !== "string") {
				return "RFID is not a string";
			}
			if (rfid.length < 1) {
				return "RFID cannot be blank";
			}
			
			// validate name
			let name = user.name;
			if (typeof name !== "string") {
				return "Name is not a string";
			}
			if (name.length < 1) {
				return "Name cannot be blank";
			}
			if (name.length > 20) {
				return "Name cannot be more than 20 characters";
			}
			
			// validate gender
			let gender = user.gender;
			if (typeof gender !== "string") {
				return "Gender is not a string";
			}
			if (gender !== "m" && gender !== "f") {
				return "Gender must be male or female";
			}
			
			// validate age
			let age = user.age;
			if (typeof age !== "number") {
				return "Age is not a number";
			}
			if (age <= 0) {
				return "Age must be above 0";
			}
			
			// validate weight
			let weight = user.weight;
			if (typeof weight !== "number") {
				return "Weight is not a number";
			}
			if (weight <= 0) {
				return "Weight must be above 0kg";
			}
			
			// validate height
			let height = user.height;
			if (typeof height !== "number") {
				return "Height is not a number";
			}
			if (height <= 0) {
				return "Height must be above 0cm";
			}
				
			// validate goal
			let goal = user.goal;
			if (typeof goal !== "object") {
				return "The goal must be an object";
			}
			// validate goal muscles
			let goalMuscles = goal.targetMuscles;
			if (!goalMuscles instanceof Array) {
				return "Goal muscles is not an array";
			}
			if (goalMuscles.length < 1) {
				return "Goal muscles must not be blank";
			}
			for (let i = 0; i < goalMuscles.length; i++) {
				let muscle = goalMuscles[i];
				if (typeof muscle !== "string") {
					return "Goal muscle " + (i + 1) + " wasn't a string";
				}
				if (config.muscles.indexOf(muscle) === -1) {
					return "Goal muscle " + (i + 1) + " not in valid list of muscles";
				}
			}
			// validate goal specialism
			let goalSpecialism = goal.specialism;
			if (typeof goalSpecialism !== "string") {
				return "Goal specialism is not a string";
			}
			if (goalSpecialism !== "b" && goalSpecialism !== "e" && goalSpecialism !== "p" && goalSpecialism !== "s") {
				return "Goal specialism must be body building, endurance, power, or strength.";
			}
			
			// validate admin status
			let admin = user.admin;
			if (typeof admin !== "boolean") {
				return "Admin status is not a Boolean.";
			}
			
			return false;
		}
	}
}

module.exports = new UserValidator();
