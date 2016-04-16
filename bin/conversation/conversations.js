"use strict";

const Discordie = require('discordie');

const Events = Discordie.Events;

class Conversations {

    constructor(bot) {
        this._bot = bot;
        this._conversations = {};
        bot.addDispatch(Events.MESSAGE_CREATE, (event) => this.handle(event));
    }

    create(user, channel, conversation) {
        if (!this._conversations[user.id + '_' + channel.id]) {
            this._conversations[user.id + '_' + channel.id] = conversation;
            conversation.next();
            return true;
        } else {
            return false;
        }
    }

    handle(event) {
        const conversation = this._conversations[event.message.author.id + '_' + event.message.channel.id];
        if (conversation) {
            const output = conversation.next(event.message);
            if (output.done) {
                delete this._conversations[event.message.author.id + '_' + event.message.channel.id];
            }
        }
    }
}

module.exports = Conversations;