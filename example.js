const packager = require('./')
const path = require('path')

packager.target('./hello.js', {
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

packager.package((err, results) => {
  err && console.log(err)
  console.log('result', results)
})
