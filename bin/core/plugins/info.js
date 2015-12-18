var Commands = {
    name: 'Core-Info',
    commands: [
        {
            name: 'user',
            aliases: ['iu'],
            callback: function (e, bot) {
                var user = e.message.author;
                for (var i in e.message.mentions) {
                    if (e.message.mentions.hasOwnProperty(i)) {
                        if (e.message.mentions[i].id != bot.client.User.id) {
                            user = e.message.mentions[i];
                            break;
                        }
                    }
                }
                var message = '```';
                message += 'Information about: ' + user.username + '\n';
                message += 'ID: ' + user.id + '\n';
                message += 'Avatar: ' + user.avatarURL + '\n';
                message += 'Status: ' + user.status + '\n';
                var gid = user.gameId;
                if (gid) {
                    message += 'GameID: ' + gid + '\n';
                }
                message += '```';

                e.message.channel.sendMessage(message);
            }
        },
        {
            name: 'channel',
            aliases: ['ic', 'ch'],
            callback: function (e, bot) {
                var channel = e.message.channel;

                var message;
                if (channel.is_private) {
                    message = 'Direct Message channels have no additional information.';
                } else {
                    message = '```';
                    message += 'Channel Information: ' + channel.name + ' (' + channel.type + ')\n';
                    message += 'Guild Info: ' + channel.guild_id + ' (' + channel.position + ')\n';
                    if (channel.topic) {
                        message += 'Topic: ' + channel.topic + '\n';
                    } else {
                        message += 'No Topic\n';
                    }
                    message += '```';
                }

                e.message.channel.sendMessage(message);
            }
        }
    ]
};

module.exports = Commands;