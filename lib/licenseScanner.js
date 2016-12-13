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
                    var npmLicenses = npmProcessor(output, args);
                    var bowerDeps = fs.readdirSync(path.resolve('./bower_components'));
                    var bowerLicenses = bowerProcessor(bowerDeps, args);

                    var otherHeader = [];
                    var otherLicenses = [];
                    if (args.config) {
                        otherHeader = ['Modified', 'Licenses,Name,Versions,Repository,License File,License Content'];
                        otherLicenses = configProcessor.parse(args.config, 'modified');
                    }

                    var outputDir = './public/assets/licenses';
                    var csv = _.union(npmHeader, format(npmLicenses), bowerHeader, format(bowerLicenses), otherHeader, format(otherLicenses)).join('\n');
                    var html = generateHTML(npmLicenses, bowerLicenses, otherLicenses);

                    mkdirp(outputDir, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            fs.writeFileSync(`${outputDir}/licenses.csv`, csv, 'utf8');
                            fs.writeFileSync(`${outputDir}/licenses.html`, html, 'utf8');
                            resolve();
                        }
                    });
                }
            });
        });
    }
}
var generateHTML = function (npm, bower, other) {
    var contentBuffer = '';

    _.each(npm, function (stuff) {
        contentBuffer += `<div id='${stuff.name}${stuff.version}'><h5>${stuff.name}</h5><h5>v.${stuff.version}</h5><h5>License</h5><div>${stuff.license}</div><h5>Repository</h5><div>${stuff.repository}</div><h5>License File</h5><div>${stuff.licenseFile}</div><h5>License Content</h5><div>${stuff.licenseContent}</div></div><br/><br/>`;
    });
    _.each(bower, function (stuff) {
        contentBuffer += `<div id='${stuff.name}${stuff.version}'><h5>${stuff.name}</h5><h5>v.${stuff.version}</h5><h5>License</h5><div>${stuff.license}</div><h5>Repository</h5><div>${stuff.repository}</div><h5>License File</h5><div>${stuff.licenseFile}</div><h5>License Content</h5><div>${stuff.licenseContent}</div></div><br/><br/>`;
    });
    _.each(other, function (stuff) {
        contentBuffer += `<div id='${stuff.name}${stuff.version}'><h5>${stuff.name}</h5><h5>v.${stuff.version}</h5><h5>License</h5><div>${stuff.license}</div><h5>Repository</h5><div>${stuff.repository}</div><h5>License File</h5><div>${stuff.licenseFile}</div><h5>License Content</h5><div>${stuff.licenseContent}</div></div><br/><br/>`;
    });

    return contentBuffer;
}
