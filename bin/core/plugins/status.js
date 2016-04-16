"use strict";

const Discordie = require('discordie');
const StatusTypes = Discordie.StatusTypes;
const fs = require('fs');

var Status = {
    name: 'Core-Status',
    version: '1.0.0',

    enable: function() {
        const bot = this.manager.bot;
        fs.readFile('cfg/status.txt', 'utf8', function(error, data) {
            if (error) {
                console.log(error.stack ? error.stack : error);
                return;
            }
            bot.setStatus(StatusTypes.ONLINE, {
                name: data
            });
        });
    },

    commands: [
        {
            name: 'baka',
            callback: function (event, bot, text, args) {
                event.message.reply('ばか！');
            }
        },
        {
            name: 'plugins',
            aliases: ['pl'],
            callback: function (event, bot, text, args) {
                var channelConsumer = channel => {
                    if (args.length > 1) {
                        var sub_cmd = args[1].toLowerCase();
                        switch (sub_cmd) {
                            case 'reload':
                                if (args.length > 2) {
                                    bot.hasPermission(event.message.author, "plugin_reload").then(function(hasPermission) {
                                        if (hasPermission) {
                                            if (bot.plugins.reload(args[2])) {
                                                event.message.channel.sendMessage('Plugin reloaded.');
                                            } else {
                                                event.message.channel.sendMessage('Plugin not found.');
                                            }
                                        } else {
                                            event.message.channel.sendMessage('No permission to reload.');
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

                            //if (plugins[i].locked) {
                            //    message += '**';
                            //}
                            if (!plugins[i].enabled) {
                                message += '_';
                            }

                            message += plugins[i].name;

                            if (!plugins[i].enabled) {
                                message += '_';
                            }
                            //if (plugins[i].locked) {
                            //    message += '**';
                            //}
                        }
                    }
                    channel.sendMessage(message);
                };
                if (event.message.isPrivate) {
                    channelConsumer(event.message.channel);
                } else {
                    console.log('not private');
                    bot.hasPermission(event.message.author, "plugin_show").then(hasPermission => {
                        console.log(hasPermission);
                        if (hasPermission) {
                            channelConsumer(event.message.channel);
                        } else {
                            event.message.author.openDM().then(channelConsumer);
                        }
                    }, err => console.log(err.stack));
                }
            }
        },
        {
            name: 'commands',
            aliases: ['cmds', 'help'],
            callback: function(event, bot) {
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
                if (event.message.isPrivate) {
                    channelConsumer(event.message.channel);
                } else {
                    event.message.author.openDM().then(channelConsumer);
                }
            }
        },
        {
            name: 'status',
            callback: function(event, bot, text, args) {
                bot.hasPermission(event.message.author, 'status_set').then(hasPermission => {
                    if (hasPermission) {
                        var status = text.substr('status'.length).trim();
                        bot.setStatus(StatusTypes.ONLINE, {
                            name: status
                        });
                        fs.writeFile('cfg/status.txt', status, 'utf8', function(error, data) {
                            if (error) {
                                console.log(error.stack ? error.stack : error);
                            }
                        });
                    }
                });
            }
        }
    ]
};

module.exports = Status;