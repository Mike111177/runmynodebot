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
npm install -g https://github.com/Mike111177/runmynodebot.git
```
##### If you are on a Raspberry Pi then do:
```bash
npm install -g raspi-io
```
## Configuration
Warning: This software is in very early development, your configuration may not survive updates.
```bash
node runmynodebot create myrobot.yml
```
To see more about configuration files see [Configuration](docs/Configuration.md)
## Running
### The default configuration
```bash
sudo runmynodebot run <Your robot ID>
```
### A custom configuration
```bash
sudo runmynodebot run <Your robot ID> --config myrobot.yml
```
### A configuration from the examples folder
```bash
sudo runmynodebot run <Your robot ID> --example Tiger
```