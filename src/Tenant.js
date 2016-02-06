import assert from 'assert';
import Bluebird from 'bluebird';
import Connection from './Connection';

export default class Tenancy {
  constructor(name = 'development', config = {}, connections = {}) {

    assert(typeof name === 'string', 'Tenant constructor requires "name"');

    // Assign
    this.config = config;
    this.name = name;
    this.connections = {};

    Object.keys(connections)
      .map(key => this.connection(key, connections[key]));
  }
  connection(name, value = []) {

    if (typeof name !== 'string') throw new TypeError('Connection name is required.');

    // Getter
    if (!value || Array.isArray(value)) {

      let conn = this.connections[name];

      if (!conn || typeof conn.factory !== 'function') {
        return Bluebird.reject(new RangeError(`Connection name "${name}" not found.`));
      }

      return conn.factory(...value, this.config);
    }

    // Setter

    if (!(value instanceof Connection)) {
      // Allow a factory function shorthand
      if (typeof value === 'function') {
        value = { factory: value };
      }
      value = new Connection(name, value);
    }

    this.connections[name] = value;
    return this;
  }
  health(name, value) {

    // Setter
    if (typeof value === 'function') {
      this.connections[name].health(value);
      return this;
    }

    // Getter
    if (name) {
      return this.connections[name].health(...value, this.config);
    }

    return Bluebird.props(
      Object.keys(this.connections)
        .reduce((res, key) => {
          res[key] = this.connections[key].health(this.config);
          return res;
        }, {})
    );
  }
}
