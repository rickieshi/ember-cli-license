var _ = require('underscore');

module.exports = function (array) {
    return _.chain(array)
        .map(function (args) {
            return `${args.license},${args.name},${args.version},${args.repository},${args.licenseFile},"${args.licenseContent.replace(/"/g, '""')}"`;
        })
        .value();
}