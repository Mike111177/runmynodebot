#!/usr/bin/env node
const colors = require('colors/safe');

var argv = require('./cli-args');
var config = argv.configuration;

//Load plugins.
var plugins = {};
if (config.plugins){
	let names = Object.keys(config.plugins);
	names.forEach((name)=>{
		let conf = config.plugins[name];
		let mpath = conf.path;
		let module;
		if (mpath) {
			module = require(config.getFile(mpath));
		} else {
			module = require('./plugins/' + name);
		}
		plugins[name] = {
				name: name,
				module: module,
				config: conf
		};
		console.log(colors.green('Plugin loaded:'), colors.white(name+(mpath?' ('+mpath+')':'')));
	});
}

var robot;

if (!argv['no-connect']){
	// Server connection setup
	const io = require('./RobotIO');
	robot = new io({robotID: argv._[1].toString()});
} else {
	// If the no-connect flag was set, just have robot be a dud event emitter that can be used for debugging.
	const EventEmitter = require('events');
	robot = new EventEmitter();
}

//Motor setup (Adafruit motorhat with four reversable dc motors and four servos)
const five = require("johnny-five");
const Raspi = require("raspi-io");

var motors, servos, drive_man;

const drive_mode = require('./drive_modes/'+config.driving.mode);

var devices;

const hw = require('./hardware/config');
hw(config, argv.repl).then((hardware)=>{
	devices = hardware;
	
	// Initializing drive manager with selected drive mode.
	let drive_opts = {};
	// Command line arguments overwrite config values.
	let drive_args = ['bias', 'speed', 'turn-time', 'straight-time'].reduce((acc, key) => {
		if (argv[key]){
			acc[key] = argv[key];
		} 
		return acc;
	}, {});
	Object.assign(drive_opts, config.driving, drive_args);
	drive_man = new drive_mode(drive_opts, config.getFile, devices, robot);
	
	//Initialize plugins.
	Object.keys(plugins).forEach(name =>{
		plugin = plugins[name];
		plugin.instance = new plugin.module(plugin.config.options, config.getFile, devices, robot);
	});
	if (argv.repl){
		hardware.repl.inject({robot: robot, plugins: plugins, drive_man: drive_man});
	}
});

// If verbose, output command data.
if (argv.verbose) robot.on('command_to_robot', console.log);

//Setting up tts
const say = require('./tts_drivers/'+argv['tts-driver']);

const urlfilter = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/i; //Regex url string.
robot.on('chat_message_with_name', data => {
	if (data.message.search(urlfilter)===-1 && (!data.anonymous || argv['allow-anon-tts'])) {  //If no urls and not anonymous (or anon tts enabled)
		say(data.message.slice(data.message.indexOf(']')+2));
	}
});