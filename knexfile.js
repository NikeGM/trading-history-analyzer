const configs = require('config');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      port: configs.db.port,
      host: configs.db.host,
      database: configs.db.database,
      user: configs.db.user,
      password: configs.db.password
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};
