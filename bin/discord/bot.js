"use strict";

const Discordie = require('discordie');
const Login = require('./login');
const Commands = require('../cmd/commands');
const Plugins = require('../plugin/plugins');
const fs = require('fs');
const os = require('os');

const Events = Discordie.Events;

const defaultOptions = {
    login: new Login(),
};

class Bot {
    constructor(app, options) {
        if (!options) {
            options = defaultOptions;
        }
        this._app = app;

        this._bot = new Discordie();
        this._bot.connect(options.login, false);

        this._config = {};

        this._commands = new Commands(false);
        this._responses = new Commands(true);

        this._plugins = new Plugins(this);

        this._bot.Dispatcher.on(Events.ANY_GATEWAY_READY, function(e){
            fs.writeFile('cfg/login.txt', this._bot.token, function() {
                console.log('Wrote login token to disk.');
            });
            console.log("Connected as: " + this._bot.User.username);
        }.bind(this));

        this._bot.Dispatcher.on(Events.MESSAGE_CREATE, this._commands.executor.bind(this._commands, this));
        this._bot.Dispatcher.on(Events.MESSAGE_CREATE, this._responses.executor.bind(this._responses, this));

        this._config.admins = [];
        var admin_lines = fs.readFileSync('cfg/admins.txt', 'utf-8').split(os.EOL);
        for (var i = 0; i < admin_lines.length; i++) {
            this._config.admins.push(admin_lines[i]);
        }
        console.log('Loaded ' + admin_lines.length + ' admins.');

        this._config.nomention = [];
        var nomention_lines = fs.readFileSync('cfg/nomention.txt', 'utf-8').split(os.EOL);
        for (var i = 0; i < nomention_lines.length; i++) {
            this._config.nomention.push(nomention_lines[i]);
        }
        console.log('Loaded ' + nomention_lines.length + ' nomention users.');
    }

    get app() {
        return this._app;
    }

    get config() {
        return this._config;
    }

    get client() {
        return this._bot;
    }

    get plugins() {
        return this._plugins;
    }

    get commands() {
        return this._commands;
    }

    get responses() {
        return this._responses;
    }

    isAdmin(user) {
        if (typeof user === 'number') {
            return ~this._config.admins.indexOf(user);
        } else if (user.hasOwnProperty('id')) {
            return ~this._config.admins.indexOf(user.id);
        } else {
            return 0;
        }
    }

    noMention(user) {
        if (this.isAdmin(user)) {
            return true;
        } else if (typeof user === 'number') {
            return ~this._config.nomention.indexOf(user);
        } else if (user.hasOwnProperty('id')) {
            return ~this._config.nomention.indexOf(user.id);
        } else {
            return 0;
        }
    }

    addCommand(plugin, cmd_options) {
        this._commands.add(plugin, cmd_options);
    }

    addResponse(plugin, cmd_options) {
        this._responses.add(plugin, cmd_options);
    }
}

module.exports = Bot;