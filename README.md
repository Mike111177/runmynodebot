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
cd runmynodebot/
npm install --save
cd ~
```
## Configuration
Warning: This software is in very early development, your configuration may not survive updates.
```bash
node runmynodebot/runmynodebot.js create myrobot.yml
```
To see more about configuration files see [Configuration](docs/Configuration.md)
## Running
### The default configuration
```bash
sudo node runmynodebot/runmynodebot.js run <Your robot ID>
```
### A custom configuration
```bash
sudo node runmynodebot/runmynodebot.js run <Your robot ID> --config myrobot.yml
```
### A configuration from the examples folder
```bash
sudo node runmynodebot/runmynodebot.js run <Your robot ID> --example Tiger
```