import convict from 'convict';
import { get, set, coalesce } from 'object-path';
import assert from 'assert';
import Promise from 'bluebird';

export default class Tenancy {
  constructor(config) {

    // Assign
    Object.assign(this, {
      index: {},// file,
      tenants: [],
      connections: [],
      tenantPath: 'tenant',
      requestKey: 'ENV',
      defaultTenant: 'default',
      parse: (key, req) => {
        if (!key) return;
        return req.get(key)
            || req.get(`X-${key}`)
            || req.query[key]
            || req.query[key.toLowerCase()];
      },
    }, config);

    // Index tenants defined as an array
    if (Array.isArray(this.tenants)) {
      this.tenants = toIndex(['key', 'tenant'], ['config'], this.tenants, 'tenant');
    }

    // Recursively create convict config for each tenant
    for (let tenant in this.tenants) {
      this.tenants[tenant] = this.populate(convict(this.index), this.tenants[tenant]);
    }

    this.connections = this.connections.reduce((prev, conn) => {
      let { getter, key } = conn;
      let type = typeof getter;
      if (type === 'object') prev[key] = () => conn;
      if (type === 'function') prev[key] = Promise.method(getter);
      return prev;
    }, {});

    this.parse = Promise.method(this.parse.bind(null, this.requestKey));
  }
  getConnection(...args) {
    let [key, req, ...extra] = args;
    let tenant = get(req, this.tenantPath, false);
    let getter = get(this, ['connections', key.toLowerCase()]);

    assert(typeof getter === 'function', `Connection key "${key}" not found.`);
    assert(tenant, `Tenant environment with key "${tenant.tenant}" not found.`);

    return getter(...extra, tenant);
  }
  config(key) {
    if (typeof key === 'object') key = get(key, this.tenantPath);
    return get(this, ['tenants', key]);
  }
  middleware(req, res, next) {
    this.parse(req)
      .then((tenantKey = this.defaultTenant) => {
        let tenant = get(this, ['tenants', tenantKey]);

        set(req, this.tenantPath, tenant);
        next();
      })
      .catch(next);
  }
  populate(config, tenant = {}) {
    let extendKey = get(tenant, 'extends');
    if (!Object.keys(tenant).length) return;
    if (extendKey) this.populate(config, get(this, ['tenants', extendKey], {}));
    config.load(tenant);
    return config;
  }
}

function toIndex(key, value, arr, name) {
  return arr.reduce((prev, obj, idx) => {
    let key = getValue(key, obj), value = getValue(value, obj, obj);
    assert(key, `Invalid ${name} configuration at index [${idx}]`);
    prev[key] = value;
    return prev;
  }, {});
}
function getValue(key, source, defaultValue) {
  if (Array.isArray(key)) return coalesce(source, key, defaultValue);
  return get(source, key, defaultValue)
}
