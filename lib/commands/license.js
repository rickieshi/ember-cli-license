var rsvp = require('rsvp');
var fs = require('fs');
var path = require('path');
var checker = require('license-checker');
var _ = require('underscore');
var bowerJson = require('bower-json');
var licenseChecker = require('license-checker/lib/license');

module.exports = {
    name: 'license',
    run: function () {
        return new rsvp.Promise(function (resolve, reject) {
            checker.init({
                start: process.cwd(),
                production: true
            }, function (err, output) {
                if (err) {
                    throw err;
                } else {
                    var licenseMap = _.chain(_.sortBy(_.chain(output)
                            .pairs(output)
                            .map(function (package) {
                                var name = package['0'].split('@')[0];
                                var version = package['0'].split('@')[1];
                                var details = package['1'];

                                return {
                                    license: details.licenses,
                                    name,
                                    version,
                                    repository: details.repository,
                                    licenseFile: details.licenseFile
                                };
                            })
                            .value(), 'license'))
                        .map(function (package) {
                            if (package.repository && package.licenseFile) {
                                return [`${package.license},${package.name},${package.version},${package.repository},${package.repository}/raw/master/${_.last(package.licenseFile.split('\\'))}`];
                            } else if (package.repository && !package.licenseFile) {
                                return [`${package.license},${package.name},${package.version},${package.repository},${package.repository}/raw/master/package.json`];
                            } else {
                                return [`${package.license},${package.name},${package.version},,`];
                            }
                        })
                        .value();
                    licenseMap.unshift([`license type,name,version,homepage,license location`]);
                    licenseMap.unshift([`Node`]);

                    licenseMap.push([`Bower`]);
                    licenseMap.push([`license type,name,version,homepage,license location`]);

                    var bowerDeps = fs.readdirSync(path.resolve('./bower_components'));
                    _.each(bowerDeps, function (folder) {
                        var files = fs.readdirSync(path.resolve('./bower_components', folder));
                        var potentialFile;
                        if (_.contains(files, 'LICENSE')) {
                            potentialFile = 'LICENSE';
                        } else if (_.contains(files, 'license')) {
                            potentialFile = 'license';
                        } else if (_.contains(files, 'LICENSE.txt')) {
                            potentialFile = 'LICENSE.txt';
                        } else if (_.contains(files, 'license.txt')) {
                            potentialFile = 'license.txt';
                        }
                        var file = bowerJson.findSync(path.resolve('./bower_components', folder));
                        var json = bowerJson.readSync(file);
                        var name = json.name;
                        var version = json.version;
                        var homepage = json.homepage;
                        var repository;
                        if (fs.existsSync(path.resolve('./bower_components', folder, 'package.json'))) {
                            var content = JSON.parse(fs.readFileSync(path.resolve('./bower_components', folder, 'package.json'), 'utf8'));
                            if (content.repository) {
                                if (content.repository.url) {
                                    repository = content.repository.url;
                                } else {
                                    repository = content.repository;
                                }
                            }

                            if (json.repository && (_.isNull(repository) || _.isUndefined(repository))) {
                                repository = json.repository.url;
                            }

                            if ((_.isNull(repository) || _.isUndefined(repository))) {
                                repository = homepage;
                            }
                            repository = repository.replace('git+ssh://git@', 'git://')
                                .replace('git+https://github.com', 'https://github.com')
                                .replace('git://github.com', 'https://github.com')
                                .replace('git@github.com:', 'https://github.com/')
                                .replace('.git', '');
                        }

                        var license;
                        var licenseFile;
                        if (!_.isNull(potentialFile) && !_.isUndefined(potentialFile)) {
                            license = licenseChecker(fs.readFileSync(path.resolve('./bower_components', folder, potentialFile), 'utf8'));
                            licenseFile = potentialFile;
                        } else {
                            license = json.license;
                            licenseFile = file;
                        }
                        if (_.isNull(version) || _.isUndefined(version)) {
                            version = '';
                        }
                        if (_.isNull(repository) || _.isUndefined(repository)) {
                            repository = '';
                        } else {
                            repository = `${repository}/raw/master/`;
                        }
                        licenseMap.push([`${license},${name},${version},${repository},${repository}${licenseFile}`]);
                    });
                    fs.writeFileSync(`licenses.csv`, licenseMap.join('\n'), 'utf8');
                }
            });
        });
    }
}