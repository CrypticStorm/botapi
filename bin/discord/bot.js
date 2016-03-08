"use strict";

const Discordie = require('discordie');
const Promise = require('promise');
const Login = require('./login');
const MySQL = require('./mysql');
const Commands = require('../cmd/commands');
const Plugins = require('../plugin/plugins');
const fs = require('fs');
const os = require('os');

const Events = Discordie.Events;

const defaultOptions = {
    login: new Login(),
    mysql: new MySQL()
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
        this._database = options.mysql;

        this._commands = new Commands(false, true);
        this._responses = new Commands(true, false);

        this._plugins = new Plugins(this, app);

        this._bot.Dispatcher.on(Events.ANY_GATEWAY_READY, function(e){
            fs.writeFile('cfg/token.txt', this._bot.token, function() {
                console.log('Wrote login token to disk.');
            });
            console.log("Connected as: " + this._bot.User.username);

            this._plugins.enableAll();
        }.bind(this));

        this.addDispatch(Events.MESSAGE_CREATE, this._commands.executor.bind(this._commands, this));
        this.addDispatch(Events.MESSAGE_CREATE, this._responses.executor.bind(this._responses, this));

        process.on('SIGINT', function() {
            console.log('Shutting down');
            this._plugins.removeAll();
            process.exit();
        }.bind(this));
    }

    get app() {
        return this._app;
    }

    get config() {
        return this._config;
    }

    get database() {
        return this._database;
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

    hasPermission(user, permission) {
        if (user.hasOwnProperty('id')) {
            user = user.id;
        }
        if (permission.length > 0) {
            return new Promise(function(fulfill, reject) {
                this._database.query('SELECT `granted` FROM `user_perms` WHERE `user_id` = ? AND `perm_id` = ?;',
                    [user, permission], function (error, results, fields) {
                        if (error) {
                            reject(error);
                        } else {
                            fulfill(results.length > 0);
                        }
                    })
            }.bind(this));
        } else {
            return Promise.resolve(true);
        }
    }

    addCommand(plugin, cmd_options) {
        this._commands.add(plugin, cmd_options);
    }

    addResponse(plugin, cmd_options) {
        this._responses.add(plugin, cmd_options);
    }

    addDispatch(event, func) {
        this._bot.Dispatcher.on(event, func);
    }

    get Guilds() {
        return this._bot.Guilds;
    }

    get Channels() {
        return this._bot.Channels;
    }

    get Users() {
        return this._bot.Users;
    }

    get DirectMessageChannels() {
        return this._bot.DirectMessageChannels;
    }

    get Messages() {
        return this._bot.Messages;
    }

    get Invites() {
        return this._bot.Invites;
    }

    get VoiceConnections() {
        return this._bot.VoiceConnections;
    }
}

module.exports = Bot;