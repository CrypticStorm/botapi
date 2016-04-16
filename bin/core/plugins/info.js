"use strict";

var Info = {
    name: 'Core-Info',
    version: '1.0.0',
    commands: [
        {
            name: 'user',
            aliases: ['iu'],
            callback: function (event, bot, text, args) {
                var user = event.message.author;
                for (var i in event.message.mentions) {
                    if (event.message.mentions.hasOwnProperty(i)) {
                        if (event.message.mentions[i].id != bot.client.User.id) {
                            user = event.message.mentions[i];
                            break;
                        }
                    }
                }
                var message = '**' + user.username + '**\n';
                message += '`ID` ' + user.id + '\n';
                message += '`Avatar` ' + user.avatarURL + '\n';
                message += '`Status` ' + user.status;
                //var gid = user.gameId;
                //if (gid) {
                //    message += 'GameID: ' + gid + '\n';
                //}

                event.message.channel.sendMessage(message);
            }
        },
        {
            name: 'channel',
            aliases: ['ic', 'ch'],
            callback: function (event, bot, text, args) {
                var channel = event.message.channel;

                var message;
                if (channel.is_private) {
                    message = 'Direct Message channels have no additional information.';
                } else {
                    var channel_prefix = channel.type === 'text' ? '#' : '';
                    message = '**' + channel_prefix + channel.name + '**\n';
                    message += '`Channel` ' + channel.id + '\n';
                    message += '`Guild` ' + channel.guild_id + '\n';
                    message += '`Position` ' + channel.position + '\n';
                    if (channel.topic) {
                        message += '`Topic` ' + channel.topic + '';
                    } else {
                        message += 'No Topic';
                    }
                }

                event.message.channel.sendMessage(message);
            }
        }
    ]
};

module.exports = Info;