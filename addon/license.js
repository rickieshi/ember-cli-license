var licenseScanner = require('../lib/licenseScanner');

var availableOptions = [{
    name: 'production',
    type: Boolean,
    default: false,
    aliases: ['prod'],
    description: 'if true, ignore devDependencies'
}];

var reference = [
    {
        "name": "tweetnacl",
        "license": "Public Domain"
    },
    {
        "name": "base64id",
        "license": "MIT"
    },
    {
        "name": "buffers",
        "license": "MIT/X11"
    },
    {
        "name": "colors",
        "license": "MIT"
    },
    {
        "name": "cycle",
        "license": "Public Domain"
    },
    {
        "name": "jstree",
        "license": "MIT",
        "repository": "https://github.com/vakata/jstree"
    }
];

module.exports = {
    name: 'license',
    description: 'scans npm and bower dependencies and outputs license info in a csv',
    works: 'insideProject',
    init: function () {
        this._super.init && this._super.init.apply(this, arguments);

        this.registerOptions({
            availableOptions
        });
    },
    run: function (options, rawArgs) {
        const startTime = Date.now();
        return licenseScanner.init({
            start: process.cwd(),
            production: options.production,
            reference
        }).then(function () {
            var diff = Date.now() - startTime;
            console.log(`Task finished in ${diff} milliseconds.`);
        });
    }
}