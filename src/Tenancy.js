import Promise from 'bluebird';
import Tenant from './Tenant';

export default class Tenancy {
  constructor({ tenants = {}, connections = {} }) {
    this.connections = {};
    this.tenants = {};

    for (let key in tenants) {
      this.tenant(key, tenants[key]);
    }
    for (let key in connections) {
      this.connection(key, connections[key]);
    }
  }
  connection(name, value) {

    // Setter
    let _connection = Promise.method(value);

    // Assign new connection to all existing tenants
    for (let tenantName in this.tenants) {
      this.tenants[tenantName].connection(name, _connection);
    }
    this.connections[name] = _connection;
    return this;
  }
  tenant(name, value) {
    if (!value) return this.tenants[name];

    let _tenant = value;

    if (!(_tenant instanceof Tenant)) {
      _tenant = new Tenant(name, value);
    }

    // Assign all existing connections to new tenant
    for (let key in this.connections) {
      _tenant.connection(key, this.connections[key]);
    }
    this.tenants[name] = _tenant;
    return this;
  }
}
