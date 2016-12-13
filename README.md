# ember-cli-license
Ember CLI addon that adds a `license` command for exporting front-end NPM and Bower licenses.
It also provides a modal component for displaying licenses information on UI.

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
  3. Output a csv file at `public/assets/licenses/licenses.csv`
  4. Output an HTML file at `public/assets/licenses/licenses.html`
  5. You can then add a component in your template to display license info on UI

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
    // will be appended after npm results 
    "npm": [{
        // same structure as above 
    }],
    // will be appended after bower results
    "bower": [{
        // same structure as above
    }]
}
```

## Components
**Template**:
`{{license-page title='Title_Here'}}`

Internally it will fetch the generated HTML file under `/assets/licenses/licenses.html`
The path is currently hardcoded.
The addon comes with minimal styles so that you can override them easily.

## TODO
* Expose AJAX path
* Consolidate code

## Credits
* davglass's [license-checker](https://github.com/davglass/license-checker)
* AceMetrix's [bower-license](https://github.com/AceMetrix/bower-license)

## License
**MIT**
