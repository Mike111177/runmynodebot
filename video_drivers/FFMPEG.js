const { format } = require('util');
const { exec } = require('child_process');

//https://gist.github.com/r3n33/acaa8110c9c11b2a7d865e62ef29a320
const filters = {
		dynoverlay: (opts, getFile)=>{
			let build = 'dynoverlay=overlayfile=';
			build += getFile(opts.file);
			if (opts.check_interval){
				build += ':check_interval='+opts.check_interval;
			}
			if (opts.x){
				build += ':x='+opts.x;
			}
			if (opts.y){
				build += ':y='+opts.y;
			}
			return build;
		}, flip: ()=>'transpose=2,transpose=2'
}

function buildFilterCli(config, getFile){
	let build = '';
	if (config.filters && config.filters.length){
		build += '-vf ';
		let filist = [];
		config.filters.forEach((filter) => {
			filist.push(filters[filter.type](filter, getFile));
		});
		build += filist.join(',');
		build += ' ';
	}
	return build;
}

const cmd = '/usr/local/bin/ffmpeg';
const server = "runmyrobot.com";
const streamkey = 'hello';

class FFMPEG {

	constructor(robot, config, getFile, opts={}){
		this.robot = robot;
		this.config = { //These are just defaults.
				videoDeviceNumber: 0,
				audioDeviceNumber: 1,
				kbps: 500
		}
		Object.assign(this.config, config, opts);
		this.getFile = getFile;
	}

	start(){
		setInterval(() => {
			if (!this.audio){
				this.startAudio();
			}
			if (!this.video){
				this.startVideo();
			}
		}, 5000); // Check every 5 seconds.

		setInterval(() => {
			this.robot.send('send_video_status', {
				send_video_process_exists: true,
                ffmpeg_process_exists: true,
                camera_id: this.robot.cameraID
			});
		}, 60000); // Send every minute.
	}

	startAudio(){
		if (this.audio){
			this.audio.kill();
		}
		this.robot.getAudioPort()
		.then(({ audio_stream_port }) => {

			let micChannels = ''; // By default do not specify mic channels in the ffmpeg command, but if the user wants it, do.
			if (this.config.micChannels !== undefined){
				micChannels = format('-ac %d ', this.config.micChannels);
			}

			this.audio = exec(format('%s -f alsa -ar 44100 %s-i hw:%d -f mpegts -codec:a mp2 -b:a 32k -muxdelay 0.001 http://%s:%s/%s/640/480/',
					cmd, micChannels, this.config.audioDeviceNumber, server, audio_stream_port, streamkey), {shell: '/bin/bash'},
					(err) => {
						if (err){
							console.log(err);
						}
						this.audio = undefined;
					});
		});
	}

	startVideo(){
		if (this.video){
			this.video.kill();
		}
		this.robot.getVideoPort()
		.then(({ mpeg_stream_port }) => {
			this.video = exec(format('%s ' + //CMD
					'-f v4l2 -video_size 640x480 -i /dev/video%d '+ //Input
					'-f mpegts -r 30 -codec:v mpeg1video -s 640x480 -b:v %dk -bf 0 -muxdelay 0.001 -an %s http://%s:%s/%s/640/480/', //Output 
					cmd, this.config.videoDeviceNumber, this.config.kbps, buildFilterCli(this.config, this.getFile), server, mpeg_stream_port, streamkey), {shell: '/bin/bash'},
					(err) => {
						if (err){
							console.log(err);
						}
						this.video = undefined;
					});
		});
	}

}
module.exports = FFMPEG;
