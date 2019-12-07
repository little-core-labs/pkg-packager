const { system } = require('pkg-fetch')

/**
 * The `Platform` class represents a small wrapper around the
 * system information exported by the `pkg-fetch` module.
 * @public
 * @class
 */
class Platform {

  /**
   * `Platform` class constructor.
   * @constructor
   */
  constructor() { }

  /**
   * The host platform type.
   * @accessor
   */
  get host() {
    return system.hostPlatform
  }

  /**
   * The host platform Node ABI.
   * @accessor
   */
  get abi() {
    return system.hostAbi
  }

  /**
   * The host platform architecture.
   * @accessor
   */
  get arch() {
    return system.hostArch
  }
}

/**
 * Module exports.
 */
module.exports = {
  Platform
}
