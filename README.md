# ember-cli-license
Ember CLI addon that adds a `license` command for exporting front-end NPM and Bower licenses.
It also provides a modal component for displaying licenses information on UI.

**You are on a feature branch, beta versions are unstable.**

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
  3. Output in `public/assets/licenses/licenses.csv`
  4. You can add a `{{license-page title=title}}` component in your template, the component is a modal which uses an ajax call to fetch `.csv` ( **hardcoded to assets/licenses/licenses.csv** ) file and renders content on page

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
        "licenseFile": "licenseFile",
        "licenseContent": "licenseContent"
    }],
    // these entries will be appended after scanner results
    "npm": [{
        "name": "name",
        "license": "license",
        "repository": "repository",
        "version": "version",
        "licenseFile": "licenseFile",
        "licenseContent": "licenseContent"
    }],
    "bower": [{
        "name": "name",
        "license": "license",
        "repository": "repository",
        "version": "version",
        "licenseFile": "licenseFile",
        "licenseContent": "licenseContent"
    }]
}
```

## TODO
* More configurable options

## Credits
* davglass's [license-checker](https://github.com/davglass/license-checker)
* AceMetrix's [bower-license](https://github.com/AceMetrix/bower-license)

## License
**MIT**