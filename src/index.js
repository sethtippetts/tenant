import convict from 'convict';
import { get, set } from 'object-path';
import assert from 'assert';
import Promise from 'bluebird';

export default class Tenancy {
  constructor(config) {
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

    if (Array.isArray(this.tenants)) {
      this.tenants = toMap('tenant', this.tenants);
    }

    console.log('before', this.tenants);

    Object.keys(this.tenants)
      .map(key => {
        this.tenants[key] = this.populate(convict(this.index), key);
      });

    console.log('after', this.tenants);

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
    let tenantKey = get(req, this.tenantPath);
    let tenant = get(this, ['tenants', tenantKey], false);
    let getter = get(this, ['connections', key.toLowerCase()]);

    assert(typeof getter === 'function', `Connection key "${key}" not found.`);
    assert(tenant, `Tenant environment with key "${tenantKey}" not found.`);

    return getter(...extra, tenantKey, tenant);
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
  populate(config, key) {
    let tenant = get(this, ['tenants', key], {});
    let extendKey = get(tenant, 'extends');

    console.log('populate', tenant, extendKey);
    if (!Object.keys(tenant).length) return;

    if (extendKey) this.populate(config, extendKey);
    config.load(this.tenants[key]);
    return config;
  }
}

function toMap(key, arr) {
  return arr.reduce((prev, curr) => {

    prev[curr[key]] = curr;
    return prev;
  }, {});
}
