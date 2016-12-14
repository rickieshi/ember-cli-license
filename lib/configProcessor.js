var fs = require('fs');
var path = require('path');
var _ = require('underscore');

module.exports = {
    parse: function(configFile, type) {
        var additionalComponent;
        var licenseMap = [];
        var data = JSON.parse(fs.readFileSync(path.resolve(configFile), 'utf8'));

        if (type === 'npm') {
            additionalComponent = data.npm || [];
        } else if (type === 'bower') {
            additionalComponent = data.bower || [];
        } else if (type === 'modified') {
            // TODO: parameterize this
            additionalComponent = data.modified || [];
        }

        _.each(additionalComponent, function(component) {
            licenseMap.push({
                license: component.license,
                licenseLink: component.licenseLink,
                name: component.name,
                version: component.version,
                repository: component.repository,
                licenseFile: component.licenseFile,
                licenseContent: component.licenseContent || ''
            });
        });

        return _.sortBy(licenseMap, 'license');
    },
    getReference: function(configFile) {
        return JSON.parse(fs.readFileSync(path.resolve(configFile), 'utf8')).reference || [];
    }
}
