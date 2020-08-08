const debug = require('../src/functions/debug');

const ControllPlugin = require('./abstracts/plugin')

class plugin extends ControllPlugin {
    name() {
        return "Monitoring"
    }
    init() {
        debug.log("looking for monitoring platforms ...")
    }
}

module.exports = plugin