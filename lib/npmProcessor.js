var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var configProcessor = require('./configProcessor');
var licenseLinkMap = {
    'Apache-2.0': 'http://www.apache.org/licenses/LICENSE-2.0',
    'BSD': 'https://spdx.org/licenses/BSD-4-Clause.html',
    'BSD-2-Clause': 'https://opensource.org/licenses/BSD-2-Clause',
    'BSD-3-Clause': 'https://opensource.org/licenses/BSD-3-Clause',
    'ISC': 'https://opensource.org/licenses/ISC',
    'MIT': 'https://opensource.org/licenses/MIT',
    'Public Domain': '#',
    'WTFPL': 'http://unlicense.org/',
    'Unlicense': 'http://unlicense.org/'
};
// return a list of {npm-module} info sorted by license
module.exports = function(output, args) {
    var reference = [];
    if (args.config) {
        reference = configProcessor.getReference(args.config);
    }

    var licenseMap = _.chain(output)
        .pairs(output)
        .map(function(obj) {
            var package = obj[0];
            var details = obj[1];
            var name = package.split('@')[0];
            var version = package.split('@')[1];
            var repository = details.repository;
            var licenseFile = details.licenseFile;
            var license = details.licenses;
            var licenseLink = '#';
            var licenseContent = 'Only license name was specified in original component';

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
            var record = _.findWhere(reference, {
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
                if (record.licenseContent) {
                    licenseContent = record.licenseContent;
                } else {
                    licenseContent = '';
                }
            }
            licenseLink = licenseLinkMap[license];
            if (_.isUndefined(licenseLink)) {
                licenseLink = '#';
            }

            return {
                license,
                licenseLink,
                name,
                version,
                repository,
                licenseFile,
                licenseContent
            };
        }).value();

    // push additional info if any
    if (args.config) {
        licenseMap = _.union(licenseMap, configProcessor.parse(args.config, 'npm'));
    }

    return _.sortBy(licenseMap, 'license');
}
