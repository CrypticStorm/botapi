var Commands = {
    name: 'Core-Status',
    commands: [
        {
            name: 'baka',
            callback: function (e, bot) {
                e.message.reply('ばか！');
            }
        },
        {
            name: 'plugins',
            aliases: ['pl'],
            callback: function (e, bot) {
                var channelConsumer = function(channel) {
                    var plugins = bot.plugins.plugins;
                    var message = 'Loaded Plugins: ';
                    var first = true;
                    for (var i in plugins) {
                        if (plugins.hasOwnProperty(i)) {
                            if (!first) {
                                message += ', ';
                            }
                            message += plugins[i].name;
                            first = false;
                        }
                    }
                    channel.sendMessage(message);
                };
                var args = e.message.content.split(' ');
                if (bot.isAdmin(e.message.author) && args.length >= 2 && args[1] == 'show') {
                    channelConsumer(e.message.channel);
                } else if (e.message.isPrivate) {
                    channelConsumer(e.message.channel);
                } else {
                    e.message.author.openDM().then(channelConsumer.bind(this));
                }
            }
        },
        {
            name: 'commands',
            aliases: ['cmds', 'help'],
            callback: function(e, bot){
                var channelConsumer = function(channel) {
                    var cmds = bot.commands.list();
                    if (!bot.isAdmin(e.message.author)) {
                        cmds = cmds.filter(function(cmd) {return !cmd.admin});
                    }
                    var cmdList = "Commands: ";
                    var first = true;
                    for (var i = 0; i < cmds.length; i++) {
                        if (!first) {
                            cmdList += ", ";
                        }
                        cmdList += cmds[i].name;
                        first = false;
                    }
                    channel.sendMessage(cmdList.replace(/`/g, '\\`'));
                };
                if (e.message.isPrivate) {
                    channelConsumer(e.message.channel);
                } else {
                    e.message.author.openDM().then(channelConsumer);
                }
            }
        }
    ]
};

module.exports = Commands;