const { Platform } = require('./platform')
const { Target } = require('./target')
const Batch = require('batch')
const path = require('path')
const os = require('os')

/**
 * Default packaging concurrency.
 * @private
 */
const DEFAULT_CONCURRENCY = 2 * os.cpus().length

/**
 * TODO
 * @public
 * @class
 */
class Packager {

  /**
   * `Packager` class constructor.
   * @param {?(Object)} opts
   */
  constructor(opts) {
    if (!opts || 'object' !== typeof opts) {
      opts = Object.assign({}, opts)
    }

    this.cwd = opts.cwd || process.cwd()
    this.platform = opts.platform || new Platform()
    this.targets = new Map()
  }

  /**
   * Creates and returns a packaging target.
   * @param {String} target
   * @param {?(Object)} opts
   * @return {Target}
   */
  target(pathspec, opts) {
    pathspec = path.resolve(this.cwd, pathspec)

    if (!opts || 'object' !== typeof opts) {
      opts = Object.assign({}, opts)
    }

    const target = new Target(this.platform, pathspec, opts)
    this.targets.set(pathspec, target)
    return target
  }

  /**
   * TODO
   * @param {?(Object)} opts
   * @param {Function} callback
   */
  package(opts, callback) {
    if ('function' === typeof opts) {
      callback = opts
    }

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    const concurrency = opts.concurrency || DEFAULT_CONCURRENCY
    const batch = new Batch().concurrency(concurrency)

    for (const [ pathspec, target ] of this.targets) {
      batch.push((next) => target.build(next))
    }

    batch.end(callback)
  }
}

/**
 * Module exports.
 */
module.exports = {
  Packager
}
