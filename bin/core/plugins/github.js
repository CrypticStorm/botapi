"use strict";

const fs = require('fs');
const os = require('os');

function load_config(bot, file) {
    bot.config.github_json = JSON.parse(fs.readFileSync(file, 'utf-8'));
    var channel_ids = bot.config.github_json.channels;
    bot.config.github_json.channels = channel_ids.map(channel_id => bot.Channels.get(channel_id)).filter(channel => channel != null);
}

var Github = {
    name: 'Core-GitHub',
    version: '1.0.0',

    enable: function() {
        load_config(this.manager.bot, 'cfg/github.json');
        this.router.post('/github/bot', function (req, res) {
            if (req.headers['x-github-event'] == 'push') {
                var reponame = req.body.repository.name;
                var branch = req.body.ref.substring(req.body.ref.lastIndexOf('/') + 1);
                var commits = req.body.commits;
                var message = commits.reduce(
                    (msg, commit) => msg + '`' + commit.id.substring(0, 8) + '` ' + commit.message + '\n',
                    '**' + reponame + '/' + branch + '**\n');
                this.manager.bot.config.github_json.channels.forEach(channel => channel.sendMessage(message));
            } else {
                console.log('Unknown github message:');
                console.log(req.headers);
                console.log(req.body);
            }
            res.status(200).end();
        }.bind(this));
    }
};

module.exports = Github;
