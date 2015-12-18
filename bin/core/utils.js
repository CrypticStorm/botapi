var Utils = {
    escapeRegExp: function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },
    deleteRoute: function(app, url) {
        for (var i = app.routes.get.length - 1; i >= 0; i--) {
            if (app.routes.get[i].path === "/" + url) {
                app.routes.get.splice(i, 1);
            }
        }
    }
};

module.exports = Utils;