var fs = require('fs');
var path = require('path');
var _ = require('underscore');
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
}


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
                licenseLink: licenseLinkMap[component.license],
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
