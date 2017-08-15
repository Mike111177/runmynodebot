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
		plugin.instance = new plugin.module(plugin.config, argv.config.getFile, devices, robot);
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

var handling = false;

//Wait and then stop, default .5 seconds
function stop(delay=500){
	setTimeout(()=>{
		devices.M3.stop();
		devices.M4.stop();
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
			devices.M3.rev(255);
			stop(250); //After 1/4 second
			break;
		case 'FG': //Fire
			handling = true;
			devices.M4.rev(255);
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