const io = require('socket.io-client');
const EventEmitter = require('events');

class RobotIO extends EventEmitter {

	constructor(opts={}){
		super();
		this.robotID = opts.robotID || false;
		
		this.socket = io.connect('http://runmyrobot.com:8022', {reconnect: true});

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
}

module.exports = RobotIO;