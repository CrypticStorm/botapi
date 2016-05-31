"use strict";

const fs = require("fs");

module.exports = function() {
    if (fs.existsSync('cfg/token.txt')) {
        var token = fs.readFileSync('cfg/token.txt', 'utf-8');
        if (token) {
            return {
                token: token
            }
        }
    }

    var lines = fs.readFileSync('cfg/login.txt', 'utf-8').split(require('os').EOL);
    if (lines.length == 0) {
        throw 'no token or login';
    } else if (lines.length == 1) {
        return {
            token: lines[0]
        }
    } else {
        return {
            email: lines[0],
            password: lines[1]
        }
    }
};
