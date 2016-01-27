import { get, set } from 'object-path';

export default function express(){
  return (req, res, next) =>
    this.parse(req)
      .then((tenantKey = this.defaultTenant) => {
        let tenant = get(this, ['tenants', tenantKey]);

        set(req, this.tenantPath, tenant);
        next();
      })
      .catch(next);
}
