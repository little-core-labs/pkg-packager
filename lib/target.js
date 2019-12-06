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

    if (Array.isArray(opts.assets)) {
      this.assets = opts.assets
        .filter(Boolean)
        .map((asset) => 'string' === typeof asset
          ? asset.split(':')
          : asset)
        .map((tuple) => Array.isArray(tuple) && 2 === tuple.length
          ? ({ from: tuple[0], to: tuple[1] })
          : tuple)
        .map((asset) => Array.isArray(asset) && 1 == asset.length
          ? asset[0]
          : asset)
    } else {
      this.assets = []
    }

    if (Array.isArray(opts.symlinks)) {
      this.symlinks = opts.symlinks
        .filter(Boolean)
        .map((symlink) => 'string' === typeof symlink
          ? symlink.split(':')
          : symlink)
        .map((tuple) => Array.isArray(tuple)
          ? ({ from: tuple[0], to: tuple[1] })
          : tuple)
    } else {
      this.symlinks = []
    }

    if (Array.isArray(opts.directories)) {
      this.directories = opts.directories
        .filter(Boolean)
        .map((directory) => 'string' === typeof directory
          ? directory.split(':')
          : directory)
        .map((tuple) => Array.isArray(tuple)
          ? ({ from: path.resolve(process.cwd(), tuple[0]), to: tuple[1] })
          : tuple)
    } else {
      this.directories = []
    }

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
      // try built-in builder for host and type
      try {
        builder = require(`./builders/${host}/${type}`)
      } catch (err) {
        if (err && 'MODULE_NOT_FOUND' !== err.code) {
          throw err
        } else {
          debug(err)
        }

        try {
          // try default built-in builder
          builder = require(`./builders/default/${type}`)
        } catch (err) {
          if (err && 'MODULE_NOT_FOUND' !== err.code) {
            throw err
          } else {
            debug(err)
            throw new Error(`Invalid builder type: ${type}`)
          }

          // try local builder
          try {
            builder = require(path.resolve(
              process.cwd(),
              `pkg/packager/${host}/${type}`))
          } catch (err) {
            if (err && 'MODULE_NOT_FOUND' !== err.code) {
              throw err
            } else {
              debug(err)
            }

            try {
              builder = require(`pkg-packager-${type}/${host}`)
            } catch (err) {
              if (err && 'MODULE_NOT_FOUND' !== err.code) {
                throw err
              } else {
                debug(err)
              }
            }
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

    let response = null
    steps.push((next) => this.builder.init(next))
    steps.push((next) => {
      this.builder.build((err, result) => {
        if (result) {
          response = result
        }
        next(err)
      })
    })
    steps.push((next) => this.builder.cleanup(next))
    steps.end((err) => {
      callback(err, response)
    })
  }
}

/**
 * Module exports.
 */
module.exports = {
  Target
}
