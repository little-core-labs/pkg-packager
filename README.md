pkg-packager
============

> Package pkg ([@zeit/pkg][pkg]) based applications into production bundles for Linux, macOS, and Windows.

## Status

> **Development/Testing/Documentation**

[![Actions Status](https://github.com/little-core-labs/pkg-packager/workflows/Node%20CI/badge.svg)](https://github.com/little-core-labs/pkg-packager/actions)

## Installation

```sh
$ npm install pkg-packager
```

## Usage

> TODO

## API

> TODO

## Builders

> TODO

### Built-in

- [ZIP](./lib/builders/default/zip) (_all platforms_)
- [TAR](./lib/builders/default/tar) (_all platforms_) **coming soon**

### External

- [AppImage][pkg-packager-appimage] (_Linux only_)
- [DMG][pkg-packager-dmg] (_macOS only)

## See Also

- [app-builder][app-builder]
- [pkg][pkg]
- [pkg-packager-cli][pkg-packager-cli]

## License

MIT

[app-builder]: https://github.com/develar/app-builder
[pkg]: https://github.com/zeit/pkg
[pkg-packager-appimage]: https://github.com/little-core-labs/pkg-packager-appimage
[pkg-packager-cli]: https://github.com/little-core-labs/pkg-packager-cli
