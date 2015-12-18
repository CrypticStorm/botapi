"use strict";

const fs = require('fs');
const os = require('os');

const Commands = {
    name: 'Core-Github',
    load: function(manager) {
        manager.bot.config.github_json = JSON.parse(fs.readFileSync('cfg/github.json', 'utf-8'));
        manager.bot.app.post('/github/bot', function (req, res) {
            if (req.headers['x-github-event'] == 'push') {
                console.log(req.headers);
                var reponame = req.body.repository.name;
                var branch = req.body.ref.substring(req.body.ref.lastIndexOf('/') + 1);
                var head_url = req.body.head_commit.url;
                var commits = req.body.commits;
                var message = 'New commit' + (commits.length > 1 ? 's' : '') + ' to `' + reponame + '` at branch `' + branch + '`:\n\n'
                for (var i = 0; i < commits.length; i++) {
                    message += '`' + commits[i].id.substring(0, 8) + '`: ' + commits[i].message + ' (' + commits[i].author.name + ')' + '\n';
                }
                message += '\n' + head_url + '\n';

                for (var i = 0; i < manager.bot.config.github_json.channels.length; i++) {
                    manager.bot.config.github_json.channels[i].sendMessage(message);
                }
            } else {
                console.log('Unknown github message:');
                console.log(req.headers);
                console.log(req.body);
            }
            res.send('ok');
        });
    },
    enable: function(manager) {
        var channel_ids = manager.bot.config.github_json.channels;
        var channels = [];
        for (var i = 0; i < channel_ids.length; i++) {
            channels.push(manager.bot.client.Channels.get(channel_ids[i]));
        }
        manager.bot.config.github_json.channels = channels;
    }
};

module.exports = Commands;