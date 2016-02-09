import assert from 'assert';
import Bluebird from 'bluebird';
import Connection from './Connection';
import { OFFLINE_STATUS } from './constants';
import promiseMap from './promise-map';

export default class Tenancy {
  constructor(name = 'development', config = {}, connections = {}) {

    assert(typeof name === 'string', 'Tenant constructor requires "name"');

    // Assign
    this.config = config;
    this.name = name;
    this.factories = {};
    this.connections = {};

    Object.keys(connections)
      .map(key => this.connection(key, connections[key]));
  }

  connection(name, value = []) {

    if (typeof name !== 'string') throw new TypeError('Connection name is required.');


    if (!value || Array.isArray(value)) {
      return this.getConnection(name, value);
    }

    // Setter
    if (!(value instanceof Connection)) {
      // Allow a factory function shorthand
      if (typeof value === 'function') {
        value = { factory: value };
      }
      value = new Connection(name, value);
    }

    this.factories[name] = value;
    return this;
  }
  getConnection(name, value = []) {
    // Getter
    let blueprint = this.factories[name];

    if (!blueprint || typeof blueprint.factory !== 'function') {
      return Bluebird.reject(new RangeError(`Connection name "${name}" not found.`));
    }

    // Unique connection key based on all arguments
    let key = [].concat(name, value).join('.');

    // Potentially return cached connection
    let conn = this.connections[key];
    if (conn && blueprint.verify(conn)) {
      return Bluebird.resolve(conn);
    }

    // No valid connection, create new one.
    return blueprint.factory(...value, this.config)
      .tap(conn => this.connections[key] = conn)
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
      });
  }
  health(name, additional) {

    // Getter
    if (name) {
      return this.getConnection(name, additional)
        .then(conn => this.factories[name].health(conn));
    }

    return promiseMap(this.factories, (key) =>
      this.getConnection(key)
        .then(conn => {
          let thing = this.factories[key].health(conn);
          return thing;
        })
    );
  }
}
