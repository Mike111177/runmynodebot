//Parse command line.
var argv = require('yargs')
	.usage('usage: sudo node $0 <robot-ID> [--opts]')
	.boolean('debug').describe('debug', 'Enable server output and repl server. Not reccomended for headless operation.')
	.string('_')
	.demandCommand(1)
	.help()
	.argv;

//Server connection setup
const io = require('./RobotIO');
var robot = new io({robotID: argv._[0]});

//Motor setup (Adafruit motorhat with four reversable dc motors and four servos)
const five = require("johnny-five");
const Raspi = require("raspi-io");

var motors, servos;
const board = new five.Board({
	io: new Raspi(),
	repl: argv.debug
});

board.on('ready', function() {
	//Setting up dc motors 1-4
	//From https://github.com/rwaldron/johnny-five/blob/master/lib/motor.js#L848
	let mcfg = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;
	motors = new five.Motors([mcfg.M1, mcfg.M2, mcfg.M3, mcfg.M4]);

	//Setting up servo motors 1-4
	servos = [
		//S1
		new five.Servo({
			address: 0x60,
			controller: "PCA9685",
			pin: 0,
		}),
		//S2
		new five.Servo({
			address: 0x60,
			controller: "PCA9685",
			pin: 1,
		}),
		//S3
		new five.Servo({
			address: 0x60,
			controller: "PCA9685",
			pin: 14,
		}),
		//S4
		new five.Servo({
			address: 0x60,
			controller: "PCA9685",
			pin: 15,
		})];

	if (argv.debug){
		this.repl.inject({
			motors: motors,
			servos: servos
		});
	}
});


//Setting up command handler

var handling = false;

//Wait and then stop, default .5 seconds
function stop(delay=500){
	setTimeout(()=>{
		motors.stop();
		handling = false;
	}, delay);
}

//Motors 1 and 2 (0 and 1) are drive motors, 3 and 4 (2 and 3) are accessories.
robot.on('command_to_robot', data => {
	if (argv.debug){
		console.log(data);
	}
	if (!handling){
		handling = true;
		switch (data.command){
		case 'F': //Forwards
			motors[0].fwd(255);
			motors[1].fwd(255);
			stop();
			break;
		case 'B': //Reverse
			motors[0].rev(255);
			motors[1].rev(255);
			stop();
			break;
		case 'L': //Left
			motors[0].fwd(128);
			motors[1].rev(128);
			stop();
			break;
		case 'R': //Right
			motors[0].rev(128);
			motors[1].fwd(128);
			stop();
			break;
		case 'LL': //Aim
			motors[2].rev(255);
			stop(250); //After 1/4 second
			break;
		case 'FG': //Fire
			motors[3].rev(255);
			stop(4000); //After 1 second
			break;
		default:
			stop(0); //Not valid command. Continue
		break;
		}
	}
});

//Setting up tts
//const os = require('os');
//const path = require('path');

//const temp = os.tmpdir();

//const urlfilter = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/i //Regex url string.
//robot.on('chat_message_with_nam', data => {
//if (urlfilter.search(data.message)===-1 && !data.anonymous) {  //If no urls and not anonymous

//}
//});
