const { URL } = require('url');
const { get } = require('https');

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
	}
};