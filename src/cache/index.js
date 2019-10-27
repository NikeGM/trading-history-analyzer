const { Cache } = require('./cache');
const { LocalStorage } = require('./local-storage');
const { RedisStorage } = require('./redis-storage');

module.exports = { Cache, LocalStorage, RedisStorage };