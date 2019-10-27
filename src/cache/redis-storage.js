const redis = require('redis');
const { promisify } = require('util');

class RedisStorage {
  constructor(logger) {
    const client = redis.createClient();
    this.logger = logger;
    this.getAsync = promisify(client.get).bind(client);
    this.setAsync = promisify(client.set).bind(client);
    this.delAsync = promisify(client.del).bind(client);
    this.existAsync = promisify(client.exists).bind(client);
  }
  async set(key, value) {
    try {
      return await this.setAsync(key, value);
    } catch (e) {
      this.logger.error('Redis set error', e);
      return null;
    }
  }

  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (e) {
      this.logger.error('Redis get error', e);
      return null;
    }
  }

  async delete(key) {
    try {
      return await this.delAsync(key);
    } catch (e) {
      this.logger.error('Redis delete error', e);
      return null;
    }
  }

  async has(key) {
    try {
      return await this.existAsync(key);
    } catch (e) {
      this.logger.error('Redis has error', e);
      return null;
    }
  }
}

module.exports = { RedisStorage };