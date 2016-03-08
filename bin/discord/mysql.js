"use strict";

const mysql = require('mysql');
const fs = require('fs');

module.exports = function() {
    var login = JSON.parse(fs.readFileSync("cfg/mysql.json", 'utf-8'));
    var connection = mysql.createConnection(login);
    connection.connect(function(err) {
        if (err) {
            console.error('Error connecting to MySQL: ' + err.stack);
            return;
        }
        console.log('Connected as ' + connection.threadId);
    });
    return connection;
};
