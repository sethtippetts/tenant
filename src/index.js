import convict from 'convict';
import { get, set, coalesce } from 'object-path';
import assert from 'assert';
import Promise from 'bluebird';
import { Router } from 'express';
import expressMiddleware from './middleware/express';

export default class Tenancy {
  constructor(config) {

    // Assign
    Object.assign(this, {
      index: {},// file,
      tenants: [],
      connections: [],
      middlewares: [],
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

    this.parse = Promise.method(this.parse.bind(null, this.requestKey));

    ['tenant', 'middleware', 'connection'].map(type => {
      let list = this[`${type}s`];
      for (var key in list) {
        this[type](key, list[key]);
      }
    });

    this.middleware('express', expressMiddleware, true);
  }
  middleware(key, factory, isInternal) {
    // Getter
    if (!factory) return this.middlewares[key];
    factory = factory.bind(this);

    // For internal parse middlewares
    if (isInternal) {
      this.middlewares[key] = factory();
      return this;
    }

    // Setter
    let router = new Router();
    router.use(this.addURLPrefix.bind(this));
    for (let tenant in this.tenants) {
      router.use(`/${tenant}`, factory(this.tenants[tenant]));
    }
    router.use(this.removeURLPrefix.bind(this));
    this.middlewares[key] = router;
    return this;
  }
  connection(key, value, ...extra) {
    // Getter
    if (typeof value !== 'function') {
      let tenant = get(value, this.tenantPath, false);
      let getter = get(this, ['connections', key.toLowerCase()]);

      assert(typeof getter === 'function', `Connection key "${key}" not found.`);
      assert(tenant, `Tenant environment with key "${tenant.tenant}" not found.`);

      return getter(...extra, tenant);
    }

    // Setter
    this.connections[key] = Promise.method(value);
    return this;
  }
  config(...args) {
    return this.tenant(...args);
  }
  tenant(key = this.defaultTenant, value = false) {
    // Value passed was a request, get the tenant config from it.
    if (typeof key === 'object') key = get(key, this.tenantPath);

    // Getter
    if (!value) return get(this, ['tenants', key]);

    // Setter
    this.tenants[key] = this.populate(convict(this.index), value);
    return this;
  }
  populate(config, tenant = {}) {
    let extendKey = get(tenant, 'extends');
    if (!Object.keys(tenant).length) return;
    if (extendKey) this.populate(config, get(this, ['tenants', extendKey], {}));
    config.load(tenant);
    return config;
  }
  addURLPrefix(req, res, next) {
    let tenant = get(req, this.tenantPath);

    req.url = `/${tenant.get('env')}${req.url}`;
    next();
  }
  removeURLPrefix(req, res, next) {
    req.url = req.originalUrl;
    next();
  }
}
