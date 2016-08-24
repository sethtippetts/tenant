

const stderr = console.error.bind(console)

const is = (type, val) => typeof val === type

export const isUndefined = is.bind(null, 'undefined')
export const isObject = is.bind(null, 'object')
export const isString = is.bind(null, 'string')
export const isFunction = is.bind(null, 'function')

export const noop = () => {}

export const defaultLogger = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: stderr,
  error: stderr,
  fatal: stderr,
}
