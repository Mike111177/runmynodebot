const { format } = require('util');
const { jsonGrab } = require('../util');
const { exec } = require('child_process');

// Most of these are functional placeholders
const cmd = '/usr/local/bin/ffmpeg';
const server = "runmyrobot.com"
const port = 8022;
const streamkey = 'hello';
const kbps = 350;

const videoDeviceNumber = 0;

const micChannels = 1;
const audioDeviceNumber = 1;

const micChannels = 1;

const cameraID = 342353244; //Obviously placeholder.

var audio; //Containers for ffmpeg processes.
var video;

function startAudio(){
	if (audio){
		audio.kill();
	}
	jsonGrab(format('https://%s/get_audio_port/%s', server, cameraID))
	.then(({ audio_stream_port }) => {
		audio = exec(format('%s -f alsa -ar 44100 -ac %d -i hw:%d -f mpegts -codec:a mp2 -b:a 32k -muxdelay 0.001 http://%s:%s/%s/640/480/',
				cmd, micChannels, audioDeviceNumber, server, audio_stream_port, streamkey), {shell: '/bin/bash'});
		audio.on('close', () => audio = undefined);
	});
}

function startVideo(){
	if (video){
		video.kill();
	}
	jsonGrab(format('https://%s/get_video_port/%s', server, cameraID))
	.then(({ mpeg_stream_port }) => {
		video = exec(format('%s -f v4l2 -framerate 25 -video_size 640x480 -i /dev/video%d -f mpegts -codec:v mpeg1video -s 640x480 -b:v %dk -bf 0 -muxdelay 0.001 http://%s:%s/%s/640/480/',
				cmd, videoDeviceNumber, kbps, server, mpeg_stream_port, streamkey), {shell: '/bin/bash'});
		video.on('close', () => video = undefined);
	});
}