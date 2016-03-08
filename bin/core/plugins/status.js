"use strict";

var Plugin = {
    name: 'Core-Status',
    commands: [
        {
            name: 'baka',
            callback: function (event, bot) {
                event.message.reply('ばか！');
            }
        },
        {
            name: 'plugins',
            aliases: ['pl'],
            callback: function (event, bot) {
                var args = event.internal.text.split(' ');
                var channelConsumer = function(channel) {
                    if (args.length > 1) {
                        var sub_cmd = args[0].toLowerCase();
                        switch (sub_cmd) {
                            case 'reload':
                                if (args.length > 2) {
                                    bot.hasPermission(event.message.author, "plugin_reload").then(function(hasPermission) {
                                        if (bot.plugins.reload(args[2], hasPermission)) {
                                            event.message.channel.sendMessage('Plugin reloaded');
                                        } else {
                                            event.message.channel.sendMessage('Plugin not found / No permission to reload');
                                        }
                                    });
                                } else {
                                    event.message.channel.sendMessage('Please supply a plugin name.');
                                }
                                return;
                        }
                    }
                    var plugins = bot.plugins.plugins;
                    var message = 'Loaded Plugins: ';
                    var first = true;
                    for (var i in plugins) {
                        if (plugins.hasOwnProperty(i)) {
                            if (!first) {
                                message += ', ';
                            }
                            first = false;

                            if (plugins[i].locked) {
                                message += '**';
                            }
                            if (!plugins[i].enabled) {
                                message += '_';
                            }

                            message += plugins[i].name;

                            if (!plugins[i].enabled) {
                                message += '_';
                            }
                            if (plugins[i].locked) {
                                message += '**';
                            }
                        }
                    }
                    channel.sendMessage(message);
                }.bind(this);
                if (event.message.isPrivate) {
                    channelConsumer(event.message.channel);
                } else {
                    bot.hasPermission(event.message.author, "plugin_show").then(function (hasPermission) {
                        if (hasPermission) {
                            channelConsumer(event.message.channel);
                        } else {
                            event.message.author.openDM().then(channelConsumer);
                        }
                    });
                }
            }
        },
        {
            name: 'commands',
            aliases: ['cmds', 'help'],
            callback: function(e, bot){
                var channelConsumer = function(channel) {
                    var cmds = bot.commands.list();
                    //if (!bot.isAdmin(e.message.author)) {
                    //    cmds = cmds.filter(function(cmd) {return cmd.permission.length});
                    //}
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

module.exports = Plugin;