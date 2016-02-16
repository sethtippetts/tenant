# Tenant

[![npm](https://img.shields.io/npm/dm/localeval.svg?style=flat-square)](https://www.npmjs.com/package/tenant)
[![npm](https://img.shields.io/npm/v/npm.svg?style=flat-square)](https://www.npmjs.com/package/tenant)

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
import { Tenancy, Tenant, Middleware } from 'tenant';
```

### Tenancy configuration options

```js
import Tenancy from 'tenant';
import Bluebird from 'bluebird';

let tenancy = new Tenancy({
  defaultTenant: process.env.NODE_ENV || 'development',
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
    // ...other tenanted connections
  ],
});
```

### Functional initialization

Alternatively you can add connections and tenants functionally

__Example__:
```js
import { Tenancy, Tenant } from 'tenant';

let tenancy = new Tenancy();

let staging = new Tenant('staging', stagingConfig);

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
let results = tenancy.tenant('staging').connection('couch')
  .then(CouchDB => {
    let Users = CouchDB.use('users');
    return Users.list();
  });
```

## API Reference

### Tenancy

#### Methods
------------

#### `constructor(params)`

**params** `Object`

>**Example**
```js
new Tenancy({

  // Tenant configurations
  tenants: {
    staging: { /* Staging config */ }
  },

  // Tenanted connections
  connections: {
    couch: function(config) {
      return Promise.resolve('yay');
    },
  },

  // Default tenant if none is provided
  defaultTenant: process.env.NODE_ENV || 'development',
});
```

#### `tenant(tenant)`

**tenant** [`Tenant`](#tenant)

>**Example**
```js
tenancy.tenant(new Tenant('staging', {}));
```

#### `tenant([name])`

**name** `String` _(optional)_

Returns a tenant by the name or the default tenant if none is provided

#### `tenant(name, config)`

**name** `String`

**config** `Object`

>**Example**
```js
tenancy.tenant('staging', {});
```

#### `connection(name, factory)`

**name** `String`

Key associated with a connection factory.

**factory** `Function`

Connection factories are functions with tenant configuration as the last argument.
Connection factory function must return a promise, an object, or throw an error.

>**Example**
```js
tenancy.connection('couch', function(config){
  return nano(config.url);
});
```

>**Example**
```js
tenancy.connection('couch', function(){});
```

### Tenant

#### Methods

#### `constructor(name, configuration, connectionsMap)`

**name**
String

Key used to retrieve this tenant

**configuration**
Object

Configuration object that gets passed to connection factories.

**connectionsMap**
Object

Key-Value pairs of connections names and factory methods

#### `connection(name)`

**name** `String`

Returns a promise that will resolve with the tenanted connection

#### Properties

#### `name`

Tenant name

#### config

Tenant configuration
