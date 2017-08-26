var boardmap = {
		Raspberry_Pi:{
			defaults:{
				get io() {
					const Raspi = require('raspi-io');
					return new Raspi();
				}
			}
		},
		Arduino: {},
		PCA9865: {
			defaults: {
				controller: "PCA9865",
				custom: {
					virtual: true
				}
			}
		}
};

const { softAssign } = require('../util');
function buildBoardDef(conf){
	let opts = {id: conf.id || conf.type};
	if (conf.type in boardmap){
		let def = boardmap[conf.type];
		if (conf.options) {
			Object.assign(opts, conf.options);
		}
		if (def.defaults){
			softAssign(opts, def.defaults);
		}
	}
	return opts;
}

module.exports = buildBoardDef;