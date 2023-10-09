// A workaround mock since jsdom has a bug with structuredClone
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))
