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
    extensions: [
        require('buster-istanbul')
    ]
};
```

`sources` will be the files that will be instrumented.
Write your buster test as usual.

## License
Copyright (c) 2012 kates  
Licensed under the MIT license.
