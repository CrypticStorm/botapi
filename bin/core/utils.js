"use strict";

require('argparse/lib/action/help').prototype.call = function (parser, namespace) {
    if (namespace.message) {
        namespace.message.reply(parser.formatHelp());
    } else {
        parser.printHelp();
    }
};
require('argparse/lib/action/version').prototype.call = function (parser) {
    parser.printHelp();
};

var Utils = {
    escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },
    compareVersion(ver1, ver2) {
        var ver1a = var1.split('.');
        var ver2a = var2.split('.');

        var i = 0;
        while (i < ver1a.length && i < ver2a.length) {
            if (parseInt(ver1a[i]) < parseInt(ver2a[i])) {
                return -1;
            } else if (parseInt(ver1a[i]) > parseInt(ver2a[i])) {
                return 1;
            } else {
                i++;
            }
        }
        if (i < ver1a.length) {
            if (parseInt(ver1a[i]) > 0) {
                return 1;
            }
        } else if (i < ver2a.length) {
            if (parseInt(ver2a[i]) > 0) {
                return -1;
            }
        }
        return 0;
    },
    randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    },
    fixArgumentParser() {
        require('argparse/lib/action/help').prototype.call = function (parser) {
            parser.printHelp();
        };
        require('argparse/lib/action/version').prototype.call = function (parser) {
            parser.printHelp();
        };
    },
    parseUser(context, user) {
        var discriminatorIndex;
        var guild_members = context.members;
        var regex = /(?:(?:<@)(\d+)(?:>))|(?:^(\d+)$)/.exec(user);
        if (regex != null) {
            var regex_id = regex[1] == null ? regex[2] : regex[1];
            guild_members = guild_members.filter(member => member.id == regex_id);
        } else if ((discriminatorIndex = user.lastIndexOf('#')) >= 0) {
            var username = user.substring(0, discriminatorIndex);
            var discriminator = user.substring(discriminatorIndex + 1);
            guild_members = guild_members.filter(member => member.username == username && member.discriminator == discriminator);
        } else {
            guild_members = guild_members.filter(member => member.username == user);
        }
        if (guild_members.length == 1) {
            return guild_members.pop();
        } else if (guild_members.length > 1) {
            console.error(guild_members);
            throw new Error('Multiple users have the name `' + user + '`, please add `#xxxx` to specify which user.');
        } else {
            throw new Error('No users on this server found with the name `' + user + '`');
        }
    },
    parseUsers(context, users) {
        var members = [];
        var error = '';
        for (let i in users) {
            var discriminatorIndex;
            var guild_members = context.members;
            var regex = /(?:(?:<@)(\d+)(?:>))|(?:^(\d+)$)/.exec(users[i]);
            if (regex != null) {
                var regex_id = regex[1] == null ? regex[2] : regex[1];
                guild_members = guild_members.filter(member => member.id == regex_id);
            } else if ((discriminatorIndex = users[i].lastIndexOf('#')) >= 0) {
                var username = users[i].substring(0, discriminatorIndex);
                var discriminator = users[i].substring(discriminatorIndex + 1);
                guild_members = guild_members.filter(member => member.username == username && member.discriminator == discriminator);
            } else {
                guild_members = guild_members.filter(member => member.username == users[i]);
            }
            if (guild_members.length == 1) {
                members.push(guild_members.pop());
            } else if (guild_members.length > 1) {
                error += 'Multiple users have the name `' + users[i] + '`, please add `#xxxx` to specify which user.\n';
                return;
            } else {
                error += 'No users on this server found with the name `' + users[i] + '`\n';
                return;
            }
        }
        if (error.length > 0) {
            throw new Error(error);
        } else {
            return members;
        }
    }
};

Utils.randomAlphanumeric = function(length) {
    return Utils.randomString(length, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
};

module.exports = Utils;