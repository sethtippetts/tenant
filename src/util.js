const stderr = console.error.bind(console)

const is = (type, val) => typeof val === type

const isFunction = is.bind(null, 'function')
const isObject = is.bind(null, 'object')
const isString = is.bind(null, 'string')
const isUndefined = is.bind(null, 'undefined')

const noop = () => {}

const defaultLogger = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: stderr,
  error: stderr,
  fatal: stderr,
}

module.exports = {
  isUndefined,
  isObject,
  isString,
  isFunction,
  noop,
  defaultLogger,
}
