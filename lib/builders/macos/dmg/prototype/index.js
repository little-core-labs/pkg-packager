// Copy the output of provider's build folder
// to an 'assets' folder and  provide an icns file
// Then this prototype will work

const path = require('path')
const dmg = require('../../dmg')

const resolve = (p) => path.resolve(__dirname, p)

const icon = resolve('./NYCPF-XRIcon.icns')
const output = resolve('./build')
const productName = 'NYCPF XR'
const assetFolder = resolve('./assets')
const launchCommand = './bin/boot'

const builder = dmg(assetFolder, {
  icon,
  output,
  productName,
  executableName: launchCommand,
  bundleId: 'org.littlstar.NYCPFXR',
  version: '1.0.0',
  copyright: '© 2019 Littlstar'
})

builder.build(err => {
  if (err) throw err
  console.log('done!')
})
