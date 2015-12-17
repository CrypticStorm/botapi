module.exports = function() {
    var lines = require("fs").readFileSync("cfg/login.txt", "utf-8").split(require("os").EOL);
    if (lines.length == 0) {
        throw 'no login';
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
}
