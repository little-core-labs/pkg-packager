pkg-packager ZIP Builder (built-in)
===================================

> A built-in pkg-packager builder to produce ZIP output.

## Usage

```js
packager.target('./path/to/module/, {
  productName: 'Bundle',
  type: 'zip'
})

packager.package((err, results) => {
  console.log(results.name)
})
```

## Configuration

```js
{
  productName: null, // The name of the packaged output product. This
                     // builder will use the productName as the output
                     // name of the file with the `.zip` extension added.
                     // The default value is the basename of the built `pkg`
                     // executable file name.
}
```
