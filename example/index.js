const packager = require('../')
const path = require('path')

packager.target(path.resolve(__dirname, 'hello.js'), {
  output: 'build',
  productName: 'hello',
  executableName: 'hello',
  productFileName: 'Hello',
  icons: [{
    file: path.resolve('assets', 'icon.ico'),
    size: 64
  }]
})

packager.package((err, results) => {
  err && console.log(err)
  console.log('result', results)
})
