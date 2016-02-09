import Bluebird from 'bluebird';
import Debug from 'debug';
import { OFFLINE_STATUS, ONLINE_STATUS, UNKNOWN_STATUS } from './constants';

let log = new Debug('tenant:connection');

let statuses = [ ONLINE_STATUS, OFFLINE_STATUS, UNKNOWN_STATUS ];

export default class Connection {
  constructor (name, {
    factory: _factory,
    health = () => Bluebird.resolve(UNKNOWN_STATUS),
    cache = { ttl: 0, retries: 3 },
  }) {
    log(`Constructor for "${name}" connection.`);
    this.name = name;
    this.argumentsLength = _factory.length;
    this.factoryMethod = Bluebird.method(_factory);
    this.healthMethod = health;
    this.settings = {
      cache,
    };
  }
  verify({ status, createdAt }) {
    // Status is healthy
    if (status !== ONLINE_STATUS) return false;

    // The createdAt time is within the connection life threshold
    if (this.settings.cache.ttl && (new Date()).getTime() - createdAt > this.settings.cache.ttl) return false;

    return true;
  }
  health(conn) {
    // Getter
    return Bluebird.method(this.healthMethod)(conn.connection)
      .then(value => {
        if (~statuses.indexOf(value)) {
          conn.status = value;
          return { status: value };
        }
        conn.status = value ? ONLINE_STATUS : OFFLINE_STATUS;
        return {
          value,
          status: conn.status,
        };
      })
      .catch(ex => {
        conn.status = OFFLINE_STATUS;
        throw ex;
      });
  }
  factory(...value) {

    // If they don't pass all the argument their factory requires
    if (value.length !== this.argumentsLength) {
      while (value.length < this.argumentsLength) {
        value.unshift(null);
      }
    }

    // Getter
    return this.factoryMethod(...value)
      .then(connection => ({
        createdAt: (new Date()).getTime(),
        connection,
        status: UNKNOWN_STATUS,
        retries: 0,
      }))
  }
}
