# ember-cli-license

Ember CLI addon that adds a `license` command for scanning front-end project dependencies.

## Installation
####Ember CLI
```sh
$ ember install ember-cli-license
```
####NPM
```sh
$ npm install --save-dev ember-cli-license
```

## Usage
When invoked with no options:

```sh
$ ember license
```

It will:

  1. Look for a `node_modules`  and a `bower_components` folder at current path
  2. Scan recursively for npm packages and bower dependencies
  3. Output them in `licenses.csv`

## Options

Options can be specified on the command line

 `--production` or `-prod`

  Default: `false`

  Whether to include devDependencies or not.

## Disclaimer
At this point this addon is still an immature project that needs much polishing and refactoring. It kinda works but still has a lot of limitations. While I am currently actively working on it, at the meantime, use it at your own risk.

## Credits
* davglass's [license-checker](https://github.com/davglass/license-checker)
* AceMetrix's [bower-license](https://github.com/AceMetrix/bower-license)

## License
**MIT**