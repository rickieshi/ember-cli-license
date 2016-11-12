var npmLicenseScan = require('../lib/npmLicenseScan');

module.exports = {
    name: 'license',
    availableOptions: [
        {
            name: 'production',
            type: Boolean,
            default: false,
            aliases: ['prod']
        }
    ],
    run: function (options, rawArgs) {
        return npmLicenseScan.init({
            start: process.cwd(),
            production: options.production
        }).then(function () {
            console.log('Task finished!')
        });
    }
}