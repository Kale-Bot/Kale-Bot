const { runCommand } = require("../features/commands.js")

module.exports = {
    name: "config",
    description: "Get info about the bot",
    category: "Management",
    paramiters: "(Get, Set) {Key} {Value (Set)}",
    requiredPermissions: [],
    worksInDms: false,
    callback: (message, args, client, config) => {
        if (args[0] == "get") {
            for (var key of Object.keys(config)) {
                
            }
        } else if (args[0] == "set") {
            
        } else {
            var newMessage = message
            newMessage.content = config.prefix + "help " + this.name
            runCommand(newMessage, config)
        }
    }
}
