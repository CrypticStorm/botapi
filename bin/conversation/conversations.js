"use strict";

const Discordie = require('discordie');
const Conversation = require('./conversation');

const Events = Discordie.Events;

class Conversations {

    constructor(bot) {
        this._bot = bot;
        this._conversations = {};
        bot.addDispatch(Events.MESSAGE_CREATE, (event) => this.handle(event));
    }

    //create(user, channel, generator) {
    //    const conversation = Conversation(generator);
    //    if (!this._conversations[user.id + '_' + channel.id]) {
    //        this._conversations[user.id + '_' + channel.id] = generator;
    //        generator.next();
    //        return true;
    //    } else {
    //        return false;
    //    }
    //}

    create(user, channel) {
        const conversation = new Conversation();
        if (!this._conversations[user.id + '_' + channel.id]) {
            console.log('Created ' + user.id + '_' + channel.id);
            this._conversations[user.id + '_' + channel.id] = conversation;
            return conversation;
        } else {
            return null;
        }
    }

    handle(event) {
        //console.log('Handling ' + event.message.author.id + '_' + event.message.channel.id);
        const conversation = this._conversations[event.message.author.id + '_' + event.message.channel.id];
        if (conversation) {
            console.log('fulfilling');
            conversation.fulfill();
        }
        //if (conversation) {
        //    try {
        //        const output = conversation.next(event.message);
        //        if (output.done) {
        //            delete this._conversations[event.message.author.id + '_' + event.message.channel.id];
        //        }
        //    } catch (e) {
        //        delete this._conversations[event.message.author.id + '_' + event.message.channel.id];
        //        console.error(e.stack ? e.stack : e);
        //    }
        //}
    }

    end(user, channel) {
        delete this._conversations[user.id + '_' + channel.id];
    }
}

module.exports = Conversations;