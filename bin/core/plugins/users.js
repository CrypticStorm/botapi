"use strict";

const Events = require('discordie').Events;

var Users = {
    name: 'Core-Users',
    version: '1.0.0',

    enable() {
        this.manager.bot.addDispatch(Events.PRESENCE_UPDATE, event => this.onLogout(this.manager.bot, event));
        this.manager.bot.addDispatch(Events.GUILD_MEMBER_ADD, event => this.saveUser(this.manager.bot, event.member));
        this.manager.bot.addDispatch(Events.PRESENCE_MEMBER_INFO_UPDATE, event => this.saveUser(this.manager.bot, event.new));
        this.manager.bot.addDispatch(Events.GUILD_MEMBER_REMOVE, event => this.saveUser(this.manager.bot, event.user));
        this.manager.bot.addDispatch(Events.CHANNEL_CREATE, event => this.saveChannel(this.manager.bot, event.channel));
        this.manager.bot.addDispatch(Events.CHANNEL_DELETE, event => this.deleteChannel(this.manager.bot, event.channelId));
        this.manager.bot.addDispatch(Events.GUILD_CREATE, event => this.saveGuild(this.manager.bot, event.guild));
        this.manager.bot.addDispatch(Events.GUILD_DELETE, event => this.deleteGuild(this.manager.bot, event.guildId));
        this.manager.bot.Users.forEach(user => this.saveUser(this.manager.bot, user));
        this.manager.bot.Channels.forEach(channel => this.saveChannel(this.manager.bot, channel));
        this.manager.bot.Guilds.forEach(guild => this.saveGuild(this.manager.bot, guild));
    },

    disable() {
        this.manager.bot.Users.forEach(member => this.saveUser(this.manager.bot, member));
        this.manager.bot.Channels.forEach(channel => this.saveChannel(this.manager.bot, channel));
        this.manager.bot.Guilds.forEach(guild => this.saveGuild(this.manager.bot, guild));
    },

    saveUser(bot, user) {
        bot.database.query('INSERT INTO `users` (`id`, `avatar`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `avatar` = VALUES(`avatar`), `last_seen` = NOW();',
            [user.id, user.avatar], error => {
                if (error) {
                    console.error(error.stack ? error.stack : error);
                }
            });
    },

    saveChannel(bot, channel) {
        bot.database.query('INSERT INTO `channels` (`id`) VALUES (?) ON DUPLICATE KEY UPDATE `id`=`id`;',
            [channel.id], error => {
                if (error) {
                    console.error(error.stack ? error.stack : error);
                }
            });
    },

    deleteChannel(bot, channel_id) {
        bot.database.query('DELETE FROM `channels` WHERE `id` = ?;',
            [channel_id], error => {
                if (error) {
                    console.error(error.stack ? error.stack : error);
                }
            });
    },

    saveGuild(bot, guild) {
        bot.database.query('INSERT INTO `guilds` (`id`) VALUES (?) ON DUPLICATE KEY UPDATE `id`=`id`;',
            [guild.id], error => {
                if (error) {
                    console.error(error.stack ? error.stack : error);
                }
            });
    },

    deleteGuild(bot, guild_id) {
        bot.database.query('DELETE FROM `guilds` WHERE `id` = ?;',
            [guild_id], error => {
                if (error) {
                    console.error(error.stack ? error.stack : error);
                }
            });
    },

    onLogout(bot, event) {
        if (event.user.previousStatus == 'online' && event.user.status == 'offline') {
            this.saveUser(bot, event.user);
        }
    }
};

module.exports = Users;
