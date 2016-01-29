import assert from 'assert';
import Bluebird from 'bluebird';

export default class Tenancy {
  constructor(name = 'development', config = {}, connections = {}) {

    assert(typeof name === 'string', 'Tenant constructor requires "name"');

    // Assign
    this.config = config;
    this.name = name;
    this.connections = connections;

    for (var key in this.connections) {
      this.connections(key, this.connections[key]);
    }
  }
  connection(name, ...extra) {

    let [ value ] = extra;
    // Setter
    if (typeof value === 'function') {
      this.connections[name] = Bluebird.method(value);
      return this;
    }

    // Getter
    let getter = this.connections[name];

    assert(typeof getter === 'function', `Connection name "${name}" not found.`);
    return getter(...extra, this.config);
  }
}
