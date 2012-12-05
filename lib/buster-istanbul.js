/*
 * buster-istanbul
 * https://github.com/englishtown/buster-istanbul
 *
 * Copyright (c) 2012 kates
 * Licensed under the MIT license.
 */

var buster = require('buster-core'),
  coverage = require('./coverage'),
  glob = require('glob-whatev'),
  path = require('path');

var setup = {
  node: function(group) {
    coverage.hookRequire();
    group.sources.forEach(function(pattern) {
      glob.glob(pattern).forEach(function(fPath) {
        coverage.addInstrumentCandidate(fPath);
      });
    });
  },
  browser: function(group) {
    global['__coverage__'] = global['__coverage__'] || {};

    group.on('load:framework', function(rs){
      rs.addFileResource(path.resolve(__dirname, 'helper.js'), {
        path: '/coverage/helper.js'
      }).then(function() {
        rs.loadPath.append('/coverage/helper.js');
      });
    });

    group.on('load:sources', function(resourceSet){
      resourceSet.addProcessor(function(resource, content){
        return coverage.instrumentCode(content, resource['path'].replace(/\//, ''));
      })
    });
  }
};

module.exports = {
  create: function(options) {
    var instance = Object.create(this);
    instance.options = options;
    return instance;
  },
  configure: function(group) {
    setup[group.environment](group);
    process.on("exit", function() {
      coverage.writeReports();
    });
  },
  testRun: function(testRunner, messageClient) {
    testRunner.on("istanbul:report", function(result){
      coverage.addCoverage(result.data);
    });
  }
};
