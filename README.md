# This repo is old and unsupported

There are other alternatives, like https://github.com/makepanic/ember-cli-deploy-maven that are way better!

# Ember-cli-maven-deploy

Ember-CLI command to deploy files to Maven repositories

## Installation

* `ember install:npm ember-cli-maven-deploy`

## Usage

Run `ember generate maven-deploy` to generate a `maven-config.json`-file in the root of your directory.

Edit the default `maven-config.json` with your repository settings. Right now, snapshot settings are per repo, but defaults to false if the key doesn't exist.

To deploy, run `ember deploy`
