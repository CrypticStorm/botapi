module.exports = function() {
    var token = require("fs").readFileSync("cfg/token.txt", "utf-8");
    if (token) {
        return {
            token: token
        }
    }

    var lines = require("fs").readFileSync("cfg/login.txt", "utf-8").split(require("os").EOL);
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
