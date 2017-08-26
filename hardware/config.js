const five = require('johnny-five');

function setupHardware(conf, repl=false){
	let boardsconf = conf.boards;
	let partsconf = conf.parts;
	return new Promise((resolve) => {
		var devicemap = {};
		let board_opts = readBoards(boardsconf, repl);
		var boards = new five.Boards(board_opts.real);
		boards.on('ready', ()=>{
			boards.forEach((board) => {
				devicemap[board.id] = board;
			});
			board_opts.virtual.forEach((vboard)=>{
				devicemap[vboard.id] = new five.Board.Virtual(new five.Expander(vboard));
			});
			partsconf.forEach((partcfg)=>{
				initPart(partcfg, devicemap);
			});
			if (repl){
				boards.repl.inject({
					devices: devicemap
				});
				devicemap.repl = boards.repl;
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
const { dive } = require('../util');
function initPart(partconf, devicemap){
	let opts = {id: partconf.id || partconf.type};
	if (partconf.preset){
		Object.assign(opts, findPreset(partconf));
	}
	if (partconf.options) {
		Object.assign(opts, partconf.options);
	}
	if (opts.board && opts.board in devicemap){
		opts.board = devicemap[opts.board];
	}
	// Find the part type by literally calling it from the defined type.
	let partClass = dive(five, partconf.type);
	devicemap[opts.id] = new partClass(opts);
}

module.exports = setupHardware;