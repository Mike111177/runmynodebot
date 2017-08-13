const five = require('johnny-five');

const presets = {
		Motor: five.Motor.SHIELD_CONFIGS
};

function getPreset(partConf){
	try {
		let path = partConf.type + '.' + partConf.preset;
		return path.split('.').reduce((acc, v) => {
			return acc[v];
		}, presets);
	} catch (E) {
		throw new Error('Invalid Prefix!');
	}

}

module.exports = getPreset;