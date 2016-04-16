"use strict";

var Servers = {
    name: 'Core-Servers',
    version: '1.0.0',

    commands: [
        {
            name: 'join',
            permission: 'cmd_join',
            callback: function(event, bot, text, args){
                if (args.length >= 2) {
                    var arg = args[1];
                    arg = arg.substring(arg.lastIndexOf("/")+1);
                    var invites = bot.client.Invites;
                    invites.accept(arg).then(function(invite) {
                        event.message.channel.sendMessage('Joined server: ' + invite.guild.name);
                    }, function(error) {
                        event.message.channel.sendMessage('Error joining server');
                        console.log('Invite Error: ' + error);
                    });
                }
            }
        }
    ]
};

module.exports = Servers;