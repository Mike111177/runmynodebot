const five = require('johnny-five');

const { dive } = require('../util');

const presets = {
  Motor: five.Motor.SHIELD_CONFIGS
};

function getPreset(partConf){
  try {
    let path = partConf.type + '.' + partConf.preset;
    return dive(presets, path);
  } catch (E) {
    throw new Error('Invalid Preset!');
  }

}

module.exports = getPreset;