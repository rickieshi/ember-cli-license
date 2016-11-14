var _ = require('underscore');

module.exports = function (array) {
    return _.chain(array)
        .map(function ({
            license,
            name,
            version,
            repository,
            licenseFile
        }) {
            return `${license},${name},${version},${repository},${licenseFile}`;
        })
        .value();
}