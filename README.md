# Tenant

## Getting started

>Looking for the express middleware? Try [express-tenant](express-tenant)!

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

      return Bluebird.fromCallback(cb => conn.login(username, password + token, cb))
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

Alternatively if can add connections and tenants functionally

__Example__:
```js
import { Tenancy, Tenant } from 'tenant';

let tenancy = new Tenancy();

let staging = new Tenant('staging', stagingConfig);

tenancy
  .tenant(staging)
  .connection('salesforce', (config) => Promise.reject(new Error('Really? Still Salesforce?')))
  .tenant('production', prodConfig);

export default tenancy;
```


####tenants: _\<Object\>_

Tenant values are configuration objects that get passed to connection factories.

####connections: _\<Function\>_

Connection factories are functions with tenant configuration as the last argument.
Connection factory function must return a promise, an object, or throw an error.

```js
function([additional arguments...], config) {
  return Promise|Object;

  *-or-*

  throw new Error();
}
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
  tenants: {
    staging: { /* Staging config */ }
  },
  connections: {
    couch: function(config) {
      return Promise.resolve('yay');
    },
  },
  defaultTenant: process.env.NODE_ENV || 'development',
});
```

#### `tenant(tenant)`

**tenant** [`Tenant`](#tenant)

>**Example**
```js
tenancy.tenant(new Tenant('staging', {}));
```

#### `tenant(name, config)`

**name** `String`

**config** `Object`

>**Example**
```js
tenancy.tenant('staging', {});
```

#### `connection(name, factory)`

**name** `String`

**factory** `Function`

>**Example**
```js
tenancy.connection('couch', function(){});
```

### Tenant

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
