const PCA9865 = require('./PCA9865');
const five = require('johnny-five');
let mcfg = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;

const PWM = {0:0, 1:1, 2:2, 3:14, 4:15, 14:14, 15:15};
const MOTOR = {};
[1,2,3,4].forEach((i) => {
	let p = mcfg['M'+i].pins;
	MOTOR[i] = [p.pwm, p.dir, p.cdir];
});

class MotorHat extends PCA9865 {
	
	constructor(config){
		config.name = config.name || 'adafruit_motorhat';
		config.address = config.address || 0x60;
		pin_config = {
				PWM: PWM,
				MOTOR: MOTOR
		};
		super(config, pin_config);
	}
	
	getResource(str){
		if (str.startsWith('MOTOR')){
			id = str.slice(5);
			if (id in this.pin_config.MOTOR){
				pins = this.pin_config.MOTOR[id];
				pins.forEach((pin) => {this.pinCheck(pin);});
				return five.Motor({
					pins: {
						pwm: pins[0],
						dir: pins[1],
						cdir: pins[2]
					},
					address: this.address,
					controller: 'PCA9865'
				});
			} else {
				throw new Error(str + ' is not a valid component name for ' + this.name + '!');
			}
		} else {
			super.getResource(str);
		}
	}
}

module.exports = MotorHat;