/* global describe, it, beforeEach */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Bluebird from 'bluebird';

import Connection from '../Connection';
import { ONLINE_STATUS, UNKNOWN_STATUS, OFFLINE_STATUS } from '../constants';

chai.use(chaiAsPromised);

let { expect } = chai;

var config = {
  factory(tablename, config){
    return Promise.resolve({});
  },
  destroy(){
    return Promise.resolve(true);
  },
  health(){
    return Promise.resolve(true);
  },
};

describe('Connection', function(){
  let blueprint, connection;
  beforeEach(function(){
    blueprint = new Connection('test', config);
    return blueprint.factory({})
      .then(conn => connection = conn);
  });
  describe('constructor', function(){
    it('should accept a string name', function(){
      expect(blueprint.name).to.equal('test');
      expect(blueprint.name).to.not.equal('test1');
    });
    it('should accept a factory function', () => {
      expect(Connection.bind(Connection, 'test', { factory: {} })).to.throw(TypeError);
      expect(blueprint.factory).to.be.a('function');
      expect(blueprint.argumentsLength).to.equal(2);
    });
    it('should accept a "health" method', () => {
      expect(blueprint.health).to.be.a('function');
    });
  });
  describe('#verify', () => {
    it(`should return false if status !== ${ONLINE_STATUS}`, () => {
      expect(blueprint.verify({ status: UNKNOWN_STATUS })).to.equal(false);
      expect(blueprint.verify({ status: 'random_string' })).to.equal(false);
    });
    it('should return false if the cache TTL was set and has expired', () => {
      blueprint = new Connection('name', { factory() {}, cache: { ttl: 100 } });
      expect(blueprint.verify({ status: ONLINE_STATUS, createdAt: (new Date()).getTime() - 200 })).to.equal(false);
      expect(blueprint.verify({ status: ONLINE_STATUS, createdAt: (new Date()).getTime() })).to.equal(true);
    });
  });
  describe('#health', () => {
    it('should require a connection object', () => {
      expect(blueprint.health).to.throw(TypeError);
    });
    it('should return a custom object if the health method does', () => {
      blueprint = new Connection('test', { factory() {}, health: () => Bluebird.resolve({ hotdog: true })});
      expect(blueprint.health(connection)).to.eventually.deep.equal({ hotdog: true });
    });
    it('should return a standard status and value by default', () => {
      expect(blueprint.health(connection)).to.eventually.have.deep.property('status', ONLINE_STATUS);
      expect(blueprint.health(connection)).to.eventually.have.deep.property('value', true);
    });
    it('should only return a status if the value resolved to a constant', () => {
      blueprint = new Connection('test', { factory() {}, health: () => OFFLINE_STATUS });
      expect(blueprint.health(connection)).to.eventually.have.deep.property('status', OFFLINE_STATUS);
      expect(blueprint.health(connection)).to.not.eventually.have.deep.property('value');
    });
    it('should return a promise', () => {
      let results = blueprint.health(connection);
      expect(results).to.be.an.instanceof(Bluebird);
    });
    it(`should set status to "${OFFLINE_STATUS}" if the health check was unsuccessful`, () => {
      blueprint = new Connection('test', { factory: () => {}, health: () => false });

      let results = blueprint.health(connection);

      expect(results).to.eventually.have.deep.property('value', false);
      return results
        .tap(() => {
          expect(connection.status).to.not.equal(UNKNOWN_STATUS);
          expect(connection.status).to.equal(OFFLINE_STATUS);
        });
    });
    it(`should handle a throw or rejection`, () => {
      blueprint = new Connection('test', { factory: () => {}, health: () => { throw new Error('Test connection health check failed.'); } });
      expect(blueprint.health(connection)).to.eventually.be.rejectedWith(Error);
    });
  });
  describe.only('#factory', () => {
    it('should return a promise', () => {
      let results = blueprint.factory({});
      expect(results).to.be.an.instanceof(Bluebird);
    });
    it('should resolve to a connection object', () => {
      expect(blueprint.factory({})).to.eventually.have.property('createdAt');
      expect(blueprint.factory({})).to.eventually.have.property('connection');
      expect(blueprint.factory({})).to.eventually.have.property('status');
      expect(blueprint.factory({})).to.eventually.have.property('retries', 0);
    });
    it('should match argument order of the definition', () => {
      blueprint = new Connection('test', {
        factory(tablename, config) {
          expect(tablename).to.be.null;
          expect(config).to.be.empty;
        },
      });
      return blueprint.factory({});
    })
    it('should return a connection with a status of UNKNOWN', () => {
      expect(blueprint.factory({})).to.eventually.deep.property('status', UNKNOWN_STATUS);
    });
  });
});


