"use strict";

class Plugin {
    constructor(manager, pluginDir, json) {
        this.manager = manager;
        this._directory = pluginDir;
        this._loaded = false;
        this._enabled = false;

        for (var key in json) {
            if (!this.hasOwnProperty(key)) {
                if (typeof json[key] === 'function') {
                    this[key] = json[key].bind(this);
                } else {
                    this[key] = json[key];
                }
            } else {
                throw Error('Tried to define a property that already exists: ' + key);
            }
        }

        if (!this.name || !this.version) {
            throw Error('Plugin missing name or version');
        }
    }

    get directory() {
        return this._directory;
    }

    get loaded() {
        return this._loaded;
    }

    set loaded(loaded) {
        this._loaded = loaded;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(enabled) {
        return this._enabled = enabled;
    }

    get router() {
        if (!this._router) {
            this._router = this.manager.newRouter(this);
        }
        return this._router;
    }
}

module.exports = Plugin;