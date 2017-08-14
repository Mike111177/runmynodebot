const yaml = require('js-yaml');
const fs = require('fs');
const five = require('johnny-five');

function loadConfig(inputFile, repl=false){
	var config = yaml.safeLoad(fs.readFileSync(inputFile));
	var hardware = setupHardware(config, repl);
	return Promise.all([config, hardware]);
}

function setupHardware(conf, repl=false){
	let boardsconf = conf.boards;
	let partsconf = conf.parts;
	return new Promise((resolve, reject) => {
		var devicemap = {};
		let board_opts = readBoards(boardsconf, repl);
		var boards = new five.Boards(board_opts.real);
		boards.on('ready', ()=>{
			this.each((board) => {
				devicemap[board.id] = board;
			});
			board_opts.virtual.forEach((vboard)=>{
				devicemap[vboard.id] = new five.Board.Virtual(new Expander(vboard));
			});
			partsconf.forEach((partcfg)=>{
				initPart(partcfg, devicemap);
			});
			if (repl){
				this.repl.inject({
					devices: devicemap
				});
			}
			resolve(devicemap);
		});
	});
}

const defineBoard = require('./boardDef');
function readBoards(boardsConf, repl=false){
	let real = [];
	let virt = [];
	boardsConf.forEach((boardcfg)=>{
		let opts = defineBoard(boardcfg);
		opts.repl = repl;
		if (opts.custom && opts.custom.virtual){
			virt.push(opts);
		} else {
			real.push(opts);
		}
	});
	return {
		real: real,
		virtual: virt
	};
}

const findPreset = require('./part_presets');
function initPart(partconf, devicemap){
	let opts = {id: partconf.type};
	if (partconf.preset){
		Object.assign(opts, findPreset(partconf));
	}
	Object.assign(opts, partconf);
	if (opts.board && opts.board in devicemap){
		opts.board = devicemap[opts.board];
	}
	let partClass = five[partconf.type];
	devicemap[opts.id] = new partClass(opts);
}

module.exports = loadConfig;