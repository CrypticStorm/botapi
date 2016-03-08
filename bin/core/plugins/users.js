"use strict";

const Events = require('discordie').Events;

function saveUser(bot, user) {
    bot.database.query('INSERT INTO `users` (`id`) VALUES (?) ON DUPLICATE KEY UPDATE `last_seen` = NOW()',
        [user.id], function(error, results, fields) {
            if (error) {
                console.log(error);
            }
        });
}

function saveGuild(bot, guild) {
    guild.members.forEach(member => saveUser(bot, member));
}

function onLogout(bot, event) {
    if (event.user.previousStatus == 'online' && event.user.status == 'offline') {
        saveUser(bot, event.user);
    }
}

var Plugin = {
    name: 'Core-Users',
    version: '1.0.0',
    enable: function() {
        this.manager.bot.addDispatch(Events.PRESENCE_UPDATE, onLogout.bind(this, this.manager.bot));
        this.manager.bot.addDispatch(Events.GUILD_MEMBER_ADD, saveUser.bind(this, this.manager.bot));
        this.manager.bot.addDispatch(Events.GUILD_MEMBER_REMOVE, saveUser.bind(this, this.manager.bot));
        this.manager.bot.Users.forEach(member => saveUser(this.manager.bot, member));
    },
    disable: function() {
        this.manager.bot.Users.forEach(member => saveUser(this.manager.bot, member));
    }
};

module.exports = Plugin;