var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var bowerJson = require('bower-json');
var licenseChecker = require('license-checker/lib/license');
var format = require('./formatter');

// recursively getting components listed under dependencies only
var doStuff = function (base, bowerDependency) {
    _.each(base, function (package) {
        bowerDependency.push(package);
        var json = bowerJson.findSync(path.resolve('./bower_components', package));
        var rootDeps = _.chain(bowerJson.readSync(json).dependencies)
            .map(function (version, packageName) {
                return packageName;
            }).value();

        if (rootDeps.length > 0) {
            doStuff(rootDeps, bowerDependency);
        }
    });
}

module.exports = function (componentList, args) {
    var licenseMap = [];

    // grab components listed under dependencies only
    if (args.production) {
        var rootFile = bowerJson.findSync(process.cwd());
        var rootDeps = _.chain(bowerJson.readSync(rootFile).dependencies)
            .map(function (version, packageName) {
                return packageName;
            }).value();

        var bowerDependency = [];
        doStuff(rootDeps, bowerDependency);
        componentList = _.intersection(_.union(bowerDependency), componentList);
    }

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

            // use records in config obj if available
            if (args.config) {
                var configObject = JSON.parse(fs.readFileSync(path.resolve(args.config), 'utf8')).reference;
                var record = _.findWhere(configObject, {
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
            }

            licenseMap.push({
                license, name, version, repository, licenseFile
            });
        }
    });

    // push additional info if any
    if (args.config) {
        var additionalComponent = JSON.parse(fs.readFileSync(path.resolve(args.config), 'utf8')).bower
        _.each(additionalComponent, function (component) {
            licenseMap.push({
                license: component.license,
                name: component.name,
                version: component.version,
                repository: component.repository,
                licenseFile: component.licenseFile
            });
        });
    }


    return format(_.sortBy(licenseMap, 'license'));
}