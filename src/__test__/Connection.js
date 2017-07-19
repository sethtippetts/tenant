/* global describe, it, beforeEach */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const Tenancy = require('../Tenancy')
const { Connection } = Tenancy

chai.use(chaiAsPromised)

const { expect } = chai

const config = (tablename, config) => { // eslint-disable-line no-unused-vars
  return {}
}

describe('Connection', () => {
  let blueprint
  beforeEach(() => {
    blueprint = new Connection('test', config)
    return blueprint.factory({})
  })
  describe('constructor', () => {
    it('should accept a string name', () => {
      expect(blueprint.name).to.equal('test')
      expect(blueprint.name).to.not.equal('test1')
    })
    it('should accept a factory function', () => {
      expect(Connection.bind(Connection, 'test', { factory: {} })).to.throw(TypeError)
      expect(blueprint.factory).to.be.a('function')
      expect(blueprint.argumentsLength).to.equal(2)
    })
    it('should throw a TypeError if the first argument is not a string', () => {
      const failed = (input) => new Connection(input, config)
      expect(failed.bind(this, 0)).to.throw(TypeError)
      expect(failed.bind(this, null)).to.throw(TypeError)
      expect(failed.bind(this, {})).to.throw(TypeError)
    })
  })
  describe('#factory', () => {
    it('should resolve to a connection object', () => {
      expect(blueprint.factory({})).to.be.an('object')
    })
    it('should match argument order of the definition', () => {
      blueprint = new Connection('test', (tablename, config) => {
        expect(tablename).to.be.null // eslint-disable-line no-unused-expressions
        expect(config).to.be.empty // eslint-disable-line no-unused-expressions
      })
      return blueprint.factory({})
    })
  })
})
