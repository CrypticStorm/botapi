"use strict";

const co = require('co');

const Generators = {
    string: function*(conversation, msg) {
        msg = yield conversation.next();
        if (msg.content == '!quit' || msg.content == '!exit') {
            return {exit: true, messages: [msg]};
        } else {
            return {value: msg.content, messages: [msg]};
        }
    },
    integer: function*(conversation, msg) {
        msg = yield conversation.next();
        if (msg.content == '!quit' || msg.content == '!exit') {
            return {exit: true, messages: [msg]};
        } else if (!isNaN(msg)) {
            return {value: +(msg.content), messages: [msg]};
        } else {
            return {value: null, messages: [msg]};
        }
    },

    users: function*(conversation, msg, members, masterMessageBase) {
        var messages = [];
        var masterBaseContent = null;
        members = members ? members : [];
        masterMessageBase = masterMessageBase ? masterMessageBase : 'Current Members: ';
        msg.reply(masterMessageBase + members.map(member => member.username).join(', ')).then(message => {
            masterBaseContent = message.content;
            messages.push(message);
        });
        do {
            msg = yield conversation.next();
            messages.push(msg);
            if (msg.content == '!done') {
                return {value: members, messages: messages};
            } else if (msg.content == '!quit' || msg.content == '!exit') {
                return {exit: true, messages: messages};
            } else {
                if (msg.mentions.length > 0) {
                    for (let i in msg.mentions) {
                        members.push(msg.mentions[i]);
                    }
                    msg.reply(masterMessageBase + members.map(member => member.username).join(', ')).then(messages.push);
                } else {
                    var discriminatorIndex = msg.content.lastIndexOf('#');
                    var users = msg.guild.members;
                    if (discriminatorIndex >= 0) {
                        var username = msg.content.substring(0, discriminatorIndex);
                        var discriminator = msg.content.substring(discriminatorIndex + 1);
                        users = users.filter(member => member.username == username && member.discriminator == discriminator);
                    } else {
                        users = users.filter(member => member.username == msg.content);
                    }
                    if (users.length == 1) {
                        members.push(users[0]);
                        msg.reply(masterMessageBase + members.map(member => member.username).join(', ')).then(messages.push);
                    } else if (users.length > 1) {
                        msg.reply(':x: Multiple users have the name `' + msg.content + '`, please add `#xxxx` to specify which user.').then(messages.push);
                    } else {
                        msg.reply(':x: No users on this server found with the name `' + msg.content + '`').then(messages.push);
                    }
                }
            }
        } while(true);
    }
};

module.exports = Generators;