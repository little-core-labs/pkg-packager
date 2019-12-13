const { Builder } = require('./builder')
const { system } = require('pkg-fetch')
const assert = require('assert')
const mkdirp = require('mkdirp')
const Batch = require('batch')
const debug = require('debug')('pkg-packager')
const path = require('path')

/**
 * The host platform name in fancy form for `pkg`.
 * @private
 */
const PKG_PLATFORM = system.toFancyPlatform(process.platform)

/**
 * The default builder type based on `PKG_PLATFORM`.
 * @private
 */
const DEFAULT_TYPE = ({
  linux: 'appimage',
  macos: 'appdmg',
  win: 'exe',
})[PKG_PLATFORM]

/**
 * The `Target` class represents a container for
 * a packaging builder target. Builders are loaded based
 * on platform information and target configuration.
 * @public
 * @class
 */
class Target {

  /**
   * `Target` class constructor.
   * @param {Platform} platform
   * @param {String} pathspec
   * @param {Object} opts
   * @param {?(Array<String|Object>)} opts.assets
   * @param {?(Builder|Object)} opts.builder
   * @param {?(String)} opts.config
   * @param {?(Array<String|Object>)} opts.directories
   * @param {?(Function)} opts.loadBuilder
   * @param {?(String)} opts.output
   * @param {?(String)} opts.platform
   * @param {?(Array<String|Object>)} opts.symlinks
   * @param {?(String)} opts.type
   * @param {?(Array<String>|String)} opts.v8
   */
  constructor(platform, pathspec, opts) {
    assert(opts && 'object' === typeof opts, '`opts` is not an object.')
    assert('string' === typeof opts.output, '`opts.output` is not a string.')

    const host = system.toFancyPlatform(opts.platform || platform.host)
    const { type = DEFAULT_TYPE } = opts

    assert('string' === typeof type, '`opts.type` is not a string.')

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
      const builderPaths = [
        // built-in
        `./builders/${host}/${type}`,
        // default
        `./builders/default/${type}`,
        // local
        path.resolve(process.cwd(), 'pkg', 'packager', 'builders', host, type),
        // module
        `pkg-packager-${type}/${host}`
      ]

      for (const builderPath of builderPaths) {
        if (builder) { break }
        try {
          if ('function' === typeof opts.loadBuilder) {
            builder = opts.loadBuilder(builderPath)
          } else {
            throw { code: 'MODULE_NOT_FOUND' }
          }
        } catch (err) {
          if (err && 'MODULE_NOT_FOUND' !== err.code) {
            throw err
          } else {
            try {
              builder = require(builderPath)
            } catch (err) {
              if (err && 'MODULE_NOT_FOUND' !== err.code) {
                throw err
              }
            }
          }
        }
      }

      if (!builder) {
        throw new Error(`Invalid builder type: ${type}`)
      }
    }

    assert('function' === typeof builder,
      'Builder factory should be a function')

    this.builder = Builder.from(builder(this, opts))
  }

  /**
   * Initializes and builds the output for the target based on
   * the initialized builder.
   * @param {Function} callback
   */
  build(callback) {
    const steps = new Batch().concurrency(1)
    steps.push((next) => { mkdirp(this.output, next) })

    let response = null
    steps.push((next) => this.builder.init(next))
    steps.push((next) => {
      this.builder.build((err, result) => {
        if (result) { response = result }
        next(err)
      })
    })
    steps.push((next) => this.builder.cleanup(next))
    steps.end((err) => callback(err, response))
  }
}

/**
 * Module exports.
 */
module.exports = {
  Target
}
