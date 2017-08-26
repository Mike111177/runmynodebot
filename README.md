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
## Running
### The default configuration
```bash
sudo node runmynodebot.js run <Your robot ID>
```
### A configuration from the examples folder
```bash
sudo runmynodebot.js run <Your robot ID> --example Tiger
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
sudo node ~/runmynodebot/runmynodebot.js run <Your robot ID> --config myrobot.yml
```
