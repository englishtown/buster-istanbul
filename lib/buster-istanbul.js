/*
 * buster-istanbul
 * https://github.com/englishtown/buster-istanbul
 *
 * Copyright (c) 2012 kates
 * Licensed under the MIT license.
 */

var buster = require('buster-core'),
  coverage = require('./coverage'),
  glob = require('glob'),
  path = require('path'),
  istanbul = require('istanbul'),
  minimatch = require('minimatch');

function merge(paths) {
  return paths.reduce(function(a, c){
    glob.sync(c).forEach(function(i){
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

// reusable method to check for exclusions
var isExcluded = function(path, excludes){
  var excluded = false;

  if (path && excludes && excludes.length) {
    excluded = excludes.some(function(exclude){
      return minimatch(path, exclude);
    });
  }

  return excluded;
}

var setup = {
  node: function(group, instrument, excludes) {
    coverage.hookRequire();
    if (instrument === false) return;
    group.on('load:sources', function(rs){
      var rootPath = rs.rootPath,
        additional = group.config['buster-istanbul'].sources;

      if (Array.isArray(additional)) {
          additional.forEach(processAdditional);
      }
      rs.forEach(processResource);
      function processAdditional(a) {
        glob(a, function (er, files) {
          if (er) {
            throw er;
          } else {
            files.forEach(processResource);
          }
        });
      }
      function processResource(resource) {
        if (typeof resource === 'object') {
          resource = resource.path;
        }
        var resourcePath = resource.replace(/^\//, '');
        var excluded = isExcluded(resourcePath, excludes);
        if (!excluded) {
          coverage.addInstrumentCandidate(path.join(rootPath, resourcePath));
        }
      }
    });
  },

  browser: function(group, instrument, excludes) {
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
      var rootPath = rs.rootPath;
      if (instrument === false) return;
      rs.addProcessor(function(resource, content){
        // properly join the path, using the rootPath
        var resourcePath = resource.path.replace(/\//, '');
        var excluded = isExcluded(resourcePath, excludes);

        return excluded ? content : coverage.instrumentCode(content, path.join(rootPath, resourcePath));
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
    setup[group.environment](group, opts.instrument, opts.excludes);
    process.on("exit", function() {
      writeReports(opts.outputDirectory, opts.format || opts.formats, !!opts.silent);
    });
  },

  testRun: function(testRunner, messageClient) {
    testRunner.on("istanbul:report", function(result){
      coverage.addCoverage(result.data || {});
    });
    testRunner.on("suite:end", function () {
      coverage.unhookRequire();
    });
  }
};
