const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const defaults = require('./devices/board_defaults');
const findPreset = require('./devices/part_presets');

const five = require('johnny-five');

function loadConfig(inputFile){
	var config = yaml.safeLoad(fs.readFileSync(inputFile));
	var hardware = setupHardware(config.devices);
	return {
		config: config,
		hardware: hardware
	};
}

function setupHardware(devices, debug){
	return new Promise((resolve, reject) => {
		var devicemap = {};
		let board_opts = [];
		devices.forEach(board_entry => {
			let opts = {id: board_entry.name || board_entry.type};
			Object.assign(opts, defaults(board_entry.type));
			board_opts.push(opts);
		});
		var boards = new five.Boards(board_opts);
		boards.on('ready', ()=>{
			devices.forEach((board_entry) => {
				let board = this.byId(board_entry.name || board_entry.type);
				devicemap[board.id] = board;
				if (board_entry.parts){
					board_entry.parts.forEach((part)=>{
						devicemap[part.name||part.type] = initPart(part, board);
					});
				}
				if (board_entry.children){
					board_entry.children.forEach((child) => {
						let opts = {
								id: child.name||child.type,
								controller: child.type,
								board: board};
						if (child.address) opts.address = child.address;
						let child_device = new five.Board.Virtual(new five.Expander(opts));
						devicemap[opts.id] = child_device;
						if (child.parts){
							child.parts.forEach((part)=>{
								devicemap[part.name||part.type] = initPart(part, child_device);
							});
						}
					});
				}
			});
			resolve(devicemap);
		});
	});
}

function initPart(partconf, board){
	let opts = {
			id: partconf.name || partconf.type,
			board: board
			};
	if (partconf.preset){
		Object.assign(opts, findPreset(partconf));
	} else if (partconf.options){
		Object.assign(opts, partconf.options);
	}
	let partClass = five[partconf.type];
	return new partClass(opts);
}

module.exports = loadConfig;