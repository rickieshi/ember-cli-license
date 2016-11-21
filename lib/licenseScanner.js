var rsvp = require('rsvp');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var _ = require('underscore');
var scanner = require('license-checker');
var npmProcessor = require('./npmProcessor');
var bowerProcessor = require('./bowerProcessor');
var format = require('./formatter');

module.exports = {
    init: function (args) {
        return new rsvp.Promise(function (resolve, reject) {
            scanner.init(args, function (err, output) {
                if (err) {
                    reject(err);
                } else {
                    var header1 = ['NPM Modules', 'License,Name,Version,Repository,License File,License Content'];
                    var header2 = ['Bower Components', 'Licenses,Name,Version,Repository,License File,License Content'];
                    var npmLicenses = npmProcessor(output, args);
                    var bowerDeps = fs.readdirSync(path.resolve('./bower_components'));
                    var bowerLicenses = bowerProcessor(bowerDeps, args);

                    // --------------------------------------
                    // for beta
                    var header3 = ['Modified', 'Licenses,Name,Versions,Repository,License File,License Content'];
                    var otherLicenses = [];
                    if (args.config) {
                        var additionalComponent = JSON.parse(fs.readFileSync(path.resolve(args.config), 'utf8')).modified;
                        _.each(additionalComponent, function (component) {
                            console.log(component)
                            otherLicenses.push({
                                license: component.license,
                                name: component.name,
                                version: component.version,
                                repository: component.repository,
                                licenseFile: component.licenseFile,
                                licenseContent: component.licenseContent || ''
                            });
                        });
                        otherLicenses = format(_.sortBy(otherLicenses, 'license'));
                    }
                    // ----------------------------------------



                    var content = _.union(header1, npmLicenses, header2, bowerLicenses, header3, otherLicenses).join('\n');

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