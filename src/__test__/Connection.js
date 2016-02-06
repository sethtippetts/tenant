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
  let connection;
  beforeEach(function(){
    connection = new Connection('test', config);
  });
  describe('constructor', function(){
    it('should have a name', function(){
      expect(connection.name).to.equal('test');
      expect(connection.name).to.not.equal('test1');
    });
    it('should have a connection status of UNKNOWN', () => {
      expect(connection.status).to.equal(UNKNOWN_STATUS);
    });
    it('should have a "factory"', () => {
      expect(connection.factory).to.be.a('function');
    });

    it('should have a "health" method', () => {
      expect(connection.health).to.be.a('function');
    });
  });
  describe('#health', () => {
    it('should return a promise', () => {
      let results = connection.health({});
      expect(results).to.be.an.instanceof(Bluebird);
    });
    it(`should set status to "${OFFLINE_STATUS}" if the health check was unsuccessful`, () => {
      let conn = new Connection('test', { factory: () => {}, health: () => false });
      expect(conn.health({})).to.eventually.equal(false);
      conn.health({})
        .tap(() => {
          expect(conn.status).to.not.equal(UNKNOWN_STATUS)
          expect(conn.status).to.equal(OFFLINE_STATUS)
        });
    })
  });
  describe('#factory', () => {
    it('should return a promise', () => {
      let results = connection.factory({});
      expect(results).to.be.an.instanceof(Bluebird);
    });
  });
});


