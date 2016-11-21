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

 - `--production` or `-prod`
 
  Type:  **Boolean**

  Default: `false`

If true, scanner will ignore devDependencies
  
- `--config` or `-c`

  Type: **String**

  A path to file which provides addition info to override scanning result

## Config
You can supply path to a config **JSON** file to pass along additional information to scanner.

```sh
$ ember license -c licenseConfig.json
```

```javascript
// licenseConfig.json
{
    // information listed in references array will override scanner results
    "reference": [{
        "name": "name",
        "license": "license",
        "repository": "repository",
        "version": "version",
        "licenseFile": "licenseFile"
    }],
    // these entries will be appended after scanner results
    "npm": [{
        "name": "name",
        "license": "license",
        "repository": "repository",
        "version": "version",
        "licenseFile": "licenseFile"
    }],
    "bower": [{
        "name": "name",
        "license": "license",
        "repository": "repository",
        "version": "version",
        "licenseFile": "licenseFile"
    }]
}
```

## TODO
* Allow user to define bower_component path

## Beta Feature - current at 1.2.0-beta.1
**Following features are not stable, use beta release is not recommended**

* Once run `ember license` at project root, a file will now be generated at`assets/licenses/licenses.csv`
* You can add a `{{license-page}}` component in your template, the component is a modal which uses an ajax call to fetch `.csv` file and renders content on page

## Credits
* davglass's [license-checker](https://github.com/davglass/license-checker)
* AceMetrix's [bower-license](https://github.com/AceMetrix/bower-license)

## License
**MIT**