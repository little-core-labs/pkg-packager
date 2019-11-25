const { Builder } = require('./builder')
const assert = require('assert')
const Batch = require('batch')
const debug = require('debug')('pkg-packager')
const path = require('path')

/**
 * TODO
 * @public
 * @class
 */
class Target {

  /**
   * `Target` class constructor.
   * @param {Platform} platform
   * @param {String} pathspec
   * @param {Object} opts
   */
  constructor(platform, pathspec, opts) {
    assert(opts && 'object' === typeof opts, '`opts` is not an object.')
    assert('string' === typeof opts.type, '`opts.type` is not a string.')
    assert('string' === typeof opts.output, '`opts.output` is not a string.')

    const { host } = platform
    const { type } = opts


    this.pathspec = path.resolve(pathspec)
    this.platform = platform
    this.output = path.resolve(opts.output)
    this.type = opts.type

    try {
      require.resolve(`./builders/${host}/${type}`)
    } catch (err) {
      debug(err)
      throw new Error(`Invalid builder type: ${type}`)
    }

    const builder = require(`./builders/${host}/${type}`)
    this.builder = Builder.from(builder(this, opts))
  }

  /**
   * TODO
   * @param {Function} callback
   */
  build(callback) {
    const steps = new Batch().concurrency(1)
    steps.push((next) => this.builder.init(next))
    steps.push((next) => this.builder.build(next))
    steps.push((next) => this.builder.cleanup(next))
    steps.end(callback)
  }
}

/**
 * Module exports.
 */
module.exports = {
  Target
}
