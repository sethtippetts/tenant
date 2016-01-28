import assert from 'assert';
import Promise from 'bluebird';
import Tenancy from './Tenancy';

export default class Middleware extends Tenancy {
  constructor(config) {

    super(config);

    // Assign defaults
    Object.assign(this, {
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

    for (var key in this.middlewares) {
      this[type](key, this.middlewares[key]);
    }
  }
  inject(req, res, next) {
    throw new Error('Inject middleware is not implemented.');
  }
  middleware(name, factory) {
    throw new Error('Middleware method not implemented');
  }
  parseRequest(req, res, next) {
    throw new Error('Parse request middleware is not implemented.');
  }
  formatRequest(req, res, next) {
    throw new Error('Format request middleware is not implemented.');
  }
}
