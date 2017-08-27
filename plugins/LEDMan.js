/* eslint-disable */
class LEDMan {
	
	constructor(config, getFile, devicemap, robot){
		this.commands = {};
		this.devices = devicemap;
		
		for (var command in config.commands){
			
		}
		robot.on('command_to_robot', this.handle_command.bind(this));
	}
	
	handle_command(data){
		if (data.key_position === 'down' && data.command in this.commands){
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

module.exports = LEDMan;