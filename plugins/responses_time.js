"use strict";

var padTime = function pad(num) {
    var s = "00" + num;
    return s.substr(s.length-2);
};

var API = {
    name: 'Responses-Time',
    responses: [
        {
            name: '^今?何時ですか[。？]?$',
            isEscaped: true,
            callback: function (e) {
                var date = new Date();
                var timezone = date.toLocaleString('en', {timeZoneName: 'short'}).split(' ').pop();
                e.message.reply(date.getHours() + '時' + padTime(date.getMinutes()) + '分 ' + timezone);
            }
        }
    ]
};

module.exports = API;
