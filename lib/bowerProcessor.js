var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var bowerJson = require('bower-json');
var licenseChecker = require('license-checker/lib/license');
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
}

// recursively getting components listed under dependencies only
var dependencyLookUp = function(base, bowerDependency) {
    _.each(base, function(package) {
        bowerDependency.push(package);
        var json = bowerJson.findSync(path.resolve('./bower_components', package));
        var rootDeps = _.chain(bowerJson.readSync(json).dependencies)
            .map(function(version, packageName) {
                return packageName;
            }).value();

        if (rootDeps.length > 0) {
            dependencyLookUp(rootDeps, bowerDependency);
        }
    });
}

module.exports = function(componentList, args) {
    var licenseMap = [];
    var reference = [];
    if (args.config) {
        reference = configProcessor.getReference(args.config);
    }

    // if -prod option is present
    // grab components listed under "dependencies" only
    // return the intersection of found dependency with all component list
    if (args.production) {
        var rootFile = bowerJson.findSync(process.cwd());
        var rootDeps = _.chain(bowerJson.readSync(rootFile).dependencies)
            .map(function(version, packageName) {
                return packageName;
            }).value();

        var bowerDependency = [];
        dependencyLookUp(rootDeps, bowerDependency);
        componentList = _.intersection(_.union(bowerDependency), componentList);
    }

    // iterate all bower dependencies in a loop
    _.each(componentList, function(component) {
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
            var licenseLink;
            var licenseContent = 'Only license name was specified in original component';
            if (_.contains(files, 'LICENSE')) {
                potentialFile = 'LICENSE';
            } else if (_.contains(files, 'license')) {
                potentialFile = 'license';
            } else if (_.contains(files, 'LICENSE.txt')) {
                potentialFile = 'LICENSE.txt';
            } else if (_.contains(files, 'license.txt')) {
                potentialFile = 'license.txt';
            } else if (_.contains(files, 'LICENSE.md')) {
                potentialFile = 'LICENSE.md';
            } else if (_.contains(files, 'license.md')) {
                potentialFile = 'license.md';
            } else if (_.contains(files, 'NOTICE')) {
                potentialFile = 'NOTICE';
            } else if (_.contains(files, 'notice')) {
                potentialFile = 'notice';
            } else if (_.contains(files, 'NOTICE.txt')) {
                potentialFile = 'NOTICE.txt';
            } else if (_.contains(files, 'notice.txt')) {
                potentialFile = 'notice.txt';
            }

            // list license file if found
            // use license-checker to match license content
            // if no license file is found, fall back to list bower.json as license file
            if (!_.isNull(potentialFile) && !_.isUndefined(potentialFile)) {
                licenseContent = fs.readFileSync(path.resolve(targetFolder, potentialFile), 'utf-8');
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
                    if (content.version && _.isUndefined(version)) {
                        version = content.version;
                    }
                    if (content.license && _.isUndefined(license)) {
                        license = content.license;
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

            licenseMap.push({
                license,
                name,
                version,
                repository,
                licenseFile,
                licenseContent
            });
        }
    });

    // push additional info if any
    if (args.config) {
        licenseMap = _.union(licenseMap, configProcessor.parse(args.config, 'bower'));
    }

    return _.sortBy(licenseMap, 'license');
}
