var Utils = {
    escapeRegExp: function(str){
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
};

module.exports = Utils;