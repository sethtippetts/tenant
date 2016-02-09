import Bluebird from 'bluebird';
import Tenancy from './Tenancy';
import requestParser from './request-parser';

export default class Middleware extends Tenancy {
  constructor(config) {
    super(config);

    let {
      middlewares = {},
      tenantPath = 'tenant',
      requestKey = 'ENV',
      parse = requestParser,
    } = config;

    // Assign defaults
    this.middlewares = middlewares;
    this.tenantPath = tenantPath;
    this.requestKey = requestKey;
    this.parse = Bluebird.method(parse.bind(null, this.requestKey));

    for (var key in this.middlewares) {
      this.middleware(key, this.middlewares[key]);
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
