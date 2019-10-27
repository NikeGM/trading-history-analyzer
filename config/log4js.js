
const log4js = require('log4js');

const config = {
  appenders: {
    console: {
      type: 'console'
    },
    file: {
      type: 'file',
      filename: './log/out.log'
    }
  },
  categories: {
    http: {
      appenders: ['file', 'console'],
      level: 'debug'
    },
    default: {
      appenders: ['console'],
      level: 'debug'
    }
  },
  pm2: true
};

module.exports = log4js.configure(config);