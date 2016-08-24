/* global describe, it, beforeEach */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const Tenancy = require('../Tenancy')
const { noop } = require('../util')
const { Tenant } = Tenancy

chai.use(chaiAsPromised)

const { expect } = chai

var config = {
  couch: {
    url: 'http://couch-stage.example.com:5984',
  },
  s3: {
    bucket: 'com.example.staging',
  },
}

const connections = {
  couchdb: (tablename, { couch: { url } }) => ({ tablename, hostname: url }),
  s3: ({ s3: { bucket } }) => ({ bucket }),
}

describe('Tenant', () => {
  let tenant
  beforeEach(() => {
    tenant = new Tenant('staging', config, connections)
  })
  describe('constructor', () => {
    it('should accept a string as the first argument', () => {
      const fn = (...args) => () => new Tenant(...args)
      expect(fn()).to.throw(TypeError)
      expect(fn(0)).to.throw(TypeError)
      expect(fn(true)).to.throw(TypeError)
      expect(fn('good')).to.throw(TypeError)
      expect(fn('good', {})).to.not.throw(TypeError)
    })
  })
  describe('#connection', () => {
    it('should require a string as it\'s first argument', () => {
      expect(tenant.connection.bind(tenant)).to.throw(TypeError)
      expect(tenant.connection.bind(tenant, 0)).to.throw(TypeError)
      expect(tenant.connection.bind(tenant, true)).to.throw(TypeError)
      expect(tenant.connection.bind(tenant, 'couchdb')).to.not.throw(TypeError)
    })
    it('should be a getter with a single string argument', () => {
      expect(tenant.connection('s3')).to.be.an('object')
    })
    it('should be a getter with two arguments if the second is an array', () => {
      expect(tenant.connection('couchdb', ['users'])).to.be.an('object')
      expect(tenant.connection('couchdb', ['users'])).to.have.deep.property('tablename')
    })
    it('should replace factory arguments with null if they\'re not supplied', () => {
      expect(tenant.connection('couchdb')).to.have.deep.property('tablename')
        .and.to.be.null
    })
    it('should be a setter if the second argument is a function', () => {
      tenant.connection('testconn', noop)
      expect(tenant.connections).to.have.property('testconn')
    })
    it('should return chainable instance for setters', () => {
      expect(tenant.connection('testconn', noop)).to.be.instanceof(Tenant)
    })
  })
})



