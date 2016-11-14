var path = require('path');
var _ = require('underscore');
var format = require('./formatter');

module.exports = function (output) {
    // return a list of {npm-module} info sorted by license
    var licenseMap = _.sortBy(_.chain(output)
        .pairs(output)
        .map(function (args) {
            var package = args[0];
            var details = args[1];
            var name = package.split('@')[0];
            var version = package.split('@')[1];
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
            return {
                license,
                name,
                version,
                repository: details.repository,
                    licenseFile
            };
        })
        .value(), 'license');

    return format(licenseMap);
}