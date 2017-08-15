const { exec } = require('child_process');
const path = require('path');

class Sounds {
	
	constructor(config, getFile, devicemap, robot){
		this.commands = {};
		for (var command in config){
			let file = getFile(config[command]);
			if (!file.endsWith('.wav')){
				throw new Error('Sounds must be .wav files!');
			}
			this.commands[command] = file;
		}
		robot.on('command_to_robot', (command) => this.handle_command(command));
	}
	
	handle_command(command){
		if (command in this.commands){
			exec('aplay -D plughw:2,0 ' + this.commands[command], {shell: '/bin/bash'});
		}
	}

}