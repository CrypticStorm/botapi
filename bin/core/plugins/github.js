"use strict";

const fs = require('fs');
const os = require('os');
const Plugin = require('../../plugin/plugin');

function load_config(bot, file) {
    bot.config.github_json = JSON.parse(fs.readFileSync(file, 'utf-8'));
    var channel_ids = bot.config.github_json.channels;
    var channels = [];
    for (var i = 0; i < channel_ids.length; i++) {
        channels.push(bot.Channels.get(channel_ids[i]));
    }
    bot.config.github_json.channels = channels;
}

class Github extends Plugin {
    constructor(manager) {
        super(manager, 'Core-Github', '1.0.0');
    }

    enable() {
        load_config(this.manager.bot, 'cfg/github.json');
        this.router.post('/github/bot', function (req, res) {
            if (req.headers['x-github-event'] == 'push') {
                var reponame = req.body.repository.name;
                var branch = req.body.ref.substring(req.body.ref.lastIndexOf('/') + 1);
                var commits = req.body.commits;
                var message = '**' + reponame + '/' + branch + '**\n'
                for (var i = 0; i < commits.length; i++) {
                    message += '`' + commits[i].id.substring(0, 8) + '` ' + commits[i].message + '\n';
                }

                for (var i = 0; i < this.manager.bot.config.github_json.channels.length; i++) {
                    this.manager.bot.config.github_json.channels[i].sendMessage(message);
                }
            } else {
                console.log('Unknown github message:');
                console.log(req.headers);
                console.log(req.body);
            }
            res.status(200).end();
        }.bind(this));
    }
}

module.exports = Github;