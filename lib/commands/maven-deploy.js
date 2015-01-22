/* jshint node: true */
'use strict';

var path = require('path');

module.exports = {
  name: 'deploy',
  description: 'Uses maven-deploy to package and deploy you application to a maven repository',  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'output-path', type: path, default: 'dist/', aliases: ['o'] }
  ],
  runCommand: function(command) {
    var maven = require('../maven-deploy');
    var root = this.project.root;

    var mavenConfig = require(root + '/maven-config.json');
    var repository = command.repository || mavenConfig.repositories[0];

    command.environment = command.environment || 'production';
    command.target = command.target || '';
    command.snapshot = repository.snapshot || false;
    command.outputDir = mavenConfig.buildDir || 'dist';
    command.repository = repository;

    var buildDir = path.join(root, command.outputPath);
    mavenConfig.buildDir = buildDir;
    mavenConfig.version = this.project.pkg.version;

    return maven.deploy(command.repository.id, command.repository.snapshot, mavenConfig);
  },
  triggerBuild: function(commandOptions) {
    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    commandOptions.environment = commandOptions.environment || 'production';
    commandOptions.outputPath = commandOptions.outputPath || 'dist';

    return buildTask.run(commandOptions);
  },
  run: function(command, rawArgs) {
    return this.triggerBuild(command).then(function() {
      return this.runCommand(command, rawArgs);
    }.bind(this));
  }
};
