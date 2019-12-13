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

### `packager.target(pathspec[, opts])`

Creates and returns a packaging target where `pathspec` is a path that can be
resolved to a location on the file system and `opts` can be:

```js
{
  assets: [],                        // An array of assets to copy over
                                     // explicitly to the built and packaged
                                     // application. Assets can take the form of
                                     // a string or an object like
                                     // `{from: '..', to: '..'}` to specify the
                                     // source and destination explicitly.

  builder: null,                     // A custom builder for this target which
                                     // will cause the target to skip loading a
                                     // builder and thus `opts.loadBuilder()`
                                     // will not be called.

  config: null,                      // A path to `pkg` configuration JSON file.
                                     // This can be a `package.json` file so long
                                     // as the JSON structure looks like this:
                                     // `{"pkg": { ... }}`

  directories: [],                   // An array of directories to copy over
                                     // explicitly to the built and packaged
                                     // application. Directories can take the
                                     // form of a string or an object like
                                     // `{from: '..', to: '..'}` to specify the
                                     // source and destination explicitly. If
                                     // the destination is not specified, the
                                     // parent directory structures are
                                     // preserved.

  executableName: null,              // The name of the compiled `pkg`
                                     // output executable file name that may
                                     // appear in built packages. This default
                                     // value is to use the basename of the
                                     // target's "pathspec". This value
                                     // may also be used in various
                                     // external builders.

  loadBuilder: (filename) => null,   // A function to load a builder module's
                                     // exports by filename. This could be
                                     // require function to contextually
                                     // load a local module as a builder.

  output: 'build/',                  // The output directory for builders
                                     // to write output files to.

  platform: 'linux|macos|win',       // The platform type to help indicate
                                     // which builder implementation to use when
                                     // loading a builder. The default value
                                     // depends on `process.platform`.

  productName: null,                 // The name of the packaged product
                                     // a builder will produce. This could be
                                     // the name of the file (with or without
                                     // the extension name) or internal
                                     // metadata embedded into a file to
                                     // detail product information. The
                                     // usage of this property should be
                                     // documented by the builder you use.

  symlinks: [],                      // An array of symlinks in the form of
                                     // `{from: '..', to: '..'}` to
                                     // indicate the source and destination
                                     // of symbol links in the packaged output.

  type: 'appimage|appdmg|exe',       // The builder type to use for this target.
                                     // The builder type is used to indicate
                                     // which builder should be loaded for the
                                     // target. The default value depends on
                                     // the value of `process.platform`.

  v8: [] | {} | '',                  // An array or object of key-value pairs
                                     // of v8 options given to `pkg` that are
                                     // "baked" into the built application.
                                     // Options can be an array of
                                     // strings mapping key-value pairs in the
                                     // form of "key=value", an object
                                     // mapping key-value pairs, or a space
                                     // separated list of "key=value"
                                     // options in a single string.
}
```

### `packager.package([opts, ]callback)`

Enumerates all created targets, compiling each with `pkg` if the it is
non-binary, and then triggering the target's builder.  The `callback` function
will be called when packaging is complete or when an error occurs. The value of
`opts` is optional and can be:

```js
{
  config: null,        // A path to `pkg` configuration JSON file
                       // that will overload all target configurations.
                       // This can be a `package.json` file so long as the JSON
                       // structure looks like this:
                       // `{"pkg": { ... }}`

  debug: false,        // If set to `true`, will enable "debug" output for `pkg`

  v8: [] | {} | '',    // An array or object of key-value pairs of v8 options
                       // given to `pkg` that are "baked" into the built
                       // application. Options can be an array of strings
                       // mapping key-value pairs in the form of "key=value",
                       // an object mapping key-value pairs, or a space
                       // separated list of "key=value" options in a single
                       // string.
}
```

## Builders

The `pkg-packager` comes built-in and pre-installed builders to use out of the
box.

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
