var _ = require('underscore');
var format = require('./formatter');

module.exports = function (output) {
    // return a list of {npm-module} info sorted by license
    var licenseMap = _.sortBy(_.chain(output)
        .pairs(output)
        .map(function ([package, details]) {
            var name = package.split('@')[0];
            var version = package.split('@')[1];
            var licenseFile = details.licenseFile;

            if (licenseFile) {
                licenseFile = _.last(details.licenseFile.split('/'));
            }
        
            if(!licenseFile && details.licenses){
                licenseFile = 'package.json';
            }
            return {
                license: details.licenses,
                name,
                version,
                repository: details.repository,
                licenseFile
            };
        })
        .value(), 'license');

    return format(licenseMap);
}