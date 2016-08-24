/* global describe, it, beforeEach */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const Tenancy = require('../Tenancy')
const { Connection, Tenant } = Tenancy
const { noop } = require('../util')

chai.use(chaiAsPromised)

const { expect } = chai

var config = {
  defaultTenant: 'staging',
  tenants: {
    staging: {
      couch: {
        url: 'http://couch-stage.example.com:5984',
      },
      s3: {
        bucket: 'com.example.prod',
      },
    },
    production: {
      couch: {
        url: 'http://couch-prod.example.com:5984',
      },
      s3: {
        bucket: 'com.example.prod',
      },
    },
  },
  connections: {
    couchdb: ({ couch: { url } }) => ({ hostname: url }),
    s3: ({ bucket }) => ({ bucket }),
  },
}

describe('Tenancy', () => {
  let tenancy
  beforeEach(() => {
    tenancy = new Tenancy(config)
  })
  it('should explode without a "new" keyword', () => {
    expect(() => Tenancy()).to.throw(Error) // eslint-disable-line new-cap
  })
  describe('constructor', () => {
    it('should accept an object', () => {
      expect(() => new Tenancy('invalid')).to.throw(TypeError)
    })
    it('should handle blank options', () => {
      expect(() => new Tenancy()).to.not.throw(TypeError)
      expect(() => new Tenancy({})).to.not.throw(TypeError)
      expect(new Tenancy()).to.have.property('connections')
      expect(new Tenancy()).to.have.property('logger')
      expect(new Tenancy()).to.have.property('tenants')
    })
    it('should assign connections to itself', () => {
      expect(tenancy.connections).to.have.property('couchdb')
    })
    it('should assign connections to tenants', () => {
      expect(tenancy.tenant('staging').connections).to.have.property('couchdb')
    })
  })
  describe('#connection', () => {
    it('should accept a function', () => {
      expect(tenancy.connection.bind(tenancy, 'testconn', noop)).to.not.throw(TypeError)
      expect(tenancy.connection.bind(tenancy)).to.throw(TypeError)
      expect(tenancy.connection.bind(tenancy, 'testconn', 1234)).to.throw(TypeError)
    })
    it('should accept a fully qualified Connection', () => {
      const connection = new Connection('salesforce', config.connections.couchdb)
      expect(tenancy.connection.bind(tenancy, 'salesforce', connection)).to.not.throw(TypeError)
      const tenant = tenancy.tenant('production')
      expect(tenant.connection.bind(tenant, 'salesforce')).to.not.throw(TypeError)
    })
  })
  describe('#tenant', () => {
    it('should throw a RangeError if the tenant doesn\'t exist', () => {
      expect(tenancy.tenant.bind(tenancy, 'development')).to.throw(RangeError)
      expect(tenancy.tenant.bind(tenancy, 'test')).to.throw(RangeError)
      expect(tenancy.tenant.bind(tenancy, 'production')).to.not.throw(RangeError)
    })
    it('should throw a TypeError if the first argument isn\'t a string', () => {
      expect(tenancy.tenant.bind(tenancy, 0)).to.throw(TypeError)
      expect(tenancy.tenant.bind(tenancy, null)).to.throw(TypeError)
      expect(tenancy.tenant.bind(tenancy, true)).to.throw(TypeError)
    })
    it('should accept a fully qualified Tenant', () => {
      const tenant = new Tenant('development', config.tenants.staging)
      expect(tenancy.tenant.bind(tenancy, 'development', tenant)).to.not.throw(TypeError)
      expect(tenancy.tenant.bind(tenancy, 'development')).to.not.throw(TypeError)
    })
    it('should add all existing connections to a tenant', () => {
      tenancy.tenant('development', {
        couch: {
          url: 'http://couch-stage.example.com:5984',
        },
      })
      const tenant = tenancy.tenant('development')
      expect(tenant.connection.bind(tenant, 'couchdb')).to.not.throw(RangeError)
      expect(tenant.connection.bind(tenant, 's3')).to.not.throw(RangeError)
      expect(tenant.connection.bind(tenant, 'salesforce')).to.throw(RangeError)
    })
  })
})
