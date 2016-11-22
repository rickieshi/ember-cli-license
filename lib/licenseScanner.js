var fs = require('fs');
var path = require('path');
var rsvp = require('rsvp');
var mkdirp = require('mkdirp');
var _ = require('underscore');
var scanner = require('license-checker');
var format = require('./formatter');
var npmProcessor = require('./npmProcessor');
var bowerProcessor = require('./bowerProcessor');
var configProcessor = require('./configProcessor');

module.exports = {
    init: function (args) {
        return new rsvp.Promise(function (resolve, reject) {
            scanner.init(args, function (err, output) {
                if (err) {
                    reject(err);
                } else {
                    var npmHeader = ['NPM Modules', 'License,Name,Version,Repository,License File,License Content'];
                    var bowerHeader = ['Bower Components', 'Licenses,Name,Version,Repository,License File,License Content'];
                    var npmLicenses = format(npmProcessor(output, args));
                    var bowerDeps = fs.readdirSync(path.resolve('./bower_components'));
                    var bowerLicenses = format(bowerProcessor(bowerDeps, args));
                    
                    // --------------------------------------
                    // for beta
                    var otherHeader = [];
                    var otherLicenses = [];
                    if (args.config) {
                        otherHeader = ['Modified', 'Licenses,Name,Versions,Repository,License File,License Content'];
                        otherLicenses = format(configProcessor.parse(args.config, 'modified'));
                    }
                    // ----------------------------------------

                    var content = _.union(npmHeader, npmLicenses, bowerHeader, bowerLicenses, otherHeader, otherLicenses).join('\n');
                    var outputDir = './public/assets/licenses';
                    var filename = 'licenses.csv';

                    mkdirp(outputDir, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            fs.writeFileSync(`${outputDir}/${filename}`, content, 'utf8');
                            resolve();
                        }
                    });
                }
            });
        });
    }
}