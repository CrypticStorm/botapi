"use strict";

const Command = require('./command');

var tag_command = function(bot, event) {
    if (event.message.author.id == bot.client.User.id) {
        return;
    }
    var text;
    if (event.message.content.startsWith(bot.client.User.mention)) {
        text = event.message.content.substring(bot.client.User.mention.length).trim();
    } else if (event.message.isPrivate) {
        text = event.message.content;
    } else {
        return;
    }
    event.internal = {text: text};
    var cmd = this.get(text.split(' ')[0]);
    if (cmd) {
        bot.hasPermission(event.message.author, cmd.permission).then(function(hasPermission) {
            if (hasPermission) {
                cmd.callback(event, bot);
            } else {
                event.message.reply('ばか！管理者じゃないです。');
            }
        });
    }
};

var regex_commands = function(bot, event) {
    if (event.message.author.id == bot.client.User.id) {
        return;
    }
    var text;
    if (event.message.content.startsWith(bot.client.User.mention)) {
        text = event.message.content.substring(bot.client.User.mention.length).trim();
    } else if (event.message.isPrivate) {
        text = event.message.content;
    } else {
        return;
    }
    event.internal = {text: text};
    for (var cmd_regex in this._commands) {
        if (this._commands.hasOwnProperty(cmd_regex)) {
            if (text.match(cmd_regex)) {
                var cmd = this.get(cmd_regex);
                if (cmd) {
                    bot.hasPermission(event.message.author, cmd.permission).then(function(hasPermission) {
                        if (hasPermission) {
                            cmd.callback(event, bot);
                        } else {
                            event.message.reply('ばか！管理者じゃないです。');
                        }
                    });
                    return;
                }
            }
        }
    }
    for (var alias_regex in this._aliascommands) {
        if (this._aliascommands.hasOwnProperty(alias_regex)) {
            if (text.match(alias_regex)) {
                var alias_cmd = this.get(alias_regex);
                if (alias_cmd) {
                    bot.hasPermission(event.message.author, alias_cmd.permission).then(function(hasPermission) {
                        if (hasPermission) {
                            alias_cmd.callback(event, bot);
                        } else {
                            event.message.reply('ばか！管理者じゃないです。');
                        }
                    });
                    return;
                }
            }
        }
    }
};

class Commands {
    constructor(regex, print_new) {
        this._regex = regex;
        this._print_new  = print_new;
        this._commands = {};
        this._aliascommands = {};
        this._executor = (this._regex ? regex_commands : tag_command).bind(this);
    }

    add(plugin, cmd_options) {
        var cmd = new Command(plugin, cmd_options, this._regex);
        this._commands[cmd.name] = cmd;
        for (var i in cmd.aliases) {
            if (cmd.aliases.hasOwnProperty(i) && !this._aliascommands.hasOwnProperty(cmd.aliases[i])) {
                this._aliascommands[cmd.aliases[i]] = cmd;
            }
        }
        if (this._print_new) {
            console.log('Added command: ' + cmd.name);
        }
    };

    get(name) {
        var cmd = this._commands[name];
        if (cmd) {
            return cmd;
        } else {
            return this._aliascommands[name];
        }
    };

    del(name) {
        var cmd = this._commands[name];
        if (cmd) {
            delete this._commands[name];
            for (var key in this._aliascommands) {
                if (this._aliascommands.hasOwnProperty(key)) {
                    delete this._aliascommands[key];
                }
            }
        }
    };

    list() {
        var keys = [];
        for (var key in this._commands) {
            if (this._commands.hasOwnProperty(key)) {
                var cmd = this._commands[key];
                if (!cmd.isPrivate) {
                    keys.push(cmd);
                }
            }
        }
        keys.sort(function(c1,c2) {return c1.name.localeCompare(c2.name);});
        return keys;
    };

    disable(plugin) {
        for (var key in this._commands) {
            if (this._commands.hasOwnProperty(key)) {
                var cmd = this._commands[key];
                if (cmd.plugin == plugin) {
                    delete this._commands[cmd.name];
                }
            }
        }
    }

    get executor() {
        return this._executor;
    }
}

module.exports = Commands;