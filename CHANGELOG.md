# Changelog

## 0.1.4

* Removes a check when walking the output tree that would exclude files if they had the same name as the app

## 0.1.1

* Added support for the following options:
  - `--environment` (String) (Default: `development`)
    - aliases: `-e <value>`, `-dev` (`--environment=development`), `-prod` (`--environment=production`)
  - `--output-path` (Path) (Default: `dist/``)
    - aliases: `-o <value>`

## 0.1.0

Initial version, supports `ember deploy` command which build up parameters for and runs `mvn deploy:deploy-file`
