const { appBuilderPath } = require('app-builder-bin')
const nanoprocess = require('nanoprocess')
const mirror = require('mirror-folder')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const Batch = require('batch')
const path = require('path')
const copy = require('cp-file')
const fs = require('fs')

/**
 * TODO
 * @public
 * @class
 * @see {@link https://github.com/develar/app-builder/blob/master/pkg/package-format/appimage/configuration.go}
 */
class Configuration {

  /**
   * `Configuration` class constructor.
   * @param {Object} opts
   */
  constructor(opts) {
    this.productName = opts.productName
    this.productFileName = opts.productFileName
    this.executableName = opts.executableName
    this.systemIntegration = opts.systemIntegration || ''
    this.desktopEntry = opts.desktopEntry
    this.fileAssociations = opts.fileAssociations || []
    this.icons = opts.icons || []
  }
}

/**
 * TODO
 * @public
 * @param {Target} target
 */
function appimage(target, opts) {
  const configuration = new Configuration(opts)

  const appDirectory = path.join(target.output, 'app')
  const stageDirectory = path.join(target.output, 'stage')
  const templateDirectory = path.resolve(
    __dirname, '..', '..', '..', '..',
    'templates', 'linux', 'appimage')

  const outputName = path.join(
    target.output,
    configuration.productFileName + '.AppImage')

  const appBuilder = nanoprocess(appBuilderPath, [
    'appimage',
    `--configuration=${JSON.stringify(configuration)}`,
    '--output', outputName,
    '--stage', stageDirectory,
    '--app', appDirectory,
  ], {
    stdio: 'pipe'
  })

  if (opts.license) {
    appBuilder.args.push('--license', opts.license)
  }

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

    let response = null

    steps.push((next) => rimraf(stageDirectory, next))
    steps.push((next) => rimraf(appDirectory, next))
    steps.push((next) => rimraf(outputName, next))

    steps.push((next) => mkdirp(stageDirectory, next))
    steps.push((next) => mkdirp(appDirectory, next))

    steps.push((next) => mirror(templateDirectory, appDirectory, next))

    steps.push((next) => {
      fs.stat(target.pathspec, (err, stats) => {
        if (err) { return next(err) }
        if (stats.isDirectory()) {
          mirror(target.pathspec, appDirectory, next)
        } else {
          const basename = path.basename(target.pathspec)
          const destination = path.join(appDirectory, basename)
          copy(target.pathspec, destination)
            .then(() => next(null))
            .catch((err) => next(err))
        }
      })
    })

    steps.push((next) => appBuilder.open(next))
    steps.push((next) => {
      appBuilder.process.stdout.once('data', (data) => {
        if (data) {
          response = JSON.parse(data.toString())
          Object.assign(response, {
            name: path.basename(outputName)
          })
        }

        appBuilder.close(next)
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
    steps.push((next) => rimraf(stageDirectory, next))
    steps.push((next) => rimraf(appDirectory, next))
    steps.end((err) => callback(err))
  }
}

/**
 * Module exports.
 */
module.exports = appimage
