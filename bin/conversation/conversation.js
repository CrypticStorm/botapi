"use strict";

class Conversation {

    constructor() {
        this._message = null;
    }

    get messages() {
        return this._messages;
    }

    get next() {
        const self = this;
        return new Promise((fulfill, reject) => {
            console.log('waiting');
            while (self._message == null);
            console.log('waiting over');
            var message = self._message;
            self._message = null;
            fulfill(message);
        });
    }

    fulfill(message) {
        this._message = message;
    }
}

module.exports = Conversation;