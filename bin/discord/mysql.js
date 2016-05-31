"use strict";

const mysql = require('mysql');
const fs = require('fs');

module.exports = (file) => {
    var login = JSON.parse(fs.readFileSync(file, 'utf-8'));
    var connection = mysql.createConnection(login);
    connection.connect((err) => {
        if (err) {
            console.error('[MySQL] Error connecting to MySQL: ' + err.stack);
            return;
        }
        console.log('[MySQL] Connected as ' + connection.threadId);
    });
    return connection;
};
