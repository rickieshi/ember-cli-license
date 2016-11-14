var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var bowerJson = require('bower-json');
var licenseChecker = require('license-checker/lib/license');
var format = require('./formatter');

module.exports = function (componentList) {
    var licenseMap = [];

    // iterate all bower dependencies in a loop
    _.each(componentList, function (component) {
        var targetFolder = path.resolve('./bower_components', component);
        if (fs.statSync(targetFolder).isDirectory()) {
            var files = fs.readdirSync(targetFolder);

            // use bower-json module to find more info about this component
            var file = bowerJson.findSync(targetFolder);
            var json = bowerJson.readSync(file);

            // search for license files
            var potentialFile;
            var license;
            var licenseFile;
            if (_.contains(files, 'LICENSE')) {
                potentialFile = 'LICENSE';
            } else if (_.contains(files, 'license')) {
                potentialFile = 'license';
            } else if (_.contains(files, 'LICENSE.txt')) {
                potentialFile = 'LICENSE.txt';
            } else if (_.contains(files, 'license.txt')) {
                potentialFile = 'license.txt';
            }

            // list license file if found
            // use license-checker to match license content
            // if no license file is found, fall back to list bower.json as license file
            if (!_.isNull(potentialFile) && !_.isUndefined(potentialFile)) {
                license = licenseChecker(fs.readFileSync(path.resolve(targetFolder, potentialFile), 'utf8'));
                licenseFile = potentialFile;
            } else {
                license = json.license;
                licenseFile = path.basename(file);
            }



            var name = json.name;
            var version = json.version;
            var homepage = json.homepage;
            var repository;

            // if there is a package.json file, read it for additional info
            // repo listed in package.json is considered first, else ...
            // fall back to use repo listed in bower json, else ...
            // fall back to use homepage as repo
            if (fs.existsSync(path.resolve(targetFolder, 'package.json'))) {
                var content = JSON.parse(fs.readFileSync(path.resolve(targetFolder, 'package.json'), 'utf8'));

                if (content.repository) {
                    if (content.repository.url) {
                        repository = content.repository.url;
                    } else {
                        repository = content.repository;
                    }
                }
            }
            if (json.repository && (_.isNull(repository) || _.isUndefined(repository))) {
                repository = json.repository.url;
            }
            if ((_.isNull(repository) || _.isUndefined(repository))) {
                repository = homepage;
            }

            // final touch
            if (!_.isNull(repository) && !_.isUndefined(repository)) {
                repository = repository.replace('git+ssh://git@', 'git://')
                    .replace('git+https://github.com', 'https://github.com')
                    .replace('git://github.com', 'https://github.com')
                    .replace('git@github.com:', 'https://github.com/')
                    .replace('.git', '');
            }

            if (!_.isNull(license) && !_.isUndefined(license)) {
                license = license.replace(/\*/g, '');
            }

            licenseMap.push({
                license, name, version, repository, licenseFile
            });
        }
    });

    return format(_.sortBy(licenseMap, 'license'));
}