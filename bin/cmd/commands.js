"use strict";

const Command = require('./command');

var tag_command = function(bot, event) {
    if (event.message.author.id == bot.client.User.id || event.message.author.bot) {
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
    var args = text.split(/\s/g);
    var cmd = this.get(args[0]);
    if (cmd) {
        bot.hasPermission(event.message.author, cmd.permission).then(function(hasPermission) {
            if (hasPermission) {
                cmd.callback(event, bot, text, args);
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
    var args = text.split(/\s/g);
    var cmd_name = Object.keys(this._commands).find(cmd_regex => text.match(cmd_regex));
    if (!cmd_name) {
        cmd_name = Object.keys(this._aliascommands).find(cmd_regex => text.match(cmd_regex));
    }
    if (cmd_name) {
        var cmd = this._commands[cmd_name];
        bot.hasPermission(event.message.author, cmd.permission).then(function(hasPermission) {
            if (hasPermission) {
                cmd.callback(event, bot, text, args);
            } else {
                event.message.reply('ばか！管理者じゃないです。');
            }
        });
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
            console.log('[Commands] Added: ' + cmd.name);
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