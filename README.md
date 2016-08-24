# Tenant

[![npm](https://img.shields.io/npm/dm/localeval.svg?style=flat-square)](https://www.npmjs.com/package/tenant)
[![npm](https://img.shields.io/npm/v/tenant.svg?style=flat-square)](https://www.npmjs.com/package/tenant)
[![CircleCI](https://img.shields.io/circleci/project/mostcowbell/tenant.svg?maxAge=2592000?style=flat-square)](https://circleci.com/gh/mostcowbell/tenant)

## Getting started

>Looking for the express middleware? Try [express-tenant](https://www.npmjs.com/package/express-tenant)!

### Installation

```bash
$ npm i --save tenant
```

**ES5**
```js
var Tenancy = require('tenant');
```

**ES6**
```js
import { Tenancy, Tenant, Connection } from 'tenant';
```

### Tenancy configuration options

```js
import Tenancy from 'tenant';
import Bluebird from 'bluebird';

let tenancy = new Tenancy({
  tenants: {
    production: convict({}), // use some library
    staging: config, // a custom module
    development: {}, // a plain object!?
  },
  connections: {

    // I apologize.
    salesforce(config) {
      let { username, hostname, password, token } = config.salesforce;
      let conn = new jsforce.Connection({
        loginUrl: hostname,
        accessToken: token,
      });

      return Bluebird.fromCallback(cb => {
        conn.login(username, password + token, cb);
      })
    },

    // Less gross.
    couch(config) {
      return nano(config.couch.url);
    },

    service(extra, parameters, config) {
      // Return whatever you want, promise, function, object, (spatula?)
    },
    // ...other tenanted connections
  ],
});
```

### Functional initialization

Alternatively you can add connections and tenants functionally. Pass a fully qualified `Tenant` object or a name and a configuration object. Order doesn't matter, connections will populate to tenants and vice versa

__Example__:
```js
import { Tenancy, Tenant } from 'tenant';

let tenancy = new Tenancy();

let staging = new Tenant('staging', stagingConfig);

// Chainable. Order doesn't matter.
tenancy
  .tenant(staging)
  .connection('salesforce', (config) => {
    return Promise.reject(new Error('Really? Still Salesforce?'));
  })
  .tenant('production', prodConfig);

export default tenancy;
```

### Getting tenant configuration
```js
let secret = tenancy.tenant('production').config.sessionSecret;
```

### Getting a tenant connection
```js
let CouchDB = tenancy.tenant('staging').connection('couch');
```

#### Passing additional arguments to the connection factory method
```js
// Define your factory method with additional arguments
new Connection('couch', (tablename, config) => {
  return nano(config.couchdb).use(tablename);
});

// Call connection with an array of additional arguments
let CouchDB = tenancy.tenant('staging').connection('couch', ['users']);
```

## API Reference

#### [`class Tenancy`](https://github.com/SethTippetts/tenant/wiki/Tenancy)
- [new Tenancy([params])](https://github.com/SethTippetts/tenant/wiki/Tenancy#constructor)
  - [tenant(name)](https://github.com/SethTippetts/tenant/wiki/Tenancy#tenant-getter)
  - [tenant(name, config)](https://github.com/SethTippetts/tenant/wiki/Tenancy#tenant-setter)
  - [tenant(Tenant)](https://github.com/SethTippetts/tenant/wiki/Tenancy#tenant-advanced-setter)
  - [connection(name, factory)](https://github.com/SethTippetts/tenant/wiki/Tenancy#connection-setter)
  - [connection(Connection)](https://github.com/SethTippetts/tenant/wiki/Tenancy#connection--advanced-setter)

#### [`class Tenant`](https://github.com/SethTippetts/tenant/wiki/Tenant)
- [new Tenant()](https://github.com/SethTippetts/tenant/wiki/Tenant#constructor)
  - [connection(name)](https://github.com/SethTippetts/tenant/wiki/Tenant#connection-getter)
  - [connection(name, value)](https://github.com/SethTippetts/tenant/wiki/Tenant#connection-setter)
  - [config](https://github.com/SethTippetts/tenant/wiki/Tenant#config)
  - [name](https://github.com/SethTippetts/tenant/wiki/Tenant#name)

#### [`class Connection`](https://github.com/SethTippetts/tenant/wiki/Connection)
- [new Connection(name, factory)](https://github.com/SethTippetts/tenant/wiki/Connection#constructor)
  - [factory(configuration)](https://github.com/SethTippetts/tenant/wiki/Connection#factory)
  - [name](https://github.com/SethTippetts/tenant/wiki/Connection#name)
