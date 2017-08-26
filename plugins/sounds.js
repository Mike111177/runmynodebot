const { exec } = require('child_process');

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
		robot.on('command_to_robot', this.handle_command.bind(this));
	}
	
	handle_command(data){
		if (data.command in this.commands){
			exec('aplay -D plughw:2,0 ' + this.commands[data.command], {shell: '/bin/bash'});
		}
	}
}

module.exports = Sounds;