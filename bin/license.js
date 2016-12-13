var licenseScanner = require('../lib/licenseScanner');

var availableOptions = [{
    name: 'production',
    type: Boolean,
    default: false,
    aliases: ['prod'],
    description: 'if true, ignore devDependencies'
}, {
    name: 'config',
    type: String,
    aliases: ['c'],
    description: 'supply additional info to override scanning result'
}];

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
            config: options.config
        }).then(function () {
            var diff = Date.now() - startTime;
            console.log(`Task finished in ${diff} milliseconds.`);
        });
    }
}