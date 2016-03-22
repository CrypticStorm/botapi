"use strict";

class Plugin {
    constructor(manager, name, version) {
        this.manager = manager;
        this.name = name;
        this.version = version;
        this._loaded = false;
        this._enabled = false;
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