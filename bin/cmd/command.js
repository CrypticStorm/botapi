"use strict";

const Utils = require('../core/utils');

class Command {
    constructor(plugin, options, regex) {
        if (!options.hasOwnProperty('name')) {
            throw 'no name';
        }
        if (!options.hasOwnProperty('aliases')) {
            options.aliases = [];
        }
        this._plugin = plugin;
        this._name = !regex || options.isEscaped ? options.name : '^' + Utils.escapeRegExp(options.name) + '$';
        this._aliases = !regex || options.isEscaped ? options.aliases : options.aliases.map(function(alias) {return '^' + Utils.escapeRegExp(alias) + '$'});
        this._admin = (typeof options.admin === 'undefined') ? false : options.admin;
        this._help = options.help ? options.help : "";
        this._callback = options.callback ? options.callback : function(){}
    }

    get plugin() {
        return this._plugin;
    }

    get name() {
        return this._name;
    }

    get aliases() {
        return this._aliases;
    }

    get admin() {
        return this._admin;
    }

    get help() {
        return this._help;
    }

    get callback() {
        return this._callback;
    }
}

module.exports = Command;