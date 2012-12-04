/*
 * buster-istanbul
 * https://github.com/englishtown/buster-istanbul
 *
 * Copyright (c) 2012 kates
 * Licensed under the MIT license.
 */
var buster = require('buster-core'),
  coverage = require('./coverage'),
  glob = require('glob-whatev');

process.on("exit", function() {
  coverage.writeReports();
});

module.exports = {
  create: function(options) {
    var instance = Object.create(this);
    instance.options = options;
    return instance;
  },
  configure: function(group) {
    coverage.hookRequire();
    group.sources.forEach(function(src) {
      glob.glob(src).forEach(function(fPath) {
        coverage.addInstrumentCandidate(fPath);
      });
    });
  }
};
