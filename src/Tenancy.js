import Tenant from './Tenant';
import Connection from './Connection';
import { defaultLogger, isObject, isString } from './util'


export default class Tenancy {
  constructor(options = {}) {
    if (!isObject(options)) throw new TypeError('Tenancy options must be an object.');

    let {
      tenants = {},
      connections = {},
      logger = defaultLogger,
    } = options;

    this.connections = {};
    this.tenants = {};
    this.logger = logger

    Object.keys(tenants)
      .map(key => this.tenant(key, tenants[key], logger));

    Object.keys(connections)
      .map(key => this.connection(key, connections[key], logger));
  }
  connection(name, value) {

    // Setter
    if (!isString(name)) {
      this.logger.fatal('Connection name is required.')
      throw new TypeError('Connection name is required.')
    }

    if (!(value instanceof Connection)) {
      value = new Connection(name, value, this.logger);
    }

    // Assign new connection to all existing tenants
    Object.keys(this.tenants)
      .map(key => this.tenants[key].connection(name, value));

    this.connections[name] = value;
    return this;
  }
  tenant(name, value) {

    if (!isString(name)) throw new TypeError('Argument "name" must be type "string".');

    // Getter
    if (!value) {
      let _tenant = this.tenants[name];
      if (!_tenant) {
        throw new RangeError(`Tenant with name "${name}" not found.`);
      }
      return _tenant;
    }

    if (!(value instanceof Tenant)) {
      value = new Tenant(name, value, {}, this.logger);
    }

    // Assign all existing connections to new tenant
    Object.keys(this.connections)
      .map(key => value.connection(key, this.connections[key]));

    this.tenants[name] = value;
    return this;
  }
}
