# Tenant

Express middleware for multi-tenant configuration and connection managment.

## Getting started

### Configuration options

```js
export default new Tenancy({
  // Convict index configuration (optional)
  index,
  tenants: {
    default: {}, // Default config that prod/stage extend.
    production,
    staging
  },
  connections: [
    {
      key: 'salesforce',
      getter: (modelKey, config) => getModels(modelKey, config.get('tenant')),
    },
  ],
});
```


```js
import express from 'express';
import Tenancy from 'tenant';
import defaultConfig, { production, staging } from './config';

let app = express();
let tenant = new Tenancy({
  index,
  defaultTenant: process.env.NODE_ENV,
  tenants: {
    default: {}, // Default config that prod/stage extend.
    production,
    staging
  },
  connections: [
    {
      key: 'salesforce',
      getter: (modelKey, config) => getModels(modelKey, config.get('tenant')),
    },
  ],
});

app.use(tenant.middleware);

app.listen(3000);
```

## API Reference

### Tenancy

#### constructor(<Object> params)

*params*
Type: Object

>Properties
```js
{
  index: {}, // Convict index object for validation
  configurations: [],
  connections: [[Connection](#connections)],
  middlewares: [[Middleware](#middleware)],
  tenantPath: 'tenant',
  requestKey: 'ENV',
  defaultTenant: 'default',
}
```
