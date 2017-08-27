const io = require('socket.io-client');
const EventEmitter = require('events');
const { format } = require('util');
const { jsonGrab } = require('./util');

const server = 'letsrobot.tv';
const port = {
		prod: 8022,
		dev: 8122
}

class RobotIO extends EventEmitter {

	constructor(opts={}){
		super();
		this.robotID = opts.robotID;
		this.cameraID = opts.cameraID;
		this.env = opts.env;

		this.socket = io.connect(format('http://%s:%d', server, port[this.env]), {reconnect: true});

		if (this.robotID) {
			this.socket.on('connect', ()=>{
				this.socket.emit('identify_robot_id', this.robotID);
			});
		}

		this.socket.on('command_to_robot', data => {
			if (data.robot_id===this.robotID || !this.robotID){
				this.emit('command_to_robot', data);
			}
		});
		this.socket.on('exclusive_control', data => {
			if (data.robot_id===this.robotID || !this.robotID){
				this.emit('exclusive_control', data);
			}
		});
		this.socket.on('chat_message_with_name', data => {
			if (data.robot_id===this.robotID || !this.robotID){
				this.emit('chat_message_with_name', data);
			}
		});

		this.send = this.socket.emit.bind(this.socket);

	}

	getAudioPort(){
		return jsonGrab(format('https://%s/get_audio_port/%s', server, this.cameraID));
	}

	getVideoPort(){
		return jsonGrab(format('https://%s/get_video_port/%s', server, this.cameraID));
	}

}

module.exports = RobotIO;