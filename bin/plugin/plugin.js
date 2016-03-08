"use strict";

class Plugin {
    constructor(manager, filepath, lock) {
        this._manager = manager;
        this._internal = require(filepath);
        this._loaded = false;
        this._enabled = false;
        this._locked = lock ? true : false;

        if (!this._internal.hasOwnProperty('name')) {
            throw 'no name';
        }
        if (!this._internal.hasOwnProperty('load') && !this._internal.hasOwnProperty('enable') && !this._internal.hasOwnProperty('commands') && !this._internal.hasOwnProperty('responses')) {
            throw 'no load or enable';
        }
    }

    get manager() {
        return this._manager;
    }

    get name() {
        return this._internal.name;
    }

    get version() {
        if (this._internal.version) {
            return this._internal.version;
        } else {
            return undefined;
        }
    }

    get locked() {
        return this._locked;
    }

    get loaded() {
        return this._loaded;
    }

    get enabled() {
        return this._enabled;
    }

    get router() {
        if (!this._router) {
            this._router = this._manager.newRouter(this);
        }
        return this._router;
    }

    get commands() {
        if (this._internal.hasOwnProperty('commands')) {
            return this._internal.commands;
        } else {
            return [];
        }
    }

    get responses() {
        if (this._internal.hasOwnProperty('responses')) {
            return this._internal.responses;
        } else {
            return [];
        }
    }

    load() {
        if (this._loaded) {
            return false;
        }
        if (this._internal.hasOwnProperty('load')) {
            var func = this._internal.load.bind(this);
            if (typeof func === 'function') {
                func();
            }
        }
        this._loaded = true;
        return true;
    }

    unload() {
        if (!this._loaded) {
            return false;
        }
        if (this._internal.hasOwnProperty('unload')) {
            var func = this._internal.unload.bind(this);
            if (typeof func === 'function') {
                func();
            }
        }
        this._loaded = false;
        return true;
    }

    enable() {
        if (!this._loaded) {
            return false;
        }
        if (this._enabled) {
            return false;
        }
        if (this._internal.hasOwnProperty('enable')) {
            var func = this._internal.enable.bind(this);
            if (typeof func === 'function') {
                func();
            }
        }
        this._enabled = true;
        return true;
    }

    disable() {
        if (!this._loaded) {
            return false;
        }
        if (!this._enabled) {
            return false;
        }
        if (this._internal.hasOwnProperty('disable')) {
            var func = this._internal.disable.bind(this);
            if (typeof func === 'function') {
                func();
            }
        }
        this._enabled = false;
        return true;
    }
}

module.exports = Plugin;