const { exec } = require('child_process');
const path = require('path');

class Sounds {
	
	constructor(config){
		this.commands = {};
		for (var command in config){
			let file = path.resolve(config[command]);
			if (!file.endsWith('.wav')){
				throw new Error('Sounds must be .wav files!');
			}
			this.commands[command] = file;
		}
	}
	
	handle_command(command){
		if (command in this.commands){
			exec('aplay -D plughw:2,0 ' + this.commands[command], {shell: '/bin/bash'});
		}
	}

}