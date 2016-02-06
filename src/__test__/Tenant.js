/* global describe, it, beforeEach */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Tenant from '../Tenant';

chai.use(chaiAsPromised);

let { expect } = chai;

var config = {
  couch: {
    url: 'http://couch-stage.example.com:5984',
  },
  s3: {
    bucket: 'com.example.staging',
  },
};

let connections = {
  couchdb: {
    factory: (tablename, { couch: { url } }) => ({ tablename, hostname: url }),
    health: () => true,
  },
  s3: {
    factory: ({ s3: { bucket } }) => ({ bucket }),
  },
};

describe('Tenant', () => {
  let tenant;
  beforeEach(() => {
    tenant = new Tenant('staging', config, connections);
  });
  describe('constructor', () => {
    it('should accept an object', () => {
      // console.log(new Tenant(config));
    });
  });
  describe('#connection', () => {
    it('should be a getter with a single string argument', () => {
      expect(tenant.connection('s3')).to.eventually.be.an('object');
    });
    it('should be a getter with two arguments if the second is an array', () => {
      expect(tenant.connection('couchdb', ['users'])).to.eventually.be.an('object');
      expect(tenant.connection('couchdb', ['users'])).to.eventually.have.property('tablename');
    });
    it('should replace factory arguments with null if they\'re not supplied', () => {
      expect(tenant.connection('couchdb')).to.eventually.have.property('tablename')
        .and.to.be.null;
    });
    it('should be a setter if the second argument is a function', () => {
      tenant.connection('testconn', () => ({}));
      expect(tenant.connections).to.have.property('testconn');
    });
    it('should be a setter if the second argument is an object', () => {
      tenant.connection('testconn', { factory: () => ({}) });
      expect(tenant.connections).to.have.property('testconn');
    });
    it('should return chainable instance for setters', () => {
      expect(tenant.connection('testconn', () => ({}))).to.be.instanceof(Tenant);
    });
  });
  describe('#health', () => {
    it('should be a getter if it has a single string argument', () => {
      expect(tenant.health('couchdb', ['users'])).to.eventually.equal(true);
    });
    it('should return "Not implemented." as a default health check', () => {
      expect(tenant.health('couchdb', ['users'])).to.eventually.equal(true);
    });
  })
});



