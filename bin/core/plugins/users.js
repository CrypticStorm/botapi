var Commands = {
    name: 'Core-Users',
    commands: [
        {
            name: 'info',
            aliases: ['user'],
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
        }
    ]
};

module.exports = Commands;