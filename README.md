# ember-cli-license

Ember CLI addon that adds a `license` command for exporting front-end NPM and Bower licenses.

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
  3. Output in `licenses-timestamp.csv`

## Options

Options can be specified on the command line

 `--production` or `-prod`

  Default: `false`

  Whether to include devDependencies or not.

## TODO
* Allow user to define bower_component path
* A config / library file to fill in blanks in csv

## Credits
* davglass's [license-checker](https://github.com/davglass/license-checker)
* AceMetrix's [bower-license](https://github.com/AceMetrix/bower-license)

## License
**MIT**