"use strict"
// server.js

//SETUP

console.log(`
     \` .:.        ....\`          +.                                                   
   :#;;;;;'.    .';;;;;':       +@@#                                                  
   .;;;;;;;;'  +;;;;;;;;:       @@@@                                                  
   :;;;#;;;;;  ;;;;;#;;;;       @@@#                                                  
   \`;;;;;@;;;:.;;;#;;;;;,    ,@@@@@.                                                  
    ;;;;;;;';  ;',;;;;;;    \`@@@@'.                                                   
    ,;;;;;;;    ,;;;;;;;    @@@@#                                                     
     ,;;;;;;    \`;;;;;:    @@@@@#                                                     
       ';'\`       ';+     @@@@@@#                                                     
       \`'' :''''. ,\`     ;@#@@@@.                                                     
      ''''\`''''''.'''+    @@@@@@                                                      
     '''+  '''''', ''''   @@@@@@+\`\`:                                                  
     '''   \`'''':   '''    @@@@+#@@@                                                  
    ;', .'''    '''' +'   \`@@@@.                                                      
       +'''''  ''''''     #@@@@     @@@@@  ;        @                  .              
   ,' .''''''\`.''''''+ '\` @@@@@     @; \`@+ @        @                  @;             
   '' ''''''':.''''''':'' #@@@@;    @;  +@ @        @     @@:@ ,@@  @@\`@@@ @+@ @@@@.  
  ''' '''''''  ''''''',''#@@@@@@    @;  @@ @ ++@    @    @+ @@ @ :@;@  @.; @#'#@ '@   
  ''' '''''''  +'''''' '''@@@@@@    @@@@@  @ @++    @    @   @;@@@@ @@ @   @  @.  @   
  '''  '''''    ''';'\` ''+#@@@@@    @;     @        @    @. #@.@  '  @ @   @  @@ \`@   
  ;':  .''' ''''\`.@@.  ''\` @@@@@    @;     @        @@@@;,@@+@ @@@@ @@ @@@ @   @@@@.  
   '       ;'''''@@@@@@@@@@@@#@@.                                                     
    ''''  ''''''#@@@###@@@@@@:@@:                                                     
    ''''; ''''''@# '''''   .: '@#                                                     
    ''''' '''''''':'''''      .@@                                                     
    '''''' ;'''''\`''''''       @@                                                     
     '''''  +'''  '''''        @@\`                                                    
      '''+        ''''         #@'                                                    
           +'''''\`              @#                                                    
          '''''''+              #@                                                    
           ''''''                @.                                                   
            \`##                  @@@@@#                                               
                                ,@@@@@                                                
                                 @#'\`
`);

// call relevant packages
let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let morgan = require("morgan");
let mongoose = require("mongoose");
let colors = require("colors");

// json web tokens
let jwt = require("jsonwebtoken")

// models
let Exercise = require("./models/exercise");
let User = require("./models/user");

// special color functions
let out = require("./outputs");

// config file
let config;
try {
	config = require("./config");
} catch (e) {
	out.error("Couldn't connect to config file");
	process.exit();
}

// allow app to use bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan
app.use(morgan("dev"))

// connect to database
mongoose.connect(config.database);

// set port
let port = process.env.PORT || config.port;

// input validation
let exerciseValidator = require("./exercise_validator").validateExercise;
let userValidator = require("./user_validator").validateUser;

// ROUTER
let router = express.Router();

// info and cors middleware
router.use((req, res, next) => {
	console.log();
	out.req(req.method, "Request sent to " + req.url);
	
	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
	
	next();
});

router.route("/authenticate")
	// authenticate a user
	.post((req, res) => {
		
		// find user
		User.findOne({
			rfid: req.body.rfid
		}, (e, user) => {
			if (e) {
				out.error(error);
				res.json({error: error});
			} else {
				// create a token
				let token = jwt.sign(user, config.secret, {
					expiresIn: config.tokenTimeout * 60
				});
				
				// return token
				res.json({
					success :true,
					message: "Token sent",
					token: token,
					userName: user.name,
					userId: user._id
				});
			}
			
			if (!user) {
				res.json({
					success: false,
					message: "Invalid password."
				});
			}
		});
	});

