'use strict';
/**
 * db config
 * @type {Object}
 */
export default {
  type: 'mongo',
  adapter: {
    mysql: {
      host: '127.0.0.1',
      port: '',
      database: '',
      user: '',
      password: '',
      prefix: 'think_',
      encoding: 'utf8'
    },
    mongo: {
      host: '127.0.0.1',
      port: '27017',
      encoding: "utf8",
      database: "thinkjs",
      prefix: "think_",
      log_sql: true,
      log_connect: true,
      cache: {
        on: true,
        type: '',
        timeout: 3600
      },
      options: {}
    }
  }
};