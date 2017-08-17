module.exports = {
	dive: (obj, path) => path.split('.').reduce((acc, v) => acc[v], obj)
};