const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

function readConfig(inputFile){
	input = yaml.safeLoad(fs.readFileSync(inputFile));
	defaults = yaml.safeLoad(fs.readFileSync(__dirname + path.sep + 'defaults.yml'));
}

