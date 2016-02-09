import Tenant from './Tenant';
import Connection from './Connection';
import promiseMap from './promise-map';

export default class Tenancy {
  constructor(options) {
    if (typeof options !== 'object') throw new TypeError('Tenancy options must be an object.');

    let {
      defaultTenant = process.env.NODE_ENV || 'development',
      tenants = {},
      connections = {},
    } = options;

    this.connections = {};
    this.tenants = {};
    this.defaultTenant = defaultTenant;

    Object.keys(tenants)
      .map(key => this.tenant(key, tenants[key]));

    Object.keys(connections)
      .map(key => this.connection(key, connections[key]));
  }
  connection(name, value) {

    // Setter
    if (typeof name !== 'string') throw new TypeError('Connection name is required.');

    // Allow a factory function shorthand
    if (typeof value === 'function') {
      value = { factory: value };
    }

    // Setter
    let _connection = new Connection(name, value);

    // Assign new connection to all existing tenants
    Object.keys(this.tenants)
      .map(key => this.tenants[key].connection(name, _connection));

    this.connections[name] = _connection;
    return this;
  }
  tenant(name = this.defaultTenant, value = false) {

    // Getter
    if (!value) {
      let _tenant = this.tenants[name];
      if (!_tenant) throw new RangeError(`Tenant with name "${name}" not found.`);
      return _tenant;
    }

    if (!(value instanceof Tenant)) {
      value = new Tenant(name, value);
    }

    // Assign all existing connections to new tenant
    Object.keys(this.connections)
      .map(key => value.connection(key, this.connections[key]));

    this.tenants[name] = value;
    return this;
  }
  health(name) {
    return promiseMap(this.tenants, (key) => this.tenants[key].health(name));
  }
}
