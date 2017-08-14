var boardmap = {
		Raspberry_Pi:{
			build_opts: (opts)=>{
				const Raspi = require('Raspi-IO');
				return {io: new Raspi()};
			}
		},
		PCA9865: {
			defaults: {
				controller: "PCA9865",
				custom: {
					virtual: true
				}
			}
		}
};

function buildBoardDef(conf){
	let opts = {id: conf.id || conf.type};
	if (conf.type in boardmap){
		let def = boardmap[conf.type];
		if (def.defaults){
			Object.assign(opts, def.defaults);
		}
		Object.assign(opts, conf);
		if (def.build_opts){
			Object.assign(opts, def.build_opts());
		}
	}
	return opts;
}

module.exports = buildBoardDef;