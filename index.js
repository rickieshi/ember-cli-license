/* jshint node: true */
'use strict';

module.exports = {
    name: 'ember-cli-license',
    includedCommands: function () {
        return {
            release : require('./addon/license')
        };
    }
};