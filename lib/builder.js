const Resource = require('nanoresource')

/**
 * The `Builder` class represents an abstract interface for built-in, external,
 * local, and custom builders. Builders can implement various methods on this
 * class including the `open()` and `close()` methods of a `nanoresource`.
 * @public
 * @abstract
 * @class
 * @extends nanoresource
 */
class Builder extends Resource {

  /**
   * Converts an object with optional constructor `opts` to a `Builder`
   * instance ensuring all property descriptors, symbols, and prototype
   * properties are carried over. All builder implementations pass through
   * this function.
   * @param {Object} object
   * @param {?(Object)} opts
   * @return {Builder}
   */
  static from(object, opts) {
    const descriptors = Object.getOwnPropertyDescriptors(this.prototype)
    const symbols = Object.getOwnPropertySymbols(this.prototype)
    const builder = new this(opts)

    delete descriptors.constructor

    for (const symbol of symbols) {
      if (symbol in object) {
        builder[symbol] = object[symbol]
      }
    }

    for (const key in descriptors) {
      if (key in object) {
        const descriptor = Object.getOwnPropertyDescriptor(object, key)
        Object.defineProperty(builder, key, descriptor)
      }
    }

    return builder
  }

  /**
   * `Builder` class constructor.
   * @protected
   * @param {?(Object)} opts
   */
  constructor(opts) {
    super(opts)
  }

  /**
   * Abstract method for builder initialization. This is called
   * after the builder is opened.
   * @public
   * @abstract
   * @param {Function} callback
   */
  init(callback) {
    process.nextTick(callback, null)
  }

  /**
   * Abstract method for builder work. This method is called
   * after the builder is opened, initialized, and marked as
   * active. The builder is marked as inactive after `callback`
   * is called with or without an error.
   * @public
   * @abstract
   * @param {Function} callback
   */
  build(callback) {
    process.nextTick(callback, null)
  }

  /**
   * Abstract method for builder cleanup. This method is called
   * prior to closing and after the builder has completed its work and
   * marked as inactive.
   * @public
   * @abstract
   * @param {Function} callback
   */
  cleanup(callback) {
    process.nextTick(callback, null)
  }
}

/**
 * Module exports.
 */
module.exports = {
  Builder
}
