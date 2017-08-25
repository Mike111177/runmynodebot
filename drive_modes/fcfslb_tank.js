/**
 * This drive manager works on a modified first come first basis (see fcfs_tank),
 * however upon completion of each run command, it checks to see if the command
 * was resent near the end of the movement, and if it was, to continue the movement.
 * This should result in smoother continuous movement.
 */
const five = require('johnny-five');

class FCFSLB_TANK {
	
	constructor(config, getFile, devicemap, robot){
		this.config = config;
		
		// Motor setup
		this.motors = {};
		//Puts all the motors into a special group that lets them be controlled together.
		this.motors.left = five.Motors(config.motors.left.map(id => devicemap[id]));
		this.motors.right = five.Motors(config.motors.right.map(id => devicemap[id]));
		
		this.speed = config.speed || 255;
		this.turn_speed = config[turn-speed] || this.speed/2;
		this.turn_time = config.turn_time || 500;
		this.drive_time = config.drive_time || 500;
		this.last = {};
		
		this.bias = config.bias || 0;
		this.left_bias = this.bias<0? 1+this.bias: 1;
		this.right_bias = this.bias>0? 1-this.bias: 1;
		
		this.handling = false;
		this.commands = {
				'F': () => {this.drive(Math.floor(this.left_bias*this.speed), Math.floor(this.right_bias*this.speed), this.drive_time);},
				'B': () => {this.drive(-Math.floor(this.left_bias*this.speed), -Math.floor(this.right_bias*this.speed), this.drive_time);},
				'L': () => {this.drive(-Math.floor(this.left_bias*this.turn_speed), Math.floor(this.right_bias*this.turn_speed), this.turn_time);},
				'R': () => {this.drive(Math.floor(this.left_bias*this.turn_speed), -Math.floor(this.right_bias*this.turn_speed), this.turn_time);},
				'SL': () => {this.drive(-Math.floor(this.left_bias*this.turn_speed), Math.floor(this.right_bias*this.turn_speed), this.turn_time/2);},
				'SR': () => {this.drive(Math.floor(this.left_bias*this.turn_speed), -Math.floor(this.right_bias*this.turn_speed), this.turn_time/2);}			
		};
		
		// Set command trigger.
		robot.on('command_to_robot', this.handle_command.bind(this));
	}
	
	track(delay){
		let lbtime = delay/5;
		var timer = setInterval(()=>{
			// If the command is the same as the runnning command and it is not stale, do nothing and continue.
			if (!(this.last.cmd === this.handling && Date.now()-this.last.time<lbtime)){
				this.motors.left.stop();//Stop both motors
				this.motors.right.stop();
				this.handling = false; //Allow next command to be received
				clearInterval(timer);
			}
		}, delay);
	}
	
	drive(left_speed, right_speed, time){
		let moving = false;
		if (left_speed){
			moving = true;
			if (left_speed>0){
				this.motors.left.fwd(left_speed);
			} else {
				this.motors.left.rev(-left_speed);
			}
		}
		if (right_speed){
			moving = true;
			if (right_speed>0){
				this.motors.right.fwd(right_speed);
			} else {
				this.motors.right.rev(-right_speed);
			}
		}
		if (moving){
			this.track(time);
		} else {
			this.handling = false;
		}
	}

	handle_command(data){
		if (data.command in this.commands){
			this.last.cmd = data.command;
			this.last.time = Date.now();
			if (!this.handling){
				this.handling = this.last.cmd; //Blocking further commands for now.
				this.commands[data.command]();
			}
			return true; // One of our commands, return true to inform main process not to run it as an accessory command.
		} else {
			return false;// Not one of our commands, return false to inform main process that it is an accessory command.
		}
	}
}

module.exports = FCFSLB_TANK;