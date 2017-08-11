//Parse command line.
const fs = require('fs');
const path = require('path');
module.exports = require('yargs')
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
		'example': {
			alias: 'ex',
			describe: 'Use one of the examples from /examples as your robot configuration.',
			type: 'string',
			group: 'Hardware:',
			conflicts: 'config'
		},
		//Debug options
		'repl':{
			alias: ['debug', 'd'],
			describe: 'Enable repl server. Not reccomended for headless operation.',
			type: 'boolean',
			group: 'Debugging:'
		},
		'vserbose':{
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