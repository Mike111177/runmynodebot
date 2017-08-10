const PCA9865 = require('./PCA9865');

class ServoHat extends PCA9865{
	
	constructor(config){
		config.name = config.name || 'adafruit_servohat';
		super(config, pin_config);
	}
	
}

module.exports = ServoHat;