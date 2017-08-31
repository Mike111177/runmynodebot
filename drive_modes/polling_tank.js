/**
 * This drive manager constantly polls for the last recieved command.
 * This should result in smoother continuous movement.
 * 
 * This drive mode is experimental and may not perform as intended.
 */
const five = require('johnny-five');

class POLLING_TANK {

  constructor(config, getFile, devicemap, robot){
    this.config = config;

    // Motor setup
    this.motors = {};
    //Puts all the motors into a special group that lets them be controlled together.
    this.motors.left = five.Motors(config.motors.left.map(id => devicemap[id]));
    this.motors.right = five.Motors(config.motors.right.map(id => devicemap[id]));

    this.speed = config.speed || 255;
    this.turn_speed = config['turn-speed'] || this.speed / 2;
    this.last = {};

    this.bias = config.bias || 0;
    this.left_bias = this.bias < 0 ? 1 + this.bias : 1;
    this.right_bias = this.bias > 0 ? 1 - this.bias : 1;

    this.handling = false;
    this.commands = {
      'F': () => {this.drive(Math.floor(this.left_bias * this.speed), Math.floor(this.right_bias * this.speed));},
      'B': () => {this.drive(-Math.floor(this.left_bias * this.speed), -Math.floor(this.right_bias * this.speed));},
      'L': () => {this.drive(-Math.floor(this.left_bias * this.turn_speed), Math.floor(this.right_bias * this.turn_speed));},
      'R': () => {this.drive(Math.floor(this.left_bias * this.turn_speed), -Math.floor(this.right_bias * this.turn_speed));}
    };

    // Set command trigger.
    robot.on('command_to_robot', this.handle_command.bind(this));

    // Poll at 4 hz
    this.loop = setInterval(this.poll.bind(this), 250);
  }

  poll(){
    if (this.cmd){
      this.handling = true;
      this.commands[this.cmd]();
      this.cmd = null;
    } else {
      this.motors.left.stop();
      this.motors.right.stop();
      this.handling = false;
    }
  }

  drive(left_speed, right_speed){
    if (left_speed){
      if (left_speed > 0){
        this.motors.left.fwd(left_speed);
      } else {
        this.motors.left.rev(-left_speed);
      }
    }
    if (right_speed){
      if (right_speed > 0){
        this.motors.right.fwd(right_speed);
      } else {
        this.motors.right.rev(-right_speed);
      }
    }
  }

  handle_command(data){
    if (data.key_position !== 'up' && data.command in this.commands){
      this.cmd = data.command;
      if (!this.handling) {
        this.poll();
      }
    } else if (data.command === 'stop'){
      this.motors.left.stop();
      this.motors.right.stop();
      this.handling = false;
    }
  }
}

module.exports = POLLING_TANK;