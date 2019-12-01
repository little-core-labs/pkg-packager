pkg-packager
============

> Package pkg (@zeit/pkg) based applications into production bundles for Linux, macOS, and Windows.

## Status

> **Development/Testing/Documentation**

[![Actions Status](https://github.com/little-core-labs/pkg-packager/workflows/Node%20CI/badge.svg)](https://github.com/little-core-labs/pkg-packager/actions)

## Installation

```sh
$ npm install pkg-packager -g
```

## Usage

```sh
$ pkg-packager *.js -p linux -t appimage -d lib/ --product-name HelloWorld
$ ./build/linux/x64/HelloWorld.AppImage
```

## API

> TODO

## See Also

- [pkg][pkg]
- [app-builder][app-builder]

## License

MIT

[pkg]: https://github.com/zeit/pkg
[app-builder]: https://github.com/develar/app-builder
