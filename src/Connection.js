import Debug from 'debug';

let log = new Debug('tenant:connection');

export default class Connection {
  constructor (name, _factory) {
    log(`Constructor for "${name}" connection.`);

    // Connection name
    if (typeof name !== 'string') throw new TypeError('Connection name must be type String');
    this.name = name;

    // Factory method
    if (typeof _factory !== 'function') throw new TypeError('Connection factory method must be type Function');
    this.argumentsLength = _factory.length;
    this._factory = _factory;
  }
  factory(...value) {

    // If they don't pass all the argument their factory requires
    if (value.length !== this.argumentsLength) {
      while (value.length < this.argumentsLength) {
        value.unshift(null);
      }
    }

    // Getter
    return this._factory(...value);
  }
}
