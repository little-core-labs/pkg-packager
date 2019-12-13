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

```js
const packager = require('pkg-packager')

packager.target('./path/to/application', {
  type: 'appimage'
  productName: 'Application'
})

packager.package((err, results) => {
  console.log('built:', results.name)
})
```

## API

### `const packager = require('pkg-packager')`

#### `packager.target(pathspec[, opts])`

Creates and returns a packaging target where `pathspec` is
a path that can be resolved to a location on the file system
and `opts` can be:

```js
{
  assets: [],                                   // An array of assets to copy over explitilty
  builder: null,                                // A custom builder for this target
  config: null,                                 // path to `pkg` configuration file
  directories: [],                              // An array of directories to copy over explitilty
  loadBuilder: (filename) => require(filename), // A function to load a builder module by filename
  output: 'build/',                             // default build output directory
  platform: 'linux|macos|win',                  // Platform target (default value depends on process platform)
  symlinks: [],                                 // An array of symlinks in the form of {from: '...', to: '...'}
  type: 'appimage|appdmg|exe',                  // Builder type to use (default value depends on process platform)
  v8: [],                                       // An array of v8 options given to `pkg` that are "baked" into the built application
}
```

#### `packager.package([opts, ]callback)`

Enumerates all created targets, compiling each with `pkg` if
the it is non-binary, and then triggering the target's builder.
The `callback` function will be called when packaging is complete
or when an error occurs. The value of `opts` is optional and can be:

```js
{
  config: null,  // path to `pkg` configuration file, overloads target configuration (if set)
  debug: false,  // If set to `true`, will enable "debug" output for `pkg`
  v8: [],        // An array of v8 options given to `pkg` that are "baked" into the built application, overloads target v8 options (if set)
}
```

## Builders

The `pkg-packager` comes built-in and pre-installed builders to use out
of the box.

### Built-in

- [ZIP](./lib/builders/default/zip) (_all platforms_)
- [TAR](./lib/builders/default/tar) (_all platforms_) **coming soon**

### External

- [.AppImage][pkg-packager-appimage] (_Linux only_)
- [.dmg (.app)][pkg-packager-appdmg] (_macOS only)
- [.exe][pkg-packager-exe] (_Windows only) **coming soon**

## See Also

- [app-builder][app-builder]
- [pkg][pkg]
- [pkg-packager-cli][pkg-packager-cli]

## License

MIT

[app-builder]: https://github.com/develar/app-builder
[pkg]: https://github.com/zeit/pkg
[pkg-packager-appimage]: https://github.com/little-core-labs/pkg-packager-appimage
[pkg-packager-appdmg]: https://github.com/little-core-labs/pkg-packager-appdmg
[pkg-packager-cli]: https://github.com/little-core-labs/pkg-packager-cli
