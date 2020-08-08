class ControllPlugin {

    constructor() {
        this.init()
    }
    name() {
        return "dummy plugin"
    }
    args() {
        return {}
    }
    channelName() {
        return "DUMMY"
    }
    init() {
        console.log("resolved")
    }
}

module.exports = ControllPlugin