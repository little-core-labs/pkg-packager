const nanoprocess = require('nanoprocess')
const mirror = require('mirror-folder')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const Batch = require('batch')
const path = require('path')
const copy = require('cp-file')
const fs = require('fs')
const appdmg = require('appdmg')

function dmg(target, opts) {
  const configuration = new Configuration(opts)
  const appDirectory = path.join(target.output, 'app')
  const stageDirectory = path.join(target.output, 'stage')

  const templateDirectory = path.resolve(
    __dirname, '..', '..', '..', '..',
    'templates', 'macos', 'dmg')

  // `Builder` interface
  return {
    init, build, cleanup
  }

  function build(callback) {
    const steps = new Batch().concurrency(1)
    steps.push((next) => rimraf(stageDirectory, next))
    steps.push((next) => rimraf(appDirectory, next))
    steps.push((next) => rimraf(outputName, next))

    steps.push((next) => mkdirp(stageDirectory, next))
    steps.push((next) => mkdirp(appDirectory, next))

    steps.push((next) => mirror(templateDirectory, appDirectory, next))

    // rename app-name.app
    // set up run command script
    // Update Info.plist
    // copy target into Resources
    // DMG the results
  }

  function cleanup(callback) {
    const steps = new Batch()
    steps.push((next) => rimraf(stageDirectory, next))
    steps.push((next) => rimraf(appDirectory, next))
    steps.end((err) => callback(err))
  }
}

module.exports = dmg
