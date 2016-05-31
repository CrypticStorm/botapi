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

        console.log('[Plugins] Created Manager (dir=' + this._directory + ')');

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
        console.log('[Plugins] Loaded ' + this.plugins.length + ' core plugins.');
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
        console.log('[Plugins] Loaded ' + (this.plugins.length - corePlugins) + ' plugins.');
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

    get(name) {
        return this._plugins[name];
    }

    add(name, enable) {
        if (typeof enable === 'undefined') {
            enable = true;
        }
        try {
            var pluginDir = this._coremode ? this._coredirectory : this._directory;
            var path = Path.normalize(pluginDir + '/' + name);
            var pluginJSON = require(path);
            var plugin = new Plugin(this, pluginDir, pluginJSON);

            this._plugins[plugin.name] = plugin;
            this.load(plugin);
            if (enable) {
                this.enable(plugin);
            }
        } catch (e) {
            console.log('Error enabling ' + name + ': ' + e.stack ? e.stack : e);
        }

    }

    remove(name) {
        this.disable(name);
        this.unload(name);
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
            try {
                if (plugin.load) {
                    plugin.load();
                }

                plugin.loaded = true;
                this._plugins[plugin.name] = plugin;
                console.log('[Plugins] Loaded: ' + plugin.name);

                return true;
            } catch (e) {
                console.error('Error loading "' + plugin.name + '"' + e.stack ? e.stack : e);
                return false;
            }
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
            try {
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

                plugin.enabled = true;
                console.log('[Plugins] Enabled: ' + plugin.name);

                return true;
            } catch (e) {
                console.error('Error enabling "' + plugin.name + '"' + e.stack ? e.stack : e);
                return false;
            }
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
            try {
                if (plugin.disable) {
                    plugin.disable();
                }

                this._bot.commands.disable(plugin);
                this._bot.responses.disable(plugin);
                this.removeRouters(plugin);

                plugin.enabled = false;
                console.log('[Plugins] Disabled: ' + plugin.name);

                return true;
            } catch (e) {
                console.error('Error disabling "' + plugin.name + '"' + e.stack ? e.stack : e);
                return false;
            }
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
            try {
                if (plugin.unload) {
                    plugin.unload();
                }

                plugin.loaded = false;
                delete this._plugins[plugin.name];
                console.log('[Plugins] Unloaded: ' + plugin.name);

                return true;
            } catch (e) {
                console.error('Error unloading "' + plugin.name + '"' + e.stack ? e.stack : e);
                return false;
            }
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
        this._pluginRouter.stack.forEach(removeMiddlewares);
        function removeMiddlewares(route, i, routes) {
            if (route.handle.plugin === plugin.name) {
                routes.splice(i, 1);
            }
            if (route.route) {
                route.route.stack.forEach(removeMiddlewares);
            }
        }
    }
}

module.exports = Plugins;