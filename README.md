# Runmynodebot
## Installation
### Install Node
```bash
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install nodejs
```
### Install runmynodebot
```bash
cd ~
git clone https://github.com/Mike111177/runmynodebot.git
cd runmynodebot
npm install
```
##### If you are on a Raspberry Pi then do:
```bash
npm install raspi-io
```
##### If you are planning on using the video streaming feature, you will need to install FFmpeg:
```bash
sudo apt install gnutls-dev
cd /usr/local/src
git clone https://github.com/r3n33/FFmpeg.git -b dynoverlay
cd FFmpeg
./configure --arch=armel --target-os=linux --enable-gpl --enable-libx264 --enable-nonfree --enable-gnutls --extra-libs=-ldl --enable-zlib
make -j4
sudo make install
```
Credit goes to [@r3n33](https://github.com/r3n33) for the dynoverlay filter and install instructions.
## Running
### The default configuration
```bash
sudo node runmynodebot.js run <Your robot ID>
```
#### The default configuration with video streaming
```bash
sudo node runmynodebot.js run <Your camera ID>
```
Note that the default configuration does put a watermark on video output. 
If you are using the video feature of this program and would like to remove said watermark, 
simply create and use your own configuration file.
### A configuration from the examples folder
```bash
sudo runmynodebot.js run <Your robot ID or camera ID> --example Tiger
```
### A custom configuration
Warning: This software is in very early development, your configuration may not survive updates.
```bash
cd ~
mkdir <folder to hold configs>
cd <above created folder>
node ~/runmynodebot/runmynodebot.js create myrobot.yml
```
You can then edit myrobot.yml as you please.<br>
To see more about configuration files see [Configuration](docs/Configuration.md)<br>
To run then:
```bash
sudo node ~/runmynodebot/runmynodebot.js run <Your robot ID or camera ID> --config myrobot.yml
```
