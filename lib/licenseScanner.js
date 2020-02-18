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
    init: function(args) {
        return new rsvp.Promise(function(resolve, reject) {
            scanner.init(args, function(err, output) {
                if (err) {
                    reject(err);
                } else {
                    var npmHeader = ['NPM Modules', 'License,Name,Version,Repository,License File,License Content'];
                    var bowerHeader = ['Bower Components', 'Licenses,Name,Version,Repository,License File,License Content'];
                    var npmLicenses = npmProcessor(output, args);
                    
                    bowerLicenses = [];

                    // Only get bower licenses if there is a bower.json file.
                    if (fs.existsSync("./bower.json")) {
                        var bowerDeps = fs.readdirSync(path.resolve('./bower_components'));
                        var bowerLicenses = bowerProcessor(bowerDeps, args);
                    }

                    var otherHeader = [];
                    var otherLicenses = [];
                    if (args.config) {
                        otherHeader = ['Modified', 'Licenses,Name,Versions,Repository,License File,License Content'];
                        otherLicenses = configProcessor.parse(args.config, 'modified');
                    }

                    var outputDir = './public/assets/licenses';
                    var csv = _.union(npmHeader, format(npmLicenses), bowerHeader, format(bowerLicenses), otherHeader, format(otherLicenses)).join('\n');
                    var html = generateHTML(npmLicenses, bowerLicenses, otherLicenses);

                    mkdirp(outputDir, function(err) {
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
var generateHTML = function(npm, bower, other) {
    var contentBuffer = '';
    var linkBuffer = '<h3>Third Party Component List</h3><hr>';

    _.each(npm, function(stuff) {
        linkBuffer += `<a class='license-link' linkTo=${stuff.name}${stuff.version}>${stuff.name} - v.${stuff.version}</a><br/>`;
        contentBuffer += `<div id='${stuff.name}${stuff.version}'><h4>${stuff.name} v.${stuff.version}</h4><h5>License</h5><a class='license-redirect' href=${stuff.licenseLink} target='_blank'>${stuff.license}</a><h5>Repository</h5><a class='repo-redirect' href='${stuff.repository}' target="_blank">${stuff.repository}</a><br/><br/><b>A ${stuff.licenseFile} file was found in component</b><br/><div>${stuff.licenseContent}</div></div><br/><hr>`;
    });
    _.each(bower, function(stuff) {
        linkBuffer += `<a class='license-link' linkTo=${stuff.name}${stuff.version}>${stuff.name} - v.${stuff.version}</a><br/>`;
        contentBuffer += `<div id='${stuff.name}${stuff.version}'><h4>${stuff.name} v.${stuff.version}</h4><h5>License</h5><a class='license-redirect' href=${stuff.licenseLink} target='_blank'>${stuff.license}</a><h5>Repository</h5><a class='repo-redirect' href='${stuff.repository}' target="_blank">${stuff.repository}</a><br/><br/><b>A ${stuff.licenseFile} file was found in component</b><br/><div>${stuff.licenseContent}</div></div><br/><hr>`;
    });
    _.each(other, function(stuff) {
        linkBuffer += `<a class='license-link' linkTo=${stuff.name}${stuff.version}>${stuff.name} - v.${stuff.version}</a><br/>`;
        contentBuffer += `<div id='${stuff.name}${stuff.version}'><h4>${stuff.name} v.${stuff.version}</h4><h5>License</h5><a class='license-redirect' href=${stuff.licenseLink} target='_blank'>${stuff.license}</a><h5>Repository</h5><a class='repo-redirect' href='${stuff.repository}' target="_blank">${stuff.repository}</a><br/><br/><b>A ${stuff.licenseFile} file was found in component</b><br/><div>${stuff.licenseContent}</div></div><br/><hr>`;
    });

    linkBuffer += '<hr>';

    return linkBuffer + contentBuffer;
}
