const { zip } = require('cross-zip')
const mirror = require('mirror-folder')
const mkdirp = require('mkdirp')
const crypto = require('crypto')
const rimraf = require('rimraf')
const Batch = require('batch')
const copy = require('cpy')
const path = require('path')
const fs = require('fs')

// quick util
const errback = (p, cb) => void p.then((r) => cb(null, r), cb).catch(cb)

const activeZips = new Map()

/**
 * TODO
 * @public
 * @param {Target} target
 * @param {Object}
 */
function zipBuilder(target, opts) {
  let stageDirectory = path.join(target.output, 'stage')
  const appDirectory = path.join(target.output, 'app')
  const outputName = path.join(target.output, `${opts.productName}.zip`)
  const state = activeZips.get(stageDirectory) || { outputName, actives: 0 }

  state.actives++
  activeZips.set(stageDirectory, state)

  stageDirectory = path.join(stageDirectory, opts.productName)
  state.stageDirectory = stageDirectory

  // `Builder` interface
  return {
    init, build, cleanup
  }

  /**
   * TODO
   * @param {Function} callback
   */
  function init(callback) {
    const steps = new Batch().concurrency(1)
    steps.push((next) => rimraf(state.outputName, next))
    steps.push((next) => mkdirp(stageDirectory, next))
    steps.push((next) => mkdirp(appDirectory, next))
    steps.end(callback)
  }

  /**
   * TODO
   * @param {Function} callback
   */
  function build(callback) {
    const steps = new Batch().concurrency(1)

    let response = null

    steps.push((next) => {
      errback(copy(target.binary, appDirectory), next)
    })

    if (Array.isArray(target.directories)) {
      for (const dir of target.directories) {
        try {
          const stats = fs.statSync(dir.from)
          if (!stats.isDirectory()) {
            continue
          }
        } catch (err) {
          debug(err)
          continue
        }

        const from = dir.from
        const to = path.resolve(appDirectory, dir.to || path.basename(dir))
        steps.push((next) => mkdirp(to, next))
        steps.push((next) => {
          mirror(from, to, { keepExisting: true }, next)
        })
      }
    }

    if (Array.isArray(target.symlinks)) {
      for (const symlink of target.symlinks) {
        steps.push((next) => {
          const cwd = process.cwd()
          process.chdir(appDirectory)
          const from = path.relative(appDirectory, symlink.from)
          const to = path.relative(appDirectory, symlink.to)
          rimraf(to, (err) => {
            if (err) {
              process.chdir(cwd)
              next(err)
            } else {
              fs.symlink(from, to, (err) => {
                process.chdir(cwd)
                next(err)
              })
            }
          })
        })
      }
    }

    steps.push((next) => {
      mirror(appDirectory, stageDirectory, { keepExisting: true }, next)
    })

    if (0 === --state.actives) {
      steps.push((next) => zip(state.stageDirectory, state.outputName, next))

      steps.push((next) => {
        fs.stat(state.outputName, (err, stats) => {
          if (err) { return next(err) }
          response = { size: stats.size }
          next(null)
        })
      })

      steps.push((next) => {
        const hash = crypto.createHash('sha512')
        fs.readFile(state.outputName, (err, buffer) => {
          if (err) { return next(err) }
          try {
            hash.update(buffer)
            response.sha512 = hash.digest('base64')
            response.name = path.basename(state.outputName)
            next(null)
          } catch (err) {
            next(err)
          }

          activeZips.delete(stageDirectory)
        })
      })
    }

    steps.end((err) => {
      callback(err, response)
    })
  }

  /**
   * TODO
   * @param {Function} callback
   */
  function cleanup(callback) {
    const steps = new Batch()
    if (!opts.debug) {
      steps.push((next) => rimraf(path.dirname(stageDirectory), next))
      steps.push((next) => rimraf(appDirectory, next))
    }
    steps.end((err) => callback(err))
  }

}

/**
 * Module exports.
 */
module.exports = zipBuilder
