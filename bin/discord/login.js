module.exports = function() {
    var lines = require("fs").readFileSync("cfg/login.txt", "utf-8").split(require("os").EOL);
    return {
        email: lines[0],
        password: lines[1]
    }
}
