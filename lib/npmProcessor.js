var path = require('path');
var _ = require('underscore');
var format = require('./formatter');

module.exports = function (output, args) {
    var hardMode = false;
    if (args.production && args.hard) {
        hardMode = true;
    }

    // return a list of {npm-module} info sorted by license
    var licenseMap = _.sortBy(_.chain(output)
        .pairs(output)
        .map(function (obj) {
            var package = obj[0];
            var details = obj[1];
            var name = package.split('@')[0];
            var version = package.split('@')[1];
            var repository = details.repository;
            var licenseFile = details.licenseFile
            var license = details.licenses;

            if (licenseFile) {
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
            var record = _.findWhere(args.reference, {
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
            }

            return {
                license,
                name,
                version,
                repository,
                licenseFile
            };
        })
        .value(), 'license');

    return format(licenseMap);
}