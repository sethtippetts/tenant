import Connection from './Connection';
import { defaultLogger } from './util'

export default class Tenant {
  constructor(name, config, connections = {}, logger = defaultLogger) {

    if (typeof name !== 'string') throw new TypeError(`Expected tenant name to be type "string" not "${typeof name}"`);

    if (typeof config === 'undefined') throw new TypeError(`Tenant requires a configuration.`);

    // Assign
    this.name = name;
    this.config = config;
    this.connections = {};
    this.logger = logger

    Object.keys(connections)
      .map(key => this.connection(key, connections[key]));
  }
  connection(name, value = []) {

    if (typeof name !== 'string') throw new TypeError('Connection name is required.');


    if (!value || Array.isArray(value)) {
      // Getter
      let connection = this.connections[name];
      let factory = connection.factory.bind(connection);

      if (!factory || typeof factory !== 'function') {
        throw new RangeError(`Connection name "${name}" not found.`);
      }

      // Create a new connection with the named factory
      return factory(...value, this.config);
    }

    // Setter
    if (!(value instanceof Connection)) {
      value = new Connection(name, value);
    }

    this.connections[name] = value;
    return this;
  }
}
