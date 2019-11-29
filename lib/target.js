const { Builder } = require('./builder')
const { system } = require('pkg-fetch')
const assert = require('assert')
const mkdirp = require('mkdirp')
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

    const host = system.toFancyPlatform(opts.platform || platform.host)
    const { type } = opts

    const basename = path.basename(pathspec)
    const extname = path.extname(pathspec)

    this.pathspec = path.resolve(pathspec)
    this.platform = platform
    this.config = opts.config
    this.type = opts.type
    this.v8 = opts.v8

    this.output = path.join(
      path.resolve(opts.output),
      this.platform.arch,
      this.platform.host,
    )

    this.binary = path.join(
      this.output,
      'pkg',
      basename.replace(extname, '')
    )

    let builder = opts.builder || null

    if (!builder) {
      try {
        builder = require(`./builders/${host}/${type}`)
      } catch (err) {
        if (err && 'MODULE_NOT_FOUND' !== err.code) {
          throw err
        } else {
          debug(err)
        }

        try {
          builder = require(`./builders/default/${type}`)
        } catch (err) {
          if (err && 'MODULE_NOT_FOUND' !== err.code) {
            throw err
          } else {
            debug(err)
            throw new Error(`Invalid builder type: ${type}`)
          }
        }
      }
    }

    assert('function' === typeof builder,
      'Builder factory should be a function')

    this.builder = Builder.from(builder(this, opts))
  }

  /**
   * TODO
   * @param {Function} callback
   */
  build(callback) {
    const steps = new Batch().concurrency(1)
    steps.push((next) => { mkdirp(this.output, next) })

    steps.push((next) => this.builder.init(next))
    steps.push((next) => this.builder.build(next))
    steps.push((next) => this.builder.cleanup(next))
    steps.end((err, results) => {
      if (err) { return callback(err) }
      callback(err, results.filter(Boolean)[0])
    })
  }
}

/**
 * Module exports.
 */
module.exports = {
  Target
}
