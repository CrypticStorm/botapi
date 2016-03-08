"use strict";

const Plugin = require('./plugin');
const Path = require('path');
const FS = require('fs');

class Plugins {
    constructor(bot, directory) {
        this._bot = bot;
        this._coredirectory = Path.resolve('./bin/core/plugins');
        this._directory = Path.resolve('.', directory ? directory : './plugins');
        this._plugins = {};

        console.log('Created Plugin Manager (dir=' + this._directory + ')');

        this._coremode = true;
        this._loadCorePlugins();
        this._coremode = false;
        this._loadPlugins();
    }

    _loadCorePlugins() {
        var files = [];
        FS.readdirSync(this._coredirectory).forEach(function(filename) {
            if (filename.endsWith('.js')) {
                var file = Path.join(this._coredirectory, filename);
                var stat = FS.statSync(file);
                if (stat && !stat.isDirectory()) {
                    files.push(filename);
                }
            }
        }.bind(this));
        for(var i in files) {
            if (files.hasOwnProperty(i)) {
                try {
                    this.add(files[i].substring(0, files[i].length-3), true, true);
                } catch(err) {
                    console.log('Error loading core plugin: ' + files[i]);
                    console.log(err);
                }
            }
        }
        console.log('Loaded ' + this.plugins.length + ' core plugins.');
        console.log('Enabled ' + this.active.length + ' core plugins.');
    }

    _loadPlugins() {
        var corePlugins = this.plugins.length;
        var activeCorePlugins = this.active.length;
        var files = [];
        FS.readdirSync(this._directory).forEach(function(filename) {
            if (filename.endsWith('.js')) {
                var file = Path.join(this._directory, filename);
                var stat = FS.statSync(file);
                if (stat && !stat.isDirectory()) {
                    files.push(filename);
                }
            }
        }.bind(this));
        for(var i in files) {
            if (files.hasOwnProperty(i)) {
                try {
                    this.add(files[i].substring(0, files[i].length-3), true, false);
                } catch(err) {
                    console.log('Error loading plugin: ' + files[i]);
                    console.log(err);
                }
            }
        }
        console.log('Loaded ' + (this.plugins.length - corePlugins) + ' plugins.');
        console.log('Enabled ' + (this.active.length - activeCorePlugins) + ' plugins.');
    }

    get bot() {
        return this._bot;
    }

    get plugins() {
        return Object.keys(this._plugins).sort().map(function(key) {return this._plugins[key]}.bind(this));
    }

    get active() {
        return this.plugins.filter(function(plugin) {return plugin.enabled});
    }

    add(name, enable, lock) {
        if (typeof enable === 'undefined') {
            enable = true;
        }
        var path = Path.normalize((this._coremode ? this._coredirectory : this._directory) + '/' + name);
        var plugin = new Plugin(path, lock && this._coremode);
        if (!this._plugins.hasOwnProperty(plugin.name)) {
            this._plugins[plugin.name] = plugin;
            plugin.load(this);
            if (enable) {
                this.enable(plugin);
            }
        }
    }

    remove(name) {
        var plugin = this._plugins[name];
        if (plugin && !plugin.locked) {
            plugin.disable(this);
            plugin.unload(this);
            delete this._plugins[name];
        }
    }

    enable(name) {
        var plugin = name;
        if (typeof name === 'string') {
            plugin = this._plugins[name]
        }
        if (plugin) {
            if (plugin.enable(this)) {
                var commands = plugin.commands;
                for (var i in commands) {
                    if (commands.hasOwnProperty(i)) {
                        this._bot.addCommand(plugin, commands[i]);
                    }
                }
                var responses = plugin.responses;
                for (var i in responses) {
                    if (responses.hasOwnProperty(i)) {
                        this._bot.addResponse(plugin, responses[i]);
                    }
                }
                console.log('Enabled Plugin: ' + plugin.name)
            }
        }
    }

    disable(name) {
        var plugin = name;
        if (typeof name === 'string') {
            plugin = this._plugins[name]
        }
        if (plugin && !plugin.locked) {
            if (plugin.disable(this)) {
                this._bot.commands.disable(plugin);
                this._bot.responses.disable(plugin);
                console.log('Disabled Plugin: ' + plugin.name)
            }
        }
    }

    reload(name, unsafe) {
        var plugin = name;
        if (typeof name === 'string') {
            plugin = this._plugins[name]
        }
        if (plugin && (unsafe || !plugin.locked)) {
            var enabled = plugin.enabled;
            this.remove(name);
            this.add(name, enabled);
        }
    }
}

module.exports = Plugins;