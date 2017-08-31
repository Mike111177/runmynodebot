const fs = require('fs');

function copy(source, target){ //Just a function for copying files.
  return new Promise((resolve, reject) => {
    let error = false;
    let fail = (err) => {
      error = true;
      reject(err);
    }
    let rd = fs.createReadStream(source);
    let wr = fs.createWriteStream(target);
    rd.on('error', fail);
    wr.on('error', fail);
    rd.pipe(wr);

    wr.on('done', ()=>{
      if (!error) resolve();
    });
  });
}

class FireOverlay {

  constructor(config, getFile, devicemap){
    // The getFile function will resolve a file path relative to the config file.
    this.active = getFile(config.active_state);
    this.normal = getFile(config.normal_state);
    this.target = getFile(config.target_file);
    // Getting the specified motor.
    this.motor = devicemap[config.action_motor];

    this.motor.on('start', () => {
      copy(this.active, this.target).catch(console.error); // Copy the active file to the target file.
    });

    this.motor.on('stop', () => {
      copy(this.normal, this.target).catch(console.error); // Copy the normal file to the target file.
    });

    copy(this.normal, this.target).catch(console.error); // We start with the normal file.

  }
}

module.exports = FireOverlay;