module.exports = {
	dive: (obj, path) => path.split('.').reduce((acc, v) => acc[v], obj),
	softAssign: (...objs)=>objs.slice(1).forEach(obj=>Object.keys(obj).forEach(p=>(objs[0][p]===undefined)?objs[0][p]=obj[p]:0))
};