// authentication middleware
router.use((req, res, next) => {
	let token = req.body.token || req.query.token || req.headers["x-access-token"];
	
	// decode token
	if (token) {
		jwt.verify(token, config.secret, (e, decoded) => {
			if (e) {
				res.json({error: e});
				return out.error("Token not valid");
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		out.error("No token specified.");
		res.json({message: "No token specified."});
	}
});

router.get("/", (req, res) => {
	res.json({message: "API response is :)"});
});

router.route("/exercises")
	// create a new exercise
	.post((req, res) => {
		out.info("Creating new exercise");
		let exercise = new Exercise();
		let inData = req.body;
		
		exercise.name = inData.name;
		exercise.apparatus = inData.apparatus;
		exercise.muscles = inData.muscles;
		exercise.steps = inData.steps;
		
		// validate input
		let error = exerciseValidator(req.body);
		
		if (!error) {
			// input okay, save it
			out.info("Input is valid, updating database...");
			
			exercise.save((e) => {
				if (e) {
					res.json({error: e});
					out.error("Error updating exercise");
				}
				
				out.ok("Exercise updated");
				res.json({message: "Exercise updated"});
			});
		} else {
			out.error(error);
			res.json({error: error});
		}
	})
	
	// view all exercises
	.get((req, res) => {
		Exercise.find((e, exercises) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			out.ok("Retrieved exercise");
			res.json(exercises);
		});
	});
	
router.route("/exercises/:exercise_id")
	// get specific exercise data
	.get((req, res) => {
		Exercise.findById(req.params.exercise_id, (e, exercise) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			out.ok("Retrieved data");
			res.json(exercise);
		});
	})
	
	// modify an exercise
	.put((req, res) => {
		Exercise.findById(req.params.exercise_id, (e, exercise) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			let body = req.body;
			exercise.name = body.name || exercise.name;
			exercise.apparatus = body.apparatus || exercise.apparatus;
			exercise.muscles = body.muscles || exercise.muscles;
			exercise.steps = body.steps || exercise.steps;
			
			// validate input
			let error = exerciseValidator(exercise);
			
			if (!error) {
				// input okay, save it
				out.info("Input is valid, updating database...");
				
				exercise.save((e) => {
					if (e) {
						res.json({error: e});
						out.error("Error updating exercise");
					}
					
					out.ok("Exercise updated");
					res.json({message: "Exercise updated"});
				});
			} else {
				out.error(error);
				res.json({error: error});
			}
		});
	})
	
	// delete an exercise
	.delete((req, res) => {
		Exercise.remove({
			_id: req.params.exercise_id
		}, (e, exercise) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			out.ok("Deleted exercise");
			res.json(exercise);
		});
	});
	
router.route("/users")
	// create a user
	.post((req, res) => {
		out.info("Creating new user");
		let user = new User();
		let inData = req.body;
		
		user.rfid = inData.rfid;
		user.name = inData.name;
		user.gender = inData.gender;
		user.age = inData.age;
		user.weight = inData.weight;
		user.height = inData.height;
		user.goal = {
			targetMuscles: inData.goal.targetMuscles,
			specialism: inData.goal.specialism
		};
		user.history = [];
		user.admin = false;
		
		
		// validate input
		let error = userValidator(user);
		
		if (!error) {
			// input okay, save it
			
			out.info("Input is valid, saving to database...");
			
			user.save((e) => {
				if (e) {
					res.json({error: e});
					out.error("Error saving user");
				}
				
				out.ok("User created");
				res.json({message: "User created"});
			});
		} else {
			out.error(error);
			res.json({error: error});
		}
	})
	
	// get all users
	.get((req, res) => {
		User.find({}, (e, users) => {
			res.json(users)
		});
	})
	
router.route("/users/:user_id")
	// get specific user data
	.get((req, res) => {
		User.findById(req.params.user_id, (e, user) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			out.ok("Retrieved data");
			res.json(user);
		});
	})
	
	// modify a user
	.put((req, res) => {
		User.findById(req.params.user_id, (e, user) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			let body = req.body;
			user.rfid = body.rfid || user.rfid;
			user.name = body.name || user.name;
			user.gender = body.gender || user.gender;
			user.age = body.age || user.age;
			user.weight = body.weight || user.weight;
			user.height = body.height || user.height;
			if (user.hasOwnProperty("goal")) {
				user.goal = {
					targetMuscles: body.goal.targetMuscles || user.goal.targetMuscles,
					specialism: body.goal.specialism || user.goal.specialism
				};
			} else {
				user.goal = user.goal;
			}
			//user.history = [];
			//user.maxes = [];
			//user.admin = false;
			
			// validate input
			let error = userValidator(user);
			
			if (!error) {
				// input okay, save it
				out.info("Input is valid, updating database...");
				
				user.save((e) => {
					if (e) {
						res.json({error: e});
						out.error("Error updating user");
					}
					
					out.ok("User updated");
					res.json({message: "User updated"});
				});
			} else {
				out.error(error);
				res.json({error: error});
			}
		});
	})
	
	// delete a user
	.delete((req, res) => {
		User.remove({
			_id: req.params.user_id
		}, (e, user) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			out.ok("Deleted user");
			res.json(user);
		});
	});
	
router.route("/users/:user_id/maxes")
	// modify max data
	.put((req, res) => {
		User.findById(req.params.user_id, (e, user) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			let exercise = req.body.exercise;
			let oneRepMax = parseInt(req.body.oneRepMax);
			
			if (typeof exercise !== "string") {
				out.error("Exercise not valid");
				return res.json({message: "Exercise must be a valid number"});
			}
			
			if (typeof oneRepMax !== "number") {
				out.error("1RM not valid");
				return res.json({message: "1RM must be a valid number"});
			}
			
			let maxes = user.maxes;
			let found = false;
			for (let i = 0; i < maxes.length; i++) {
				if (maxes[i].exercise == exercise) {
					maxes[i].oneRepMax = oneRepMax;
					found = true;
					user.markModified("maxes");
				}
			}
			if (!found) {
				maxes.push({
					exercise: exercise,
					oneRepMax: oneRepMax
				});
			}
				
			user.save((e) => {
				if (e) {
					res.json({error: e});
					out.error("Error updating 1RM values");
				}
				
				out.ok("1RM values updated");
				res.json({message: "1RM values updated"});
			});
		});
	});
	
router.route("/trainer/max")
	.post((req, res) => {
		let r = parseInt(req.body.reps);
		let w = parseInt(req.body.weight);
		
		// validate input
		//if (typeof r !== "number") {
		if (isNaN(r)) {
			out.error("Reps not valid");
			return res.json({message: "Reps must be a valid number"});
		}
		
		if (typeof w !== "number") {
			out.error("Weight not valid");
			return res.json({message: "Weight must be a valid number"});
		}
		
		let oRMEstimates = [];
		
		// Epley formula
		oRMEstimates.push(w * (1 + (r / 30)));
		
		// Brzycki formula
		oRMEstimates.push(w * (36 / (37 - r)));
		
		// Lander formula
		oRMEstimates.push((100 * w) /  (101.3 - 2.67123 * r));
		
		// Lombardi formula
		oRMEstimates.push(w * Math.pow(r, 0.1));
		
		// Mayhew et al. formula
		oRMEstimates.push((100 * w) / (52.2 + 41.9 * Math.pow(Math.E, -0.055 * r)));
		
		// O'Conner et al. formula
		oRMEstimates.push(w * (1 + 0.025 * r));
		
		// Wathen formula
		oRMEstimates.push((100 * w) / (48.8 + 53.8 * Math.pow(Math.E, -0.075 * r)));
		
		// calculate mean
		let oRMSum = 0;
		for (let i = 0; i < oRMEstimates.length; i++) {
			oRMSum += oRMEstimates[i];
		}
		
		let oneRepMax = oRMSum / oRMEstimates.length;
		
		out.ok("Calculated 1RM");
		res.json({
			oneRepMax: oneRepMax,
			oRMBreakdown: oRMEstimates
		});
	});
	
router.route("/trainer/suggest")
	.get((req, res) => {
		let user = req.decoded._doc;
		
		// find all exercises affecting relevant muscle groups
		let potentialTargets = user.goal.targetMuscles;
		Exercise.find((e, exercises) => {
			if (e) {
				out.error(e);
				res.json({error: e});
			}
			
			let exerciseShortlist = [];
			for (let exercise of exercises) {
				for (let muscle of exercise.muscles) {
					if (potentialTargets.indexOf(muscle) !== -1) {
						exerciseShortlist.push(exercise);
					}
				}
			}
			
			// idea: look through history
			
			// pick exercise from shortlist
			let exercise;
			let oneRepMax;
			do {
				// get 1RM
				let index = Math.floor(Math.random() * exerciseShortlist.length);
				exercise = exerciseShortlist[index];
				
				for (let i = 0; i < user.maxes.length; i++) {
					if (user.maxes[i].exercise == exercise._id) {
						oneRepMax = user.maxes[i].oneRepMax;
					}
				}
				
				exerciseShortlist.splice(index, 1);
				
				if (!exerciseShortlist.length && !oneRepMax) {
					out.error("No valid 1RM values");
					return res.json({
						message: "There are no valid exercises you have one rep maxes for, please estimate some more values",
						success: false
					});
				}
			} while (!oneRepMax);
			
			// calculate based on goal
			let minLoad, maxLoad;
			
			let specialism = user.goal.specialism;
			switch (specialism) {
				case "b":
					minLoad = 67;
					maxLoad = 85;
					break;
				case "e":
					minLoad = 30;
					maxLoad = 67;
					break;
				case "p":
					minLoad = 75;
					maxLoad = 90;
					break;
				case "s":
					minLoad = 85;
					maxLoad = 100;
					break;
			}
			
			let loadAsPercent = (Math.floor(Math.random() * (maxLoad - minLoad + 1)) + minLoad) / 100;
			let load = Math.round(loadAsPercent * oneRepMax);
			//let reps = Math.round((37 - (36 * load)) / oneRepMax); // Brzycki formula
			let reps = -30.3030303 + ((30.3030303 * oneRepMax) / load) // Baechle formula
			
			// calculate sets
			let sets;
			switch (specialism) {
				case "b":
					if (reps <= 8) {
						sets = 4;
					} else if (reps > 8 && reps < 12) {
						sets = 3;
					} else if (reps >= 12) {
						sets = 2;
					}
					break;
				case "e":
					if (reps <= 12) {
						sets = 3;
					} else if (reps >= 13) {
						sets = 2;
					}
					break;
				case "p":
					if (reps <= 5) {
						sets = 5;
					} else if (reps > 5 && reps <= 7) {
						sets = 4;
					} else if (reps > 7) {
						sets = 3;
					}
					break;
				case "s":
					if (reps <= 3) {
						sets = 8;
					} else if (reps > 3 && reps < 5) {
						sets = 6;
					} else if (reps >= 5) {
						sets = 3;
					}
					break;
			}
			
			out.ok("Suggested exercise");
			res.json({
				exercise: exercise,
				sets: sets,
				reps: reps,
				load: load
			});
		});
	});


// REGISTER ROUTES
app.use("/api", router);

// SERVE STATIC CONTENT
app.use("/static", express.static(__dirname +  "/public"));

// START SERVER
app.listen(port);
out.ok("API running on port " + port);
