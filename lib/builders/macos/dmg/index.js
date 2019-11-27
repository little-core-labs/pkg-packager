const mirror = require('mirror-folder')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const Batch = require('batch')
const path = require('path')
const fs = require('fs')
const appdmg = require('appdmg')
const bplist = require('bplist-parser')
const bplistCtor = require('bplist-creator')

function dmg (target, opts) {
  console.log(target, opts)
  const stageDirectory = path.join(opts.output, 'stage')
  const appBundleName = `${opts.productName}.app`
  const templateBinName = 'app-name'
  const templateBundleName = `${templateBinName}.app`
  const templateBundlePath = path.resolve(stageDirectory, templateBundleName)
  const appBundlePath = path.resolve(stageDirectory, appBundleName)
  const templateExePath = path.resolve(stageDirectory, appBundleName, `Contents/MacOS/${templateBinName}`)
  const targetExePath = path.resolve(stageDirectory, appBundleName, `Contents/MacOS/${opts.productName}`)

  const templateDirectory = path.resolve(
    __dirname, '..', '..', '..', '..',
    'templates', 'macos', 'dmg')

  // `Builder` interface
  return {
    init, build, cleanup
  }

  function init () {
    throw new Error('Not implemented')
  }

  function build (callback) {
    const steps = new Batch().concurrency(1)
    steps.push((next) => rimraf(opts.output, next))
    steps.push((next) => mkdirp(stageDirectory, next))
    steps.push((next) => mirror(templateDirectory, stageDirectory, next))

    // rename app-name.app
    steps.push(next => fs.rename(templateBundlePath, appBundlePath, next))

    // rename MacOS app-name exe
    steps.push(next => fs.rename(templateExePath, targetExePath, next))

    // set up run command in Resources/script
    steps.push(next => {
      const runScriptPath = path.resolve(stageDirectory, appBundleName, 'Contents/Resources/script')
      fs.appendFile(runScriptPath, opts.executableName, next)
    })

    // copy target into Resources
    steps.push((next) => {
      const resourcesPath = path.resolve(stageDirectory, appBundleName, 'Contents/Resources')
      mirror(target, resourcesPath, {
        keepExisting: true
      }, next)
    })

    // Copy icon into the correct location
    steps.push(next => {
      const targetIconPath = path.resolve(stageDirectory, appBundleName, 'Contents/Resources/AppIcon.icns')
      fs.copyFile(opts.icon, targetIconPath, next)
    })

    // Update Info.plist with metadata
    steps.push(next => {
      const targetInfoPlistPath = path.resolve(stageDirectory, appBundleName, 'Contents/Info.plist')
      bplist.parseFile(targetInfoPlistPath, (err, plistArray) => {
        if (err) return next(err)
        const plist = plistArray[0]
        plist.CFBundleIdentifier = opts.bundleId || 'org.littlecorelabs.pkgpackager'
        plist.CFBundleShortVersionString = opts.version || '1.0.0'
        plist.CFBundleVersion = opts.version || '1.0.0'
        plist.CFBundleExecutable = opts.productName
        plist.NSHumanReadableCopyright = opts.copyright
        plist.CFBundleName = opts.productName
        const plistBuf = bplistCtor([plist])
        fs.writeFile(targetInfoPlistPath, plistBuf, next)
      })
    })

    // DMG the results with appdmg
    steps.push(next => {
      let done = false
      const ee = appdmg({
        target: path.resolve(stageDirectory, `${opts.productName}.dmg`),
        basepath: stageDirectory,
        specification: {
          title: opts.productName,
          icon: opts.icon,
          contents: [
            { x: 448, y: 344, type: 'link', path: '/Applications' },
            { x: 192, y: 344, type: 'file', path: appBundleName }
          ]
        }
      })

      ee.on('progress', function (info) {
        console.log(info)

        // info.current is the current step
        // info.total is the total number of steps
        // info.type is on of 'step-begin', 'step-end'

        // 'step-begin'
        // info.title is the title of the current step

        // 'step-end'
        // info.status is one of 'ok', 'skip', 'fail'
      })

      ee.once('finish', function () {
        if (!done) {
          done = true
          next()
        }
      })

      ee.on('error', function (err) {
        if (!done) {
          done = true
          next(err)
        }
      })
    })

    steps.end((err) => {
      callback(err)
    })
  }

  function cleanup (callback) {
    const steps = new Batch()
    steps.push((next) => rimraf(stageDirectory, next))
    steps.end((err) => callback(err))
  }
}

module.exports = dmg
