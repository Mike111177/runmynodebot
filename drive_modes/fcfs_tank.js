/**
 * This drive manager is abbreviated FCFS for "First Come First Serve".
 * This behaves similarly to the controller.py found at 
 * https://github.com/runmyrobot/runmyrobot/blob/master/controller.py
 * in that it ignores any commands given to it during motion, and then 
 * responds to the next command given after motion stops.
 * 
 * Like in the python sample, this causes a characteristic jerkiness 
 * when moving for a duration.
 */
const five = require('johnny-five');

class FCFS_TANK {

  constructor(config, getFile, devicemap, robot){
    this.config = config;

    // Motor setup
    this.motors = {};
    //Puts all the motors into a special group that lets them be controlled together.
    this.motors.left = five.Motors(config.motors.left.map(id => devicemap[id]));
    this.motors.right = five.Motors(config.motors.right.map(id => devicemap[id]));

    this.speed = config.speed || 255;
    this.turn_speed = config['turn-speed'] || this.speed / 2;
    this.turn_time = config.turn_time || 500;
    this.drive_time = config.drive_time || 500;

    this.bias = config.bias || 0;
    this.left_bias = this.bias < 0 ? 1 + this.bias : 1;
    this.right_bias = this.bias > 0 ? 1 - this.bias : 1;

    this.handling = false;
    this.commands = {
      'F': () => {this.drive(Math.floor(this.left_bias * this.speed), Math.floor(this.right_bias * this.speed), this.drive_time);},
      'B': () => {this.drive(-Math.floor(this.left_bias * this.speed), -Math.floor(this.right_bias * this.speed), this.drive_time);},
      'L': () => {this.drive(-Math.floor(this.left_bias * this.turn_speed), Math.floor(this.right_bias * this.turn_speed), this.turn_time);},
      'R': () => {this.drive(Math.floor(this.left_bias * this.turn_speed), -Math.floor(this.right_bias * this.turn_speed), this.turn_time);},
      'SL': () => {this.drive(-Math.floor(this.left_bias * this.turn_speed), Math.floor(this.right_bias * this.turn_speed), this.turn_time / 2);},
      'SR': () => {this.drive(Math.floor(this.left_bias * this.turn_speed), -Math.floor(this.right_bias * this.turn_speed), this.turn_time / 2);}
    };

    // Set command trigger.
    robot.on('command_to_robot', this.handle_command.bind(this));
  }

  stop(delay){
    setTimeout(()=>{
      this.motors.left.stop();//Stop both motors
      this.motors.right.stop();
      this.handling = false; //Allow next command to be received
    }, delay);
  }

  drive(left_speed, right_speed, time){
    let moving = false;
    if (left_speed){
      moving = true;
      if (left_speed > 0){
        this.motors.left.fwd(left_speed);
      } else {
        this.motors.left.rev(-left_speed);
      }
    }
    if (right_speed){
      moving = true;
      if (right_speed > 0){
        this.motors.right.fwd(right_speed);
      } else {
        this.motors.right.rev(-right_speed);
      }
    }
    if (moving){
      this.stop(time);
    } else {
      this.handling = false;
    }
  }

  handle_command(data){
    if (data.command in this.commands){
      if (!this.handling){
        this.handling = true; //Blocking further commands for now.
        this.commands[data.command]();
      }
      return true; // One of our commands, return true to inform main process not to run it as an accessory command.
    } else {
      return false;// Not one of our commands, return false to inform main process that it is an accessory command.
    }
  }
}

module.exports = FCFS_TANK;