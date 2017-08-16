class MotorStop {
	constructor(config, getFile, devicemap, robot){
		config.forEach(entry => {
			let button = devicemap[entry.button];
			let motor = devicemap[entry.motor];
			button.on('down', motor.stop.bind(motor));
		});
	}
}
module.exports = MotorStop;