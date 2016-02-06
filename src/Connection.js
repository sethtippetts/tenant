import Bluebird from 'bluebird';
import Debug from 'debug';
import { OFFLINE_STATUS, ONLINE_STATUS, UNKNOWN_STATUS } from './constants';

let log = new Debug('tenant:connection');

export default class Connection {
  constructor (name, {
    factory: _factory,
    health = () => Bluebird.resolve('Not implemented.'),
    cache = { ttl: 0, retries: 3 },
  }) {
    log(`Constructor for "${name}" connection.`);
    this.name = name;
    this.argumentsLength = _factory.length;
    this.factoryMethod = Bluebird.method(_factory);
    this.healthMethod = Bluebird.method(health);
    this.status = UNKNOWN_STATUS;
    this.retries = 0;
    this.settings = {
      cache,
    };
    this.activeConnection;
    this.createdAt;
  }
  health(...value) {

    // Getter
    return this.healthMethod(this.factory(...value))
      .tap(results => this.status = results ? ONLINE_STATUS : OFFLINE_STATUS)
      .catch(ex => {
        console.error(`Connection "${this.name}" failed the health check.`, ex);
        this.status = OFFLINE_STATUS;
      });
  }
  factory(...value) {

    // If they don't pass all the argument their factory requires
    if (value.length !== this.argumentsLength) {
      while (value.length < this.argumentsLength) {
        value.unshift(null);
      }
    }

    if (
      // Status is healthy
      this.status === ONLINE_STATUS

      // Has an active connection
      && this.activeConnection

      // The createdAt time is within the connection life threshold
      && (!this.settings.ttl || (new Date()).getTime() - this.createdAt < this.settings.ttl)
    ) {
      return Promise.resolve(this.activeConnection);
    }

    // Getter
    return this.factoryMethod(...value)
      .tap(() => {
        this.createdAt = (new Date()).getTime();
        this.status = ONLINE_STATUS;
      })
      .catch(ex => {
        console.error(`Failed to create connection "${this.name}"`, ex);

        // Trying again
        if (this.retries > this.settings.cache.retries) {
          this.retries++;
          return this.factory(...value);
        }

        // Failed permanently
        console.error(`Connection "${this.name}" is unhealthy`);
        this.retries = 0;
        this.status = OFFLINE_STATUS;
      })
  }
}
