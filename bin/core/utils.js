"use strict";

var Utils = {
    escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },
    compareVersion(ver1, ver2) {
        var ver1a = var1.split('.');
        var ver2a = var2.split('.');

        var i = 0;
        while (i < ver1a.length && i < ver2a.length) {
            if (parseInt(ver1a[i]) < parseInt(ver2a[i])) {
                return -1;
            } else if (parseInt(ver1a[i]) > parseInt(ver2a[i])) {
                return 1;
            } else {
                i++;
            }
        }
        if (i < ver1a.length) {
            if (parseInt(ver1a[i]) > 0) {
                return 1;
            }
        } else if (i < ver2a.length) {
            if (parseInt(ver2a[i]) > 0) {
                return -1;
            }
        }
        return 0;
    },
    joinPromises(promises) {
        promises.reduce((accumulator, promise) => accumulator.then(promise), Promise.resolve());
    }
};

module.exports = Utils;