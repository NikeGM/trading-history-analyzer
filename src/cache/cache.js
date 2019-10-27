class Cache {
  constructor(storage, logger) {
    this.storage = storage;
    this.logger = logger;
  }

  async set(key, value) {
    this.logger.debug('Set to cache', key);
    return this.storage.set(key, value);
  }

  async get(key) {
    this.logger.debug('Get from cache', key);
    return this.storage.get(key);
  }

  async delete(key) {
    this.logger.debug('Delete from cache', key);
    return this.storage.delete(key);
  }

  async has(key) {
    this.logger.debug('Has in cache', key);
    return this.storage.has(key);
  }
}

module.exports = { Cache };