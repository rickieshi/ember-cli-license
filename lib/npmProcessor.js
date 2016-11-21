var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var format = require('./formatter');

module.exports = function (output, args) {
    // return a list of {npm-module} info sorted by license
    var licenseMap = _.chain(output)
        .pairs(output)
        .map(function (obj) {
            var package = obj[0];
            var details = obj[1];
            var name = package.split('@')[0];
            var version = package.split('@')[1];
            var repository = details.repository;
            var licenseFile = details.licenseFile
            var license = details.licenses;
            var licenseContent = 'Only license name was specified in original software';

            if (licenseFile) {
                licenseContent = fs.readFileSync(licenseFile, 'utf-8');
                licenseFile = path.basename(details.licenseFile);
            }

            if (!licenseFile && details.licenses) {
                licenseFile = 'package.json';
            }
            if (license && _.isArray(license)) {
                license = license.join(' and ');
            }
            if (!_.isNull(license) && !_.isUndefined(license)) {
                license = license.replace(/\*/g, '');
            }

            // use records in config obj if available
            if (args.config) {
                var configObject = JSON.parse(fs.readFileSync(path.resolve(args.config), 'utf8')).reference;
                var record = _.findWhere(configObject, {
                    name
                });

                if (!_.isUndefined(record)) {
                    if (record.license) {
                        license = record.license;
                    }
                    if (record.name) {
                        name = record.name;
                    }
                    if (record.repository) {
                        repository = record.repository;
                    }
                    if (record.version) {
                        version = record.version;
                    }
                    if (record.licenseFile) {
                        licenseFile = record.licenseFile;
                    }
                    if(record.licenseContent){
                        licenseContent = record.licenseContent;
                    } else {
                        licenseContent = '';
                    }
                }
            }

            return {
                license,
                name,
                version,
                repository,
                licenseFile,
                licenseContent
            };
        }).value();
    
    // push additional info if any
    if (args.config) {
        var additionalComponent = JSON.parse(fs.readFileSync(path.resolve(args.config), 'utf8')).npm
        _.each(additionalComponent, function (component) {
            licenseMap.push({
                license: component.license,
                name: component.name,
                version: component.version,
                repository: component.repository,
                licenseFile: component.licenseFile,
                licenseContent: component.licenseContent || ''
            });
        });
    }

    return format(_.sortBy(licenseMap, 'license'));
}