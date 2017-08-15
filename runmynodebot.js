#!/usr/bin/env node
var argv = require('./cli-args');

//Load plugins.
var plugins = {};
if (argv.config.plugins){
	let names = Object.keys(argv.config.plugins);
	names.forEach((name)=>{
		let config = argv.config.plugins[name];
		let mpath = config.path;
		let module;
		if (mpath) {
			module = require(argv.config.getFile(mpath));
		} else {
			module = require('./plugins/' + name);
		}
		plugins[name] = {
				name: name,
				module: module,
				config: config
		};
	});
}

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

const drive_mode = require('./drive_modes/'+argv['drive-mode']);

var devices;

const hw = require('./hardware/config');
hw(argv.config, argv.repl).then((hardware)=>{
	devices = hardware;
	
	//Initialize plugins.
	Object.keys(plugins).forEach(name =>{
		plugin = plugins[name];
		plugin.instance = new plugin.module(plugin.config.options, argv.config.getFile, devices, robot);
	});
	
	//Initializing drive manager with selected drive mode.
	drive_man = new drive_mode({left: devices.M2, right: devices.M1}, {
		bias: argv.bias,
		turn_time: argv['turn-time'],
		drive_time: argv['drive-time'],
		speed: argv.speed
	});
});

//Setting up command handler
robot.on('command_to_robot', data => {
	if (argv.verbose){
		console.log(data);
	}
	drive_man.handle_command(data);
});

//Setting up tts
const say = require('./tts_drivers/'+argv['tts-driver']);

const urlfilter = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/i; //Regex url string.
robot.on('chat_message_with_name', data => {
	if (data.message.search(urlfilter)===-1 && (!data.anonymous || argv['allow-anon-tts'])) {  //If no urls and not anonymous (or anon tts enabled)
		say(data.message.slice(data.message.indexOf(']')+2));
	}
});