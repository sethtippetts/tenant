/* global describe, it, beforeEach */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Bluebird from 'bluebird';

import Connection from '../Connection';
import { UNKNOWN_STATUS, OFFLINE_STATUS } from '../constants';

chai.use(chaiAsPromised);

let { expect } = chai;

var config = {
  factory(){
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
    it('should have a name', function(){
      expect(blueprint.name).to.equal('test');
      expect(blueprint.name).to.not.equal('test1');
    });
    it('should have a "factory"', () => {
      expect(blueprint.factory).to.be.a('function');
    });

    it('should have a "health" method', () => {
      expect(blueprint.health).to.be.a('function');
    });
  });
  describe('#health', () => {
    it('should return a promise', () => {
      let results = blueprint.health({});
      expect(results).to.be.an.instanceof(Bluebird);
    });
    it(`should set status to "${OFFLINE_STATUS}" if the health check was unsuccessful`, () => {
      blueprint = new Connection('test', { factory: () => {}, health: () => false });

        // expect().to.eventually.equal(false);
      let results = blueprint.health(connection);

      expect(results).to.eventually.equal(false);
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
  describe('#factory', () => {
    it('should return a promise', () => {
      let results = blueprint.factory({});
      expect(results).to.be.an.instanceof(Bluebird);
    });
    it('should return a connection with a status of UNKNOWN', () => {
      expect(blueprint.factory({})).to.eventually.deep.property('status', UNKNOWN_STATUS);
    });
  });
});


