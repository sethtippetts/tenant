/* global describe, it, beforeEach */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Tenancy from '../Tenancy';

chai.use(chaiAsPromised);

let { expect } = chai;

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
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

describe('Tenancy', () => {
  let tenancy;
  beforeEach(() => {
    tenancy = new Tenancy(config);
  });
  describe('constructor', () => {
    it('should accept an object', () => {
      // console.log(new Tenancy(config));
    });
    it('should assign connections to itself', () => {
      expect(tenancy.connections).to.have.property('couchdb');
    });
    it('should assign connections to tenants', () => {
      expect(tenancy.tenants.staging.connections).to.have.property('couchdb');
    });
    it('should extend defaults', () => {
      let _config = clone(config);
      delete _config.defaultTenant;
      let _tenancy = new Tenancy(_config);
      expect(_tenancy.tenants).to.be.an('object');
      expect(_tenancy.defaultTenant).to.equal(process.env.NODE_ENV || 'development');
    });
  });
  describe('#connection', () => {
    it('should accept a function', () => {
      expect(tenancy.connection.bind(tenancy, 'testconn', () => ({}))).to.not.throw(TypeError);
      expect(tenancy.connection.bind(tenancy)).to.throw(TypeError);
      expect(tenancy.connection.bind(tenancy, 'testconn', 1234)).to.throw(TypeError);
    });
  })
});



