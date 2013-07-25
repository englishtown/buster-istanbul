# buster-istanbul

busterjs coverage extension

## Getting Started

Add buster-istanbul as a dependency in your package.json file.

```json
{
  "name": "awesome name",
  ...
  "dependencies": {
    "buster-istanbul": "*"
  }
}
```

Configure buster to use buster-istanbul as extension

```javascript
module.exports.tests = {
    environment: "node",

    rootPath : "./",
    sources: [
        "src/**/*.js"
    ],
    tests : [
       "test/**/*-test.js"
    ],
    "buster-istanbul": {
      outputDirectory: "coverage",
      format: "lcov"
    },
    extensions: [
        require('buster-istanbul')
    ]
};
```

**Buster JS options**

`sources` will be the files that will be instrumented.

**buster-istanbul options**

`outputDirectory` is path to where the files will be written to.
Defaults to the current working directory.

`format` is a _string_ or a _list_ of formats to generage.

Currently supported formats:
* lcov
* cobertura
* json
* text

`silent` is a flag to turn off reporting at the end of the test.
Valid values is `true` or `false`. Defaults to `false`.

`instrument` is a flag to turn off instrumentation of your source file.
You will need to handle this yourself. Defaults to `true`.

Write your buster test as usual.

Example project: [buster-istanbul-demo](https://github.com/kates/buster-istanbul-demo)

## License
Copyright (c) 2013 kates  
Licensed under the MIT license.
