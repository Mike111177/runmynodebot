const { URL } = require('url');
const { get } = require('https');
const fs = require('fs');

module.exports = {
	dive: (obj, path) => path.split('.').reduce((acc, v) => acc[v], obj),
	softAssign: (...objs)=>objs.slice(1).forEach(obj=>Object.keys(obj).forEach(p=>(objs[0][p]===undefined)?objs[0][p]=obj[p]:0)),
	jsonGrab: (link) => {
		return new Promise((resolve, reject)=>{
			get(new URL(link), (res) =>{
				let rawData = '';
				res.on('data', (chunk) => { rawData += chunk; });
				res.on('end', ()=>{
					resolve(JSON.parse(rawData));
				});
			}).on('err', reject);
		});
	},
	copy: (source, target) => {
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
			
			wr.on('done', ()=>{
				if (!error) resolve();
			});
		});
	} 
};