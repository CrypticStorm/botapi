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
                var message = '**' + user.username + '**\n';
                message += '`ID` ' + user.id + '\n';
                message += '`Avatar` ' + user.avatarURL + '\n';
                message += '`Status` ' + user.status;
                //var gid = user.gameId;
                //if (gid) {
                //    message += 'GameID: ' + gid + '\n';
                //}

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

                e.message.channel.sendMessage(message);
            }
        }
    ]
};

module.exports = Commands;