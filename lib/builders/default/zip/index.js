const { zip } = require('cross-zip')
const mirror = require('mirror-folder')
const mkdirp = require('mkdirp')
const crypto = require('crypto')
const rimraf = require('rimraf')
const Batch = require('batch')
const copy = require('cp-file')
const path = require('path')
const fs = require('fs')

/**
 * TODO
 * @public
 * @param {Target} target
 * @param {Object}
 */
function zipBuilder(target, opts) {
  const stageDirectory = path.join(target.output, 'stage', opts.productName)
  const appDirectory = path.join(target.output, 'app')
  const outputName = path.join(target.output, `${opts.productName}.zip`)

  // `Builder` interface
  return {
    init, build, cleanup
  }

  /**
   * TODO
   * @param {Function} callback
   */
  function init(callback) {
    callback(null)
  }

  /**
   * TODO
   * @param {Function} callback
   */
  function build(callback) {
    const steps = new Batch().concurrency(1)

    const response = {
      sha512: null,
      name: path.basename(outputName),
      size: 0,
    }

    steps.push((next) => rimraf(stageDirectory, next))
    steps.push((next) => rimraf(appDirectory, next))
    steps.push((next) => rimraf(outputName, next))

    steps.push((next) => mkdirp(stageDirectory, next))
    steps.push((next) => mkdirp(appDirectory, next))

    steps.push((next) => {
      const basename = path.basename(target.binary)
      const destination = path.join(appDirectory, basename)
      copy(target.binary, destination)
        .then(() => next(null))
        .catch((err) => next(err))
    })

    steps.push((next) => mirror(appDirectory, stageDirectory, next))

    steps.push((next) => zip(stageDirectory, outputName, next))

    steps.push((next) => {
      fs.stat(outputName, (err, stats) => {
        if (err) { return next(err) }
        response.size = stats.size
        next(null)
      })
    })

    steps.push((next) => {
      const hash = crypto.createHash('sha512')
      fs.readFile(outputName, (err, buffer) => {
        if (err) { return next(err) }
        try {
          hash.update(buffer)
          response.sha512 = hash.digest('base64')
          next(null)
        } catch (err) {
          next(err)
        }
      })
    })

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
    steps.push((next) => rimraf(path.dirname(stageDirectory), next))
    steps.push((next) => rimraf(appDirectory, next))
    steps.end((err) => callback(err))
  }

}

/**
 * Module exports.
 */
module.exports = zipBuilder
