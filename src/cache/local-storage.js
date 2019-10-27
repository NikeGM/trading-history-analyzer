class LocalStorage {
  constructor() {
    this.storage = {};
  }

  async set(key, value) {
    this.storage[key] = value;
    return Promise.resolve();
  }

  async get(key) {
    return this.storage[key];
  }

  async delete(key) {
    delete this.storage[key];
    return Promise.resolve();
  }

  async has(key) {
    return !!this.storage[key];
  }
}

module.exports = { LocalStorage };