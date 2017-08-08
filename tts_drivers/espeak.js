const os = require('os');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const prefix = os.tempdir() + path.sep + 'voice_';
var queue = [];
var running = false;

setInterval(()=>{
	if (!(queue.length===0 || running)){
		running = true;
		let file = prefix + Math.random().toString();
		fs.writeFile(file, queue.shift(), (err)=>{
			if (err) throw err;
			exec('cat ' + file + ' | espeak --stdout | tee >(aplay -D plughw:0,0) >(aplay -D plughw:1,0) >(aplay -D plughw:2,0)', ()=>{
				running = false;
			});
		});
	}
}, 500);// Try again every half a second.

module.exports = (str) => {queue.push(str);};