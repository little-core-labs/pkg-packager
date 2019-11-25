const packager = require('./')
const path = require('path')

packager.target('./hello', {
  type: 'appimage',
  output: './build',
  productName: 'hello',
  executableName: 'hello',
  productFileName: 'Hello',
  icons: [{
    file: path.resolve('./icon.ico'),
    size: 64
  }]
})

packager.package((err) => {
  err && console.log(err)
})
