const {
  defaultLogger,
  isString,
  isFunction,
} = require('./util')

module.exports = class Connection {
  constructor (name, _factory, logger = defaultLogger) {
    logger.trace(`Constructor for "${name}" connection.`)

    // Connection name
    if (!isString(name)) throw new TypeError('Connection name must be type String')
    this.name = name

    // Factory method
    if (!isFunction(_factory)) throw new TypeError('Connection factory method must be type Function')
    this.argumentsLength = _factory.length
    this._factory = _factory
  }
  factory(...value) {

    // If they don't pass all the argument their factory requires
    while (value.length < this.argumentsLength) {
      value.unshift(null)
    }

    // Getter
    return this._factory(...value)
  }
}
