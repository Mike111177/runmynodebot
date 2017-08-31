//Parse command line.
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const colors = require('colors/safe');

function buildConfig({config, example}){
	let fpath;
	if (config){
		fpath = path.resolve(config);
	} else if (example){
		fpath = path.resolve(__dirname, 'examples', example, example+'.yml');
	} else {
		fpath = path.resolve(__dirname, 'hardware', 'defaults.yml');
	}
	console.log(colors.green('Loading hardware config:'), colors.white(path.basename(fpath)));
	let folder = path.resolve(fpath, '..');
	let conf = yaml.safeLoad(fs.readFileSync(fpath));
	conf.getFile = (file) => path.resolve(folder, file);
	return conf;
}

var argv = require('yargs')
// Command to create new config template.
.command('create', 'Create a new robot configuration file.', yargs => {
	yargs
	.usage('Usage: $0 create <filename>.yml')
	.demandCommand(1, 'Please specify a target file.');
}, argv => {// This will run when the create command runs
	fs.writeFileSync(path.resolve(argv._[1]), fs.readFileSync(path.resolve(__dirname, 'hardware', 'template.yml')));
	process.exit();// Not running the robot, don't continue.
})
// The command to run the robot.
.command('run', 'Run a robot', (yargs) => {
		yargs
		.usage('Usage: $0 run <robotid or cameraid> --[opts]')
		.options({
			//Bias option
			'bias': {
				describe: 'Use this if your robot is lopsided, positive numbers dampen the right side motors, and vice versa. Must be between -1 and 1.',
				type: 'number',
				group: 'Driving:'
			},
			//Speed
			'speed': {
				alias: 's',
				describe: 'Base motor speed (power). Must be between 0 and 255',
				type: 'number',
				group: 'Driving:'
			},
			'turn-speed': {
				describe: 'Base motor speed (power) when turning. Must be between 0 and 255, if left undefined will default to one half of --speed.',
				type: 'number',
				group: 'Driving:'
			},
			'straight-time': {
				describe: 'Set the time that the drive motors run when going straight. (Milliseconds)',
				type: 'number',
				group: 'Driving:'
			},
			'turn-time': {
				describe: 'Set the time that the drive motors run when turning. (Milliseconds)',
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
				choices: fs.readdirSync(__dirname + path.sep + 'tts_drivers').map(fname => fname.slice(0,-3)), //Reading from tts_drivers
				type: 'string',
				group: 'Text-To-Speech:'
			},
			'config': {
				alias: 'c',
				describe: 'Path to a robot configuration file you would like to use.',
				type: 'string',
				group: 'Hardware:'
			},
			'example': {
				alias: 'ex',
				describe: 'Use one of the examples from /examples as your robot configuration.',
				type: 'string',
				group: 'Hardware:'
			},
			//Debug options
			'repl':{
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
				implies: 'repl',
				group: 'Debugging:'

			},
			'enviroment':{
				alias: 'env',
				describe: 'Environment for example dev or prod, prod is default',
				type: 'string',
				choices: ['prod', 'dev'],
				default: 'prod',
				group: 'Debugging:'
			}
		})
		.string('_')
		.demandCommand(1, 'Please specify your RobotID or CameraID.')
		//Check that bias is between -1 and 1
		.check(({bias}) => {if (-1<=bias&&bias<=1||!bias) return true; else throw(new Error('Error: Bias must be between -1 and 1.'));})
		//Check that move-speed is between 0 and 255
		.check(({speed}) => {if (0<=speed && speed<=255||!speed) return true; else throw(new Error('Error: Speed must be between 0 and 255.'));})
		//Check that move times are greater than zero.
		.check((args) => {if ((0<=args['turn-time']||!args['turn-time']) && (0<=args['straight-time']||!args['straight-time'])) return true; else throw(new Error('Error: turn-time and straight-time must both be greater than 0.'));})
		//Check and build valid config format
		.check((args) => args.configuration = buildConfig(args));
}, argv => argv.run = true)
//Other options parse as strings
.string('_')
.demandCommand(1, 'Please run a command.')
.version()
.help()
.strict(true)
.epilog('For command specific help you can use: <command> --help')
.argv;

module.exports = argv;