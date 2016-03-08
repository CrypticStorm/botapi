"use strict";

var OPM = {
    name: '1pun.ch',
    commands: [
        {
            name: '1p',
            callback: function (e) {
                var request = require('request');
                var args = e.message.content.split(" ");
                var cmdIndex = args.indexOf('1p');
                if (cmdIndex < args.length - 1) {
                    var arg = args[cmdIndex + 1];
                    request.post({
                        url: "http://1pun.ch/slack",
                        form: {text: arg}
                    }, function (error, response, body) {
                        if (error) {
                            console.log(error);
                        } else {
                            var data = JSON.parse(body);
                            if (data.error) {
                                e.message.channel.sendMessage(data.text);
                            } else {
                                var img = request(data.text);
                                var filename = data.text.substring(data.text.lastIndexOf("/") + 1);
                                e.message.channel.uploadFile(img, filename);
                            }
                        }
                    });
                } else {
                    e.message.reply('Images served from http://1pun.ch/');
                }
            }
        }
    ]
};

module.exports = OPM;
