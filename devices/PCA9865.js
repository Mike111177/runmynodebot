const PWM = {0: 0, 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, 11:11, 12:12, 13:13, 14:14, 15:15};

class PCA9865 {

	constructor(config = {}, pin_config = {}){
		this.name = config.name ||  'PCA9865';
		this.address = config.address || 0x40;
		this.used_pins = [];
		this.pin_config = pin_config;

		this.pin_config.PWM = pin_config.PWM || PWM;
		this.pin_config.LED = pin_config.LED || pin_config.PWM || PWM;
		this.pin_config.SERVO = pin_config.SERVO || pin_config.PWM || PWM;
	}

	getResource(str){
		let id;
		if (str.startsWith('LED') && (id = str.slice(3)) in this.pin_config.LED){
			if (id in this.pin_config.LED){
				pin = this.pin_config.LED[id];
				this.pinCheck(pin);
				return five.LED({
					pins: pin,
					address: this.address,
					controller: 'PCA9865'
				});
			}
		} else if (str.startsWith('SERVO') && (id = str.slice(5)) in this.pin_config.SERVO){
			if (id in this.pin_config.SERVO){
				pin = this.pin_config.SERVO[id];
				this.pinCheck(pin);
				return five.SERVO({
					pins: pin,
					address: this.address,
					controller: 'PCA9865'
				});
			}
		} else {
			throw new Error(str + ' is not a valid component name for ' + this.name + '!');
		}
	}
	
	pinCheck(pin){
		if (this.used_pins.includes(pin)){
			throw new Error('Pin ' + pin + ' on device \'' + this.name + +'\' has conflicts!');
		} else {
			this.used_pins.push(pin);
		}
	}
}


module.exports = PCA9865;