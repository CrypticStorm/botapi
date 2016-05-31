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
                if (args.length > 1) {
                    try {
                        user = bot.utils.parseUser(event.message.guild, args[1]);
                    } catch (e) {
                        event.message.reply('Error: ' + e + '\n');
                        return;
                    }
                }

                var message = '**' + user.username + '**\n';
                message += '`ID` ' + user.id + '\n';
                message += '`Avatar` ' + user.avatarURL + '\n';
                message += '`Status` ' + user.status;

                event.message.reply(message);
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

                event.message.reply(message);
            }
        },
        {
            name: 'channels',
            aliases: ['ics', 'chs'],
            callback: function (event, bot, text, args) {
                var channels = event.message.guild.channels;

                if (event.message.isPrivate) {
                    event.message.channel.sendMessage('Direct Message channels have no additional information.');
                } else {
                    event.message.author.openDM().then(dm_channel =>
                        dm_channel.sendMessage('Channels:\n' +
                            channels.map(channel => '**' + (channel.type === 'text' ? '#' : '') + channel.name + '** ' + channel.id).join('\n')));
                }

                
            }
        }
    ]
};

module.exports = Info;