#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

//Parse command line.
var argv = require('yargs')
	.usage('usage: sudo node $0 <robot-ID> [--opts]')
	.options({
		//Drive mode option
		'drive-mode': {
			describe: 'Command parser used for movement motors.',
			choices: fs.readdirSync(__dirname + path.sep + 'drive_modes').map(fname => {return fname.slice(0,-3);}), //Reading from drive_modes
			default: 'fcfs_tank',
			type: 'string',
			group: 'Driving:'
		},
		//Bias option
		'bias': {
			describe: 'Use this if your robot is lopsided, positive numbers dampen the right side motors, and vice versa. Must be between -1 and 1.',
			default: 0,
			type: 'number',
			group: 'Driving:'
		},
		//Speed
		'speed': {
			alias: 's',
			describe: 'Base motor speed (power). Must be between 0 and 255',
			default: 255,
			type: 'number',
			group: 'Driving:'
		},
		'straight-time': {
			describe: 'Set the time that the drive motors run when going straight. (Milliseconds)',
			default: 500,
			type: 'number',
			group: 'Driving:'
		},
		'turn-time': {
			describe: 'Set the time that the drive motors run when turning. (Milliseconds)',
			default: 500,
			type: 'number',
			group: 'Driving:'
		},
		'allow-anon-tts':{
			describe: 'Allow anonymous users to use tts without a login.',
			default: false,
			type:'boolean',
			group: 'Text-To-Speech:'
		},
		'tts-driver':{
			describe: 'Choose which tts engine to use.',
			default: 'espeak',
			choices: fs.readdirSync(__dirname + path.sep + 'tts_drivers').map(fname => {return fname.slice(0,-3);}), //Reading from tts_drivers
			type: 'string',
			group: 'Text-To-Speech:'
		},
		'config': {
			alias: 'c',
			describe: 'Path to a robot configuration file you would like to use.',
			normalize: true,
			type: 'string',
			group: 'Hardware:'
		},
		//Debug options
		'repl':{
			alias: ['debug', 'd'],
			describe: 'Enable repl server. Not reccomended for headless operation.',
			type: 'boolean',
			group: 'Debugging:'
		},
		'verbose':{
			alias: 'v',
			describe: 'Print each command sent to robot on console.',
			type: 'boolean',
			group: 'Debugging:'
		},
		'no-connect': {
			describe: 'Don\'t connect to letsrobot.tv. This is usefull for offline hardware debugging. Requires --repl',
			type: 'boolean',
			group: 'Debugging:'
		}
	})
	//Check that bias is between -1 and 1
	.check(({bias}) => {if (-1<=bias&&bias<=1) return true; else throw(new Error('Error: Bias must be between -1 and 1.'));})
	//Check that move-speed is between 0 and 255
	.check(({speed}) => {if (0<=speed && speed<=255) return true; else throw(new Error('Error: Speed must be between 0 and 255.'));})
	//Check that move times are greater than zero.
	.check((args) => {if (0<=args['turn-time'] && 0<=args['straight-time']) return true; else throw(new Error('Error: turn-time and straight-time must both be greater than 0.'));})
	//Check for valid config format
	.check(({config}) => {if (!config || config.endsWith('.yml') || config.endsWith('.json')) return true; else throw(new Error('Error: config file must be yaml compatibale files. (.yml or .json)'));})
	//Argument debug. --yargs
	.check((args) => {if (!args.yargs) return true; else {console.log(args); throw('yarg');}})
	//Other options parse as strings
	.string('_')
	.demandCommand(1)
	.version()
	.help()
	.argv;

const EventEmitter = require('events');
var robot;

if (!argv['no-connect']){
	// Server connection setup
	const io = require('./RobotIO');
	robot = new io({robotID: argv._[0]});
} else {
	// If the no-connect flag was set, just have robot be a dud event emitter that can be used for debugging.
	robot = new EventEmitter();
}

//Motor setup (Adafruit motorhat with four reversable dc motors and four servos)
const five = require("johnny-five");
const Raspi = require("raspi-io");

var motors, servos, drive_man;
const board = new five.Board({
	io: new Raspi(),
	repl: argv.debug
});

const drive_mode = require('./drive_modes/'+argv['drive-mode']);

board.on('ready', function() {
	//Setting up dc motors 1-4
	//From https://github.com/rwaldron/johnny-five/blob/master/lib/motor.js#L848
	let mcfg = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;
	motors = new five.Motors([mcfg.M1, mcfg.M2, mcfg.M3, mcfg.M4]);
	
	//Initializing drive manager with selected drive mode.
	drive_man = new drive_mode({left: motors[1], right: motors[0]}, {
		bias: argv.bias,
		turn_time: argv['turn-time'],
		drive_time: argv['drive-time'],
		speed: argv.speed
	});

	if (argv.debug){
		this.repl.inject({
			drive_man: drive_man,
			motors: motors
		});
	}
});


//Setting up command handler

var handling = false;

//Wait and then stop, default .5 seconds
function stop(delay=500){
	setTimeout(()=>{
		motors[2].stop();
		motors[3].stop();
		handling = false;
	}, delay);
}

//Motors 1 and 2 (0 and 1) are drive motors, 3 and 4 (2 and 3) are accessories.
robot.on('command_to_robot', data => {
	if (argv.verbose){
		console.log(data);
	}
	
	//Run the command through the drive manager first, if then if it was not a valid command 
	//and we are not handling another command at the moment, run the command here.
	//This allows for simultaneous control of motors for movement and accessories.
	//The drive manager must have it's own method for handling multiple commands to the drive motors.
	if (!(drive_man.handle_command(data) || handling)){
		switch (data.command){
		case 'LL': //Aim
			handling = true;
			motors[2].rev(255);
			stop(250); //After 1/4 second
			break;
		case 'FG': //Fire
			handling = true;
			motors[3].rev(255);
			stop(4500); //After 4.5 second
			break;
		}
	}
});

//Setting up tts
const say = require('./tts_drivers/'+argv['tts-driver']);

const urlfilter = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/i; //Regex url string.
robot.on('chat_message_with_name', data => {
	if (data.message.search(urlfilter)===-1 && (!data.anonymous || argv['allow-anon-tts'])) {  //If no urls and not anonymous (or anon tts enabled)
		say(data.message.slice(data.message.indexOf(']')+2));
	}
});