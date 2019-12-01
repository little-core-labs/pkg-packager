const { Platform } = require('./platform')
const { Target } = require('./target')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const Batch = require('batch')
const glob = require('glob')
const copy = require('cpy')
const path = require('path')
const pkg = require('pkg')
const os = require('os')

// quick util
const errback = (p, cb) => void p.then((r) => cb(null, r), cb).catch(cb)
const flatten = (a) => a.reduce((x, y) => x.concat(y), [])

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

    this.pkg = opts.pkg || pkg
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
    const responses = []
    const batch = new Batch().concurrency(1)

    for (const [ pathspec, target ] of this.targets) {
      const steps = new Batch().concurrency(1)
      const pkgArgs = [pathspec, '--targets', target.platform.host]

      if (opts.config || target.config) {
        pkgArgs.push('--config', opts.config || target.config)
      }

      if (opts.debug) {
        pkgArgs.push('--debug')
      }

      if (opts.v8 || target.v8) {
        const v8 = opts.v8 || target.v8
        if (Array.isArray(v8)) {
          pkgArgs.push('--options', v8.join(' '))
        } else if ('object' === typeof v8) {
          // convert object to `key[=value]` mapping
          pkgArgs.push('--options', Object.entries(v8)
						.map((kv) => true === kv[1] ? [[kv[0]]] : kv)
						.map((kv) => kv.join('='))
						.join(' '))
        } else if ('string' === typeof v8) {
          pkgArgs.push('--options', v8)
        }
      }

      const basename = path.basename(pathspec)
      const extname = path.extname(pathspec)

      pkgArgs.push('--output', target.binary)

      steps.push((next) => errback(this.pkg.exec(pkgArgs), next))

      if (Array.isArray(target.assets) && target.assets.length) {
        const names = target.assets.filter((a) => 'string' === typeof a)
        if (names.length) {
          steps.push((next) => {
            errback(copy(
              names,
              path.join(target.output, 'app'),
              { parents: true }),
              next)
          })
        }

        const mappings = target.assets.filter((a) => a && 'object' === typeof a)
        if (mappings.length) {
          steps.push((next) => {
            const copies = new Batch()

            for (let { from, to } of mappings) {
              const dirname = path.dirname(path.join(target.output, 'app', to))
              const rename = () => path.basename(to)
              copies.push((done) => {
                errback(copy(from, dirname, { rename }), done)
              })
            }

            copies.end(next)
          })
        }
      }

      steps.push((next) => {
        target.build((err, response) => {
          if (err) {
            next(err)
          } else {
            responses.push(response)
            next(null)
          }
        })
      })

      batch.push((next) => steps.end(next))
    }

    batch.end((err, results) => {
      if (err) { return callback(err) }
      callback(null, responses)
    })
  }
}

/**
 * Module exports.
 */
module.exports = {
  Packager
}
