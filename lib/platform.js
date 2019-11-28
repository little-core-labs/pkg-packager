const { system } = require('pkg-fetch')

/**
 * TODO
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
   * TODO
   * @accessor
   */
  get host() {
    return system.hostPlatform
  }

  /**
   * TODO
   * @accessor
   */
  get abi() {
    return system.hostAbi
  }

  /**
   * TODO
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
