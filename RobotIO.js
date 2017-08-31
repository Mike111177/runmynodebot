const io = require('socket.io-client');
const EventEmitter = require('events');
const { format } = require('util');

const server = 'letsrobot.tv';

const request = require('request-promise-native').defaults({
	baseUrl: format('https://%s', server),
	json: true
});

class RobotIO extends EventEmitter {

	constructor(id){
		super();
		this.baseID = id;
	}

	async build(){
		try {
			this.robotID = await request(`/get_robot_id/${this.baseID}`);
			this.cameraID = this.baseID;
		} catch (e) {
			this.robotID = this.baseID;
		}

		let preq = request(`/get_control_host_port/${this.robotID}`);
		if (this.cameraID){
			preq.push(request(`/get_audio_port/${this.cameraID}`));
			preq.push(request(`/get_video_port/${this.cameraID}`));
		}

		let pres = await Promise.all(preq);
		this.cport = pres[0].port;
		if (this.cameraID){
			this.aport = pres[1].audio_stream_port;
			this.vport = pres[2].mpeg_stream_port;
		}
	}

	start(){

		this.socket = io.connect(format('http://%s:%d', server, this.cport), {reconnect: true});

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