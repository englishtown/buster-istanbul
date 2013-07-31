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
  path = require('path'),
  istanbul = require('istanbul');

function merge(paths) {
  return paths.reduce(function(a, c){
    glob.glob(c).forEach(function(i){
      a.push("'" + i.replace(/^\/|\.js$/, '') + "'");
    });
    return a;
  }, []).join(", ");
}

function writeReports(dir, formats, silent) {
  var Report = istanbul.Report;
  var defaultFormats = ['text', 'text-summary'];
  var collector = coverage.getCollector();
  var textFiles = {
    "text": "coverage.txt",
    "text-summary": "coverage-summary.txt"
  };
  dir = dir || process.cwd();
  formats = formats || [];

  if (!(formats instanceof Array)) {
    formats = [formats];
  }

  formats.forEach(function(format) {
    var report = Report.create(format, {dir: dir, file: textFiles[format]});
    report.writeReport(collector, true);
  });

  if (!silent) {
    defaultFormats.forEach(function(format) {
      var report = Report.create(format);
      report.writeReport(collector, true);
    });
  }
}

var setup = {
  node: function(group, instrument) {
    coverage.hookRequire();
    if (instrument === false) return;
    group.sources.forEach(function(pattern) {
      glob.glob(pattern).forEach(function(fPath) {
        coverage.addInstrumentCandidate(fPath);
      });
    });
  },

  browser: function(group, instrument) {
    var options = group.config.options;

    global['__coverage__'] = global['__coverage__'] || {};

    group.on('load:framework', function(rs){
      rs.addFileResource(path.resolve(__dirname, 'helper.js'), {
        path: '/coverage/helper.js'
      }).then(function() {
        rs.loadPath.append('/coverage/helper.js');
      });
    });

    group.on('load:sources', function(rs){
      if (instrument === false) return;
      rs.addProcessor(function(resource, content){
        return coverage.instrumentCode(content, resource['path'].replace(/\//, ''));
      });
    });

    group.on("load:tests", function (rs) {
      if (options && options.amd) {
        rs.addResource({
          path: "/coverage/load-sources.js",
          content: "require([" + merge(group.sources) + "]);"
        }).then(function(){
          rs.loadPath.prepend("/coverage/load-sources.js");
        });

        if (options.amd.config) {
          rs.addFileResource(path.resolve(options.amd.config), {
            path: "/" + options.amd.config
          }).then(function(){
            rs.loadPath.prepend('/' + options.amd.config);
          });
        }

        rs.addFileResource(path.resolve(options.amd.require), {
          path: "/" + options.amd.require
        }).then(function(){
          rs.loadPath.prepend('/' + options.amd.require);
        }); 
      }
    });
  }
};

module.exports = {
  name: 'buster-istanbul',

  create: function(options) {
    var instance = Object.create(this);
    instance.options = options;
    return instance;
  },

  configure: function(group) {
    var opts = this.options;
    setup[group.environment](group, opts.instrument);
    process.on("exit", function() {
      writeReports(opts.outputDirectory, opts.format || opts.formats, !!opts.silent);
    });
  },

  testRun: function(testRunner, messageClient) {
    testRunner.on("istanbul:report", function(result){
      coverage.addCoverage(result.data || {});
    });
  }
};
