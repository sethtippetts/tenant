/* global describe, it, beforeEach */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Connection from '../Connection';

chai.use(chaiAsPromised);

let { expect } = chai;

var config = (tablename, config) => {
  return {};
};

describe('Connection', () => {
  let blueprint, connection;
  beforeEach(() => {
    blueprint = new Connection('test', config);
    return (connection = blueprint.factory({}));
  });
  describe('constructor', () => {
    it('should accept a string name', () => {
      expect(blueprint.name).to.equal('test');
      expect(blueprint.name).to.not.equal('test1');
    });
    it('should accept a factory function', () => {
      expect(Connection.bind(Connection, 'test', { factory: {} })).to.throw(TypeError);
      expect(blueprint.factory).to.be.a('function');
      expect(blueprint.argumentsLength).to.equal(2);
    });
  });
  describe('#factory', () => {
    it('should resolve to a connection object', () => {
      expect(blueprint.factory({})).to.be.an('object');
    });
    it('should match argument order of the definition', () => {
      blueprint = new Connection('test', (tablename, config) => {
        expect(tablename).to.be.null;
        expect(config).to.be.empty;
      });
      return blueprint.factory({});
    });
  });
});


