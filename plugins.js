const monitors = require('./src/functions/monitors');
const ssh = require('./src/functions/ssh');
const debug = require('./src/functions/debug');
const socketio = require('./src/functions/socket');

debug.log("loading plugins...")
var normalizedPath = require("path").join(__dirname, "plugins");
plugins = []
require("fs").readdirSync(normalizedPath).forEach(function (file) {
    if (file.endsWith(".js")) {
        var plugin_file = require("./plugins/" + file);
        plugin = new plugin_file();
        debug.log("loaded", plugin.name(), "(", file, ")")
        plugins.push({
            "plugin": plugin
        })
    }
});
debug.log("plugins loaded")