const fs = require('fs');

function dive(obj, path){
  return path.split('.').reduce((acc, v) => acc[v], obj);
}

function softAssign(...objs){
  const target = objs[0];
  const sources = objs.slice(1);
  sources.forEach(source => Object.keys(source).forEach(key => {
    if (!(key in target)){
      target[key] = source[key];
    }
  }));
}

function copy(source, target) {
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

module.exports = {
  dive: dive,
  softAssign: softAssign,
  copy: copy
};