const Connection = require('./Connection')
const {
  defaultLogger,
  isFunction,
  isString,
  isUndefined,
} = require('./util')

module.exports = class Tenant {
  constructor (name, config, connections = {}, logger = defaultLogger) {
    if (!isString(name)) throw new TypeError(`Expected tenant name to be type "string" not "${ typeof name }"`)

    if (isUndefined(config)) throw new TypeError(`Tenant requires a configuration.`)

    // Assign
    this.name = name
    this.config = config
    this.connections = {}
    this.logger = logger

    Object.keys(connections)
      .map(key => this.connection(key, connections[key]))
  }
  connection (name, value = []) {
    if (!isString(name)) throw new TypeError('Connection name is required.')

    if (!value || Array.isArray(value)) {
      // Getter
      const connection = this.connections[name]
      if (!connection || !connection.factory || !isFunction(connection.factory)) {
        throw new RangeError(`Connection name "${ name }" not found.`)
      }

      const factory = connection.factory.bind(connection)

      // Create a new connection with the named factory
      return factory(...value, this.config)
    }

    // Setter
    if (!(value instanceof Connection)) {
      value = new Connection(name, value)
    }

    this.connections[name] = value
    return this
  }
}
