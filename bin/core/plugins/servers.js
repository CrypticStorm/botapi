"use strict";

const Plugin = require('../../plugin/plugin');

class Servers extends Plugin {
    constructor(manager) {
        super(manager, 'Core-Servers', '1.0.0');
    }

    commands = [
        {
            name: 'join',
            permission: 'cmd_join',
            callback: function(e, bot){
                var args = e.message.content.split(" ");
                if (args.length >= 2) {
                    var arg = args[1];
                    arg = arg.substring(arg.lastIndexOf("/")+1);
                    var invites = bot.client.Invites;
                    invites.accept(arg).then(function(invite) {
                        e.message.channel.sendMessage('Joined server: ' + invite.guild.name);
                    }, function(error) {
                        e.message.channel.sendMessage('Error joining server');
                        console.log('Invite Error: ' + error);
                    });
                }
            }
        }
    ]
}

module.exports = Servers;