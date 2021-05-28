const { sendEmbed } = require("../util.js")
const { runCommand } = require("../features/commands.js")

module.exports = {
    name: "config",
    description: "Get info about the bot",
    category: "Management",
    paramiters: "(Get, Set) {Key (Set)} {Value (Set)}",
    requiredPermissions: ["MANAGE_SERVER"],
    worksInDms: false,
    callback: (message, args, client, config) => {
        if (args[0] == "get") {
            var helpText = ""
            
            function decode(parent, indent) {
                for (var key of Object.keys(parent)) {
                   if (parent[key] == "[object Object]") { helpText += indent + key + ":\n"; decode(parent[key], indent + "  "); continue }
 
                    helpText += indent + key + " - " + parent[key] + "\n"
                }
            }
            decode(config, "")

            helpText = helpText.replace(/, /ig, ",").replace(/,/ig, ", ")
            
            sendEmbed(message.channel, message.author, config, "Config", helpText)
        } else if (args[0] == "set") {
            if (args.length < 3) { var newMessage = message; newMessage.content = config.prefix + "help " + module.exports.name; runCommand(newMessage, config); return }
            
            var keys = args[1].split(".")
            var value = args[2]
            
            var configKey = config
            
            keys.forEach(key => {
                if (key != keys[keys.length - 1]) configKey = configKey[key]
            })
            
            fs.writeFileSync("../config.json", config)
            
            configKey = value
        } else {
            var newMessage = message
            newMessage.content = config.prefix + "help " + module.exports.name
            runCommand(newMessage, config)
        }
    }
}
