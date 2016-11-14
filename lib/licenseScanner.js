var rsvp = require('rsvp');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var scanner = require('license-checker');
var npmProcessor = require('./npmProcessor');
var bowerProcessor = require('./bowerProcessor');

module.exports = {
    init: function (args) {
        return new rsvp.Promise(function (resolve, reject) {
            scanner.init(args, function (err, output) {
                if (err) {
                    reject(err);
                } else {
                    var header1 = ['NPM Modules', 'License,Name,Version,Repository,License File'];
                    var header2 = ['Bower Components', 'Licenses,Name,Version,Repository,License File'];
                    var npmLicenses = npmProcessor(output, args);
                    var bowerDeps = fs.readdirSync(path.resolve('./bower_components'));
                    var bowerLicenses = bowerProcessor(bowerDeps, args);

                    var content = _.union(header1, npmLicenses, header2, bowerLicenses).join('\n');
                    fs.writeFileSync(`licenses-${Date.now().toString()}.csv`, content, 'utf8');
                    resolve();
                }
            });
        });
    }
}