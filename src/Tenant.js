import assert from 'assert';

export default class Tenancy {
  constructor(name, config = {}, connections = {}) {

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
      this.connections[name] = Promise.method(value);
      return this;
    }

    // Getter
    let getter = this.connections[name];

    assert(typeof getter === 'function', `Connection name "${name}" not found.`);
    return getter(...extra, this.config);
  }
  get config() {
    return this._config;
  }
  set config(value) {
    if (typeof value === 'object') {
      Object.assign(this._config, value);
    }
  }
}
