"use strict";

const Discordie = require('discordie');
const Permissions = Discordie.Permissions;
const co = require('co');
const argparse = require('argparse');
const ArgumentParser = argparse.ArgumentParser;
const Namespace = argparse.Namespace;

var Servers = {
    name: 'Core-Servers',
    version: '1.0.0',

    commands: [
        {
            name: 'role',
            parser() {
                var parser = new ArgumentParser({
                    prog: 'role',
                    description: 'Role modification command',
                    debug: true,
                    addHelp: true
                });

                var subparser = parser.addSubparsers();

                var create = subparser.addParser('create', {help: 'Create a role'});
                create.addArgument('name', {help: 'Role name'});
                create.addArgument(['-C', '--color'], {metavar: 'color', type: 'int', defaultValue: null, help: 'Color of the role (uncolored if omitted)'});
                create.addArgument(['-H', '--hoist'], {metavar: 'hoist', action: 'storeTrue', help: 'Show this group separate from others.'});
                create.addArgument(['-R', '--rank'], {metavar: 'rank', defaultValue: 0, help: 'Set rank (order) in role list'});
                create.addArgument('users', {nargs: '*', help: 'Default role members'});
                create.setDefaults({func: this.data.role_create});

                var assign = subparser.addParser('assign', {help: 'Add users to a role'});
                assign.addArgument('name', {help: 'Role name'});
                assign.addArgument('users', {nargs: '+', help: 'Team members'});
                assign.setDefaults({func: this.data.role_assign});

                var edit = subparser.addParser('edit', {help: 'Edit a role'});
                edit.addArgument('name', {help: 'Role name'});
                edit.addArgument(['-N', '--new_name'], {metavar: 'new name', help: 'New role name'});
                edit.addArgument(['-C', '--color'], {metavar: 'color', type: 'int', defaultValue: null, help: 'Color of the role (uncolored if omitted)'});
                edit.addArgument(['-H', '--hoist'], {metavar: 'hoist', action: 'storeTrue', help: 'Show this group separate from others.'});
                edit.addArgument(['-R', '--rank'], {metavar: 'rank', defaultValue: 0, help: 'Set rank (order) in role list'});
                edit.setDefaults({func: this.data.role_edit});

                var list = subparser.addParser('list', {help: 'List all role'});
                list.setDefaults({func: this.data.role_list});

                var unassign = subparser.addParser('unassign', {help: 'Remove players from a team'});
                unassign.addArgument('name', {help: 'Role name'});
                unassign.addArgument('users', {nargs: '+', help: 'Team members'});
                unassign.setDefaults({func: this.data.role_unassign});

                var del = subparser.addParser('delete', {help: 'Delete a role'});
                del.addArgument('name', {help: 'Role name'});
                del.setDefaults({func: this.data.role_delete});

                return parser;
            },
            callback: function (event, bot, text, args) {
                if (event.message.isPrivate) {
                    event.message.channel.sendMessage('Direct channels have no roles');
                    return;
                }
                args.shift();
                try {
                    var parsed = this.parser.parseArgs(args, new Namespace({message: event.message}));
                    if (typeof parsed.func == 'function') {
                        parsed.func(event.message, parsed, bot, this.plugin);
                    }
                } catch (e) {
                    event.message.reply(e);
                    console.error(event.message.guild.name + ' ' + event.message.channel.name + ' ' + event.message.author.username + '\n' + e.stack);
                }
            },
            data: {
                role_create(msg, parsed_args, bot, plugin) {
                    if (!bot.User.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: The bot does not have permission to fulfill this command. Requires: MANAGE_ROLES');
                        return;
                    }
                    if (!msg.author.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: You do not have permission to run this command.');
                        return;
                    }
                    co(function*() {
                        var role = yield msg.guild.createRole();
                        if (parsed_args.rank > 0) {
                            yield role.setPosition(parsed_args.rank);
                        }
                        yield role.commit(parsed_args.name, parsed_args.color, parsed_args.hoist);

                        var members = bot.utils.parseUsers(msg.guild, parsed_args.users)
                            .map(member => member.memberOf(msg.guild))
                            .filter(member => member != null);

                        for (let i in members) {
                            yield members[i].assignRole(role);
                        }

                        msg.reply('Role created');
                    });
                },
                role_assign(msg, parsed_args, bot, plugin) {
                    if (!bot.User.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: The bot does not have permission to fulfill this command. Requires: MANAGE_ROLES');
                        return;
                    }
                    if (!msg.author.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: You do not have permission to run this command.');
                        return;
                    }
                    var role = msg.guild.roles.find(role => role.id == parsed_args.name);
                    if (role == null) {
                        role = msg.guild.roles.find(role => role.name == parsed_args.name);
                        if (role == null) {
                            msg.reply(':x: No role found with that name.');
                            return;
                        }
                    }

                    var members = bot.utils.parseUsers(msg.guild, parsed_args.users)
                        .map(member => member.memberOf(msg.guild))
                        .filter(member => member != null)
                        .filter(member => !member.hasRole(role));

                    co(function*() {
                        for (let i in members) {
                            yield members[i].assignRole(role);
                        }
                    });

                    msg.reply('Roles assigned');
                },
                role_edit(msg, parsed_args, bot, plugin) {
                    if (!bot.User.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: The bot does not have permission to fulfill this command. Requires: MANAGE_ROLES');
                        return;
                    }
                    if (!msg.author.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: You do not have permission to run this command.');
                        return;
                    }
                    var role = msg.guild.roles.find(role => role.id == parsed_args.name);
                    if (role == null) {
                        role = msg.guild.roles.find(role => role.name == parsed_args.name);
                        if (role == null) {
                            msg.reply(':x: No role found with that name.');
                            return;
                        }
                    }

                    co(function*() {
                        if (parsed_args.rank > 0) {
                            yield role.setPosition(parsed_args.rank);
                        }
                        yield role.commit(parsed_args.new_name, parsed_args.color, parsed_args.hoist);
                    });

                    msg.reply('Role edited');
                },
                role_list(msg, parsed_args, bot, plugin) {
                    msg.author.openDM().then(channel =>
                        channel.sendMessage('Role List:\n' +
                            msg.guild.roles.sort((r1, r2) => r1.position - r2.position)
                                .map(role => '`' + role.position + ' ' + role.name + '` ' + role.id)
                                .join('\n')));
                },
                role_unassign(msg, parsed_args, bot, plugin) {
                    if (!bot.User.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: The bot does not have permission to fulfill this command. Requires: MANAGE_ROLES');
                        return;
                    }
                    if (!msg.author.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: You do not have permission to run this command.');
                        return;
                    }
                    var role = msg.guild.roles.find(role => role.id == parsed_args.name);
                    if (role == null) {
                        role = msg.guild.roles.find(role => role.name == parsed_args.name);
                        if (role == null) {
                            msg.reply(':x: No role found with that name.');
                            return;
                        }
                    }

                    var members = bot.utils.parseUsers(msg.guild, parsed_args.users)
                        .map(member => member.memberOf(msg.guild))
                        .filter(member => member != null)
                        .filter(member => member.hasRole(role));

                    co(function*() {
                        for (let i in members) {
                            yield members[i].unassignRole(role);
                        }
                    });

                    msg.reply('Roles unassigned');
                },
                role_delete(msg, parsed_args, bot, plugin) {
                    if (!bot.User.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: The bot does not have permission to fulfill this command. Requires: MANAGE_ROLES');
                        return;
                    }
                    if (!msg.author.can(Permissions.General.MANAGE_ROLES, msg.guild)) {
                        msg.reply(':x: You do not have permission to run this command.');
                        return;
                    }
                    var role = msg.guild.roles.find(role => role.id == parsed_args.name);
                    if (role == null) {
                        role = msg.guild.roles.find(role => role.name == parsed_args.name);
                        if (role == null) {
                            msg.reply(':x: No role found with that name.');
                            return;
                        }
                    }

                    co(function*() {
                        yield role.delete();
                    });

                    msg.reply('Role deleted');
                }
            }
        }
    ]
};

module.exports = Servers;