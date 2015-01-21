/* jshint node:true */

'use strict';
var fs = require('fs');
var path = require('path');
var JSZip = require('jszip');
var walk = require('fs-walk');
var exec = require('child_process').exec;
var Promise = require('ember-cli/lib/ext/promise');
var isBinaryFile = require('isbinaryfile');
var extend = require('util-extend');

var defaults = {
  artifactId: '{{name}}',
  buildDir: 'dist',
  fileName: '{{name}}',
  type: 'zip',
  fileEncoding: 'utf-8'
};

var project = JSON.parse(fs.readFileSync('./package.json', { encoding: options.fileEncoding }));;

function filterOptions(options) {
  var opts = options;
  var test = /{{([^}]+)}}/g;

  function replaceOption(match, key) {
    if(project[key] === undefined) {
      return match;
    }

    return project[key];
  }

  Object.keys(opts).forEach(function(key) {
    var val = opts[key];
    if(typeof val !== 'string') {
      return;
    }

    opts[key] = val.replace(test, replaceOption);
  });

  return opts;
}

function configure(options) {
  return extend(defaults, options);
}

function execCommand(command) {
  console.log('Executing command:', command);

  return new Promise(function(resolve, reject) {
    exec(command, function(err) {
      if(err) {
        reject(err);
      }
      resolve();
    });
  });
}

function buildMavenArgs(options, repositoryId, isSnapshot) {
  var mavenArgs = {
    packaging: options.type,
    groupId: options.groupId,
    artifactId: options.artifactId,
    version: options.version
  };

  if(repositoryId) {
    var repositories = options.repositories;
    var repoCount = repositories.length;

    for(var i = 0; i < repoCount; i++) {
      var currentRepo = repositories[i];

      if(currentRepo.id !== repositoryId) {
        continue;
      }

      mavenArgs.repositoryId = currentRepo.id;
      mavenArgs.url = currentRepo.url;
    }
  }

  if(isSnapshot) {
    mavenArgs.version = mavenArgs.version + '-SNAPSHOT';
  }

  mavenArgs.file = destPath(options, isSnapshot);

  return Object.keys(mavenArgs).reduce(function(arr, key) {
    return arr.concat('-D' + key + '=' + mavenArgs[key]);
  }, []);
}

function mavenExec(args, options, repositoryId, isSnapshot) {
  var cmdArgs = args.concat(buildMavenArgs(options, repositoryId, isSnapshot)).join(' ');
  return execCommand('mvn -B ' + cmdArgs);
}

function destPath(options, isSnapshot) {
  var fileName = '';
  var file = [options.fileName];

  if(isSnapshot) {
    file.push('-SNAPSHOT');
  }

  file.push('.' + options.type);

  fileName = file.join('');

  return path.join(options.buildDir, fileName);
}

function buildDeploymentPackage(options, isSnapshot) {
  var config = options;
  var zip = new JSZip();

  walk.walkSync(config.buildDir, function(base, file, stat) {
    if(stat.isDirectory() || file.indexOf(config.fileName) === 0) {
      return;
    }

    var filePath = path.join(base, file);
    var data;

    if(isBinaryFile(filePath)) {
      data = fs.readFileSync(filePath);
    } else {
      data = fs.readFileSync(filePath, { encoding: config.fileEncoding });
    }

    zip.file(path.relativePath(config.buildDir, filePath), data);
  });

  var zipBuffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE'});
  var zipPath = destPath(config, isSnapshot);

  fs.writeFileSync(zipPath, zipBuffer);
}

function deploy(repositoryId, isSnapshot, options) {
  var config = configure(options);

  if(!config.repositories.length) {
    throw new Error('You need to have at least one maven repository configured');
  }

  buildDeploymentPackage(config, isSnapshot);

  return mavenExec(['deploy:deploy-file'], config, repositoryId, isSnapshot);
}

module.exports = {
  package: function(options, isSnapshot) {
    buildDeploymentPackage(options, isSnapshot);
  },
  deploy: function(repositoryId, isSnapshot, options) {
    deploy(options);
  }
};
