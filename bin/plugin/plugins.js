"use strict";

const Express = require('express');
const Plugin = require('./plugin');
const Path = require('path');
const FS = require('fs');

class Plugins {
    constructor(bot, app, directory) {
        this._bot = bot;
        this._coredirectory = Path.resolve('./bin/core/plugins');
        this._directory = Path.resolve('.', directory ? directory : './plugins');
        this._plugins = {};
        this._pluginRouter = Express.Router();
        app.use(this._pluginRouter);

        console.log('Created Plugin Manager (dir=' + this._directory + ')');

        this._coremode = true;
        this._loadCorePlugins();
        this._coremode = false;
        this._loadPlugins();
        delete this._coremode;
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
                    this.add(files[i].substring(0, files[i].length-3), false, true);
                } catch(err) {
                    console.log('Error loading core plugin: ' + files[i]);
                    console.log(err);
                }
            }
        }
        console.log('Loaded ' + this.plugins.length + ' core plugins.');
    }

    _loadPlugins() {
        var corePlugins = this.plugins.length;
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
                    this.add(files[i].substring(0, files[i].length-3), false, false);
                } catch(err) {
                    console.log('Error loading plugin: ' + files[i]);
                    console.log(err);
                }
            }
        }
        console.log('Loaded ' + (this.plugins.length - corePlugins) + ' plugins.');
    }

    get bot() {
        return this._bot;
    }

    get plugins() {
        return Object.keys(this._plugins).sort().map(key => this._plugins[key]);
    }

    get active() {
        return this.plugins.filter(plugin => plugin.enabled);
    }

    add(name, enable) {
        if (typeof enable === 'undefined') {
            enable = true;
        }
        var path = Path.normalize((this._coremode ? this._coredirectory : this._directory) + '/' + name);
        var pluginClass = require(path);
        var plugin = pluginClass(this);

        this._plugins[plugin.name] = plugin;
        this.load(plugin);
        if (enable) {
            this.enable(plugin);
        }
    }

    remove(name) {
        var plugin = this._plugins[name];
        if (plugin) {
            this.disable(plugin);
            this.unload(plugin);
        }
    }

    enableAll() {
        for (var i in this._plugins) {
            this.enable(this._plugins[i]);
        }
    }

    disableAll() {
        for (var i in this._plugins) {
            this.disable(this._plugins[i]);
        }
    }

    removeAll() {
        for (var i in this._plugins) {
            this.remove(this._plugins[i]);
        }
    }

    load(name) {
        var plugin = name;
        if (typeof name === 'string') {
            plugin = this._plugins[name]
        }

        if (plugin && !plugin.loaded) {
            if (plugin.load) {
                plugin.load();
            }

            this._plugins[plugin.name] = plugin;
            console.log('Loaded Plugin: ' + plugin.name);

            return true;
        } else {
            return false;
        }
    }

    enable(name) {
        var plugin = name;
        if (typeof name === 'string') {
            plugin = this._plugins[name]
        }

        if (plugin && plugin.loaded && !plugin.enabled) {
            var self = this;

            if (plugin.enable) {
                plugin.enable();
            }

            if (plugin.commands) {
                plugin.commands.forEach(cmd => self._bot.addCommand(plugin, cmd));
            }

            if (plugin.responses) {
                plugin.responses.forEach(cmd => self._bot.addResponse(plugin, cmd));
            }

            console.log('Enabled Plugin: ' + plugin.name);

            return true;
        } else {
            return false;
        }
    }

    disable(name) {
        var plugin = name;
        if (typeof name === 'string') {
            plugin = this._plugins[name]
        }

        if (plugin && plugin.loaded && plugin.enabled) {
            if (plugin.disable) {
                plugin.disable();
            }

            this._bot.commands.disable(plugin);
            this._bot.responses.disable(plugin);
            this.removeRouters(plugin);

            console.log('Disabled Plugin: ' + plugin.name);

            return true;
        } else {
            return false;
        }
    }

    unload(name) {
        var plugin = name;
        if (typeof name === 'string') {
            plugin = this._plugins[name]
        }

        if (plugin && plugin.loaded) {
            if (plugin.unload) {
                plugin.unload();
            }

            delete this._plugins[plugin.name];
            console.log('Unloaded Plugin: ' + plugin.name);

            return true;
        } else {
            return false;
        }
    }

    reload(name) {
        var plugin = name;
        if (typeof name === 'string') {
            plugin = this._plugins[name]
        }

        if (plugin) {
            var enabled = plugin.enabled;
            this.remove(name);
            this.add(name, enabled);
            return true;
        } else {
            return false;
        }
    }

    newRouter(plugin) {
        var router = Express.Router();
        Object.defineProperty(router, 'plugin', {
            value: plugin.name,
            writable: false
        });
        this._pluginRouter.use(router);
        return router;
    }

    removeRouters(plugin) {
        for (var i = this._pluginRouter.length - 1; i >= 0; i--) {
            var layer = this._pluginRouter.stack[i];
            if (layer.handle.plugin === plugin.name) {
                this._pluginRouter.stack.slice(i, 1);
            }
        }
    }
}

module.exports = Plugins;