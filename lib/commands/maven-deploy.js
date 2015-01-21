/* jshint node: true */
'use strict';

module.exports = {
  name: 'deploy',
  description: 'Uses maven-deploy to package and deploy you application to a maven repository',
  runCommand: function(command, args) {
    var path = require('path');
    var RSVP = require('rsvp');
    var Promise = RSVP.Promise;
    var maven = require('../maven-deploy');

    var root = this.project.root;

    var mavenConfig = require(root + '/maven-config.json');

    var repository = command.repository || mavenConfig.repositories[0];

    command.environment = command.environment || 'production';
    command.target = command.target || '';
    command.snapshot = repository.snapshot || false;
    command.outputDir = mavenConfig.buildDir || 'dist';
    command.repository = repository;

    var buildDir = path.join(root, command.outputDir);
    mavenConfig.buildDir = buildDir;

    return new Promise(function(resolve, reject) {
      maven.config(mavenConfig);
      console.log('mavenConfig:', mavenConfig);

      maven.deploy(command.repository.id, command.repository.snapshot, function(err, stdout, stderr) {
        if(err) {
          reject(err);
        }
        resolve();
      });
    });
  },
  // deployApp: function(config) {
  //   return new Promise(function(resolve, reject) {
  //     maven.config(config);
  //     maven.deploy(command.repository);
  //   })
  // },
  triggerBuild: function(commandOptions) {
    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return buildTask.run(commandOptions);
  },
  run: function(command, rawArgs) {
    return this.triggerBuild(command).then(function() {
      return this.runCommand(command, rawArgs);
    }.bind(this));
  }
};
