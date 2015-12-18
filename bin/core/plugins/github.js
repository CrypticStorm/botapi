"use strict";

const fs = require('fs');
const os = require('os');

const Commands = {
    name: 'Core-Github',
    load: function(manager) {
        var github_json = JSON.parse(fs.readFileSync('cfg/github.json', 'utf-8'));
        manager.bot.config.github_json = github_json;
        var channels = github_json.channels;
        var secrets = github_json.secrets;
        console.log(channels);
        console.log(secrets);
        if (channels.length > 0 && secrets.length > 0) {
            manager.bot.app.post('/github/bot', function (req, res) {
                if (req.headers['x-github-event'] == 'push') {
                    var branch = req.body.ref.substring(req.body.ref.lastIndexOf('/') + 1);
                    var head_url = req.body.head_commit.url;
                    var commits = req.body.commits;
                    var message = 'New commit' + (commits.length > 1 ? 's' : '') + ' to `' + branch + '`:\n'
                    message += '```';
                    for (var i = 0; i < commits.length; i++) {
                        message += commits[i].id.substring(0, 8) + ': ' + commits[i].message + '(' + commits[i].author.name + ')' + '\n';
                    }
                    message += '```\n';
                    message += head_url + '\n';

                    for (var i = 0; i < channels.length; i++) {
                        manager.bot.client.Channels.get(channels[i]).sendMessage(message);
                    }
                } else {
                    console.log('Unknown github message:');
                    console.log(req.headers);
                    console.log(req.body);
                }
                res.send('ok');
            });
        }
    },
    enable: function(manager) {

    }
};

module.exports = Commands;