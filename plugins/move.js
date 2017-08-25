function stop(motor, delay=500){
	setTimeout(()=>{
		motor.stop();
		this.handling = false;
	}, delay);
}

class Move {
	
	constructor(config, getFile, devicemap, robot){
		this.commands = {};
		this.devices = devicemap;
		for (var command in config){
			let cmd = {};
			Object.assign(cmd, {key_positions: ['down']}, config[command], {handling: false});
			this.commands[command] = cmd;
		}
		robot.on('command_to_robot', this.handle_command.bind(this));
	}
	
	handle_command(data){
		// If it is a valid command and for that command a valid key position.
		if (data.command in this.commands && data.key_position in this.commands[data.command].key_positions){
			let cmd = this.commands[data.command];
			if (!cmd.handling){
				cmd.handling = true;
				let motor = this.devices[cmd.motor];
				let stop_opts = [motor];
				if (cmd.time){
					stop_opts.push(cmd.time);
				}
				let speed = cmd.speed || 255;
				let dir = cmd.dir || 'fwd';
				if (dir==='fwd'){
					motor.fwd(speed);
					stop.apply(cmd, stop_opts);					
				} else if (dir === 'rev') {
					motor.rev(speed);
					stop.apply(cmd, stop_opts);
				}
			}
		}
	}
}

module.exports = Move;