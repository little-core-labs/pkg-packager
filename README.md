pkg-packager
============

> Package pkg (@zeit/pkg) based applications into production bundles for Linux, macOS, and Windows.

## Status

> **Development/Testing/Documentation**

[![Actions Status](https://github.com/little-core-labs/pkg-packager/workflows/Node%20CI/badge.svg)](https://github.com/little-core-labs/pkg-packager/actions)

## Installation

```sh
$ npm install pkg-packager
```

## Usage

```js
const packager = require('pkg-packager')

// input can be file or directory
packager.target('/path/to/pkg/files', {
  type: 'appimage',
  output: './build', // build to `build/HelloWorld.AppImage`
  productName: 'HelloWorld',
  executableName: 'hello',
  productFileName: 'HelloWorld',
  icons: [{
    file: path.resolve('./icon.ico'),
    size: 64
  }]
})

// package all targets
packager.package((err) => {
})
```

## API

> TODO

## See Also

- [pkg][ncc]
- [app-builder][app-builder]

## License

MIT

[pkg]: https://github.com/zeit/pkg
[app-builder]: https://github.com/develar/app-builder
