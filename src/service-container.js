const knex = require('knex');
const config = require('config');
const { Repository } = require('./repository/repository');
const log4js = require('../config/log4js');
const { Cache, LocalStorage, RedisStorage } = require('./cache');

class ServiceContainer {
  get loggerFactory() {
    return log4js;
  }

  get cache() {
    if (!this._cache) {
      const storage = config.cache.storage === 'localStorage' ?
        new LocalStorage() :
        new RedisStorage(this.loggerFactory.getLogger('RedisStorage'));
      this._cache = new Cache(storage, this.loggerFactory.getLogger('Cache'));
    }
    return this._cache;
  }

  get dbConnect() {
    if (!this._connection) {
      this._connection = knex({
        client: 'pg',
        connection: {
          host: config.db.host,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
          port: config.db.port
        }
      });
    }
    return this._connection;
  }

  get repository() {
    if (!this._repository) {
      this._repository = new Repository(
        this.loggerFactory.getLogger('Repository'),
        this.dbConnect,
        this.cache
      );
    }
    return this._repository;
  }
}

module.exports = {
  container: new ServiceContainer()
};