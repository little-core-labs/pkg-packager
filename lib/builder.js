/**
 * TODO
 * @public
 * @abstract
 * @class
 */
class Builder {

  /**
   * TODO
   * @param {Object} object
   * @param {?(Object)} opts
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
   */
  constructor() { }

  /**
   * TODO
   * @abstract
   * @param {Function} callback
   */
  init(callback) {
    process.nextTick(callback, null)
  }

  /**
   * TODO
   * @abstract
   * @param {Function} callback
   */
  build(callback) {
    process.nextTick(callback, null)
  }

  /**
   * TODO
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
