"use strict";

const FS = require('fs');
const EOL = require('os').EOL;

var API = {
    name: 'Responses-日本語',
    responses: [
        {
            name: '^$',
            isEscaped: true,
            callback: function(e, bot) {
                if (!e.message.attachments.length) {
                    e.message.channel.sendMessage('何？')
                }
            }
        }
    ],
    enable: function(manager) {
        var text = FS.readFileSync('cfg/responses.txt', 'utf-8');
        var lines = text.split(EOL);

        var toggle = true;
        var input = '';
        var output = '';
        for (var i = 0; i < lines.length; i++) {
            if (toggle) {
                input = lines[i];
                toggle = false;
            } else if (lines[i]) {
                output += lines[i] + '\n';
            } else {
                const r_input = input.trim();
                const r_output = output.trim();
                manager.bot.addResponse(this, {
                    name: r_input,
                    isEscaped: true,
                    callback: function (e, bot) {
                        e.message.channel.sendMessage(r_output);
                    }
                });
                toggle = true;
                input = '';
                output = '';
            }
        }
    }
};

module.exports = API;